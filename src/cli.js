import chalk from 'chalk';
import cliSpinners from 'cli-spinners';
import inquirer from 'inquirer';
import { oraPromise } from 'ora';

import ConsoleLogger from './utils/ConsoleLogger.js';
const { scaffoldDjango } = await import('./scaffoldDjango.js');
const { scaffoldReact } = await import('./scaffoldReact.js');
import { preScaffold } from './preScaffold.js';
import { postScaffold } from './postScaffold.js';
import { validateProjectName } from './utils/validateProjectName.js';

/**
 * @description Prompt the user when setting up a new DIRT Stack project
 * @returns {Promise<*>}
 */
async function cliPrompts() {
  const prompts = [
    {
      message: 'What should we call this project?',
      name: 'projectName',
      type: 'input',
      validate: function (input) {
        return !!validateProjectName(input) ? true : 'Not a valid project name';
      },
    },
    {
      choices: ['react'],
      message: 'Select a frontend framework / library',
      name: 'frontend',
      type: 'list',
    },
    {
      default: false,
      message: 'Would you like to use StorybookJS?',
      name: 'withStorybook',
      type: 'confirm',
    },
    {
      default: false,
      message: 'Would you like to have git initialized?',
      name: 'initializeGit',
      type: 'confirm',
    },
    {
      default: false,
      message: 'Show verbose logs?',
      name: 'verboseLogs',
      type: 'confirm',
    },
  ];
  return await inquirer.prompt(prompts);
}

/**
 * @description Helper function that handles if we should show quiet or noisy logs
 * @param logType
 * @param options
 * @returns {*|(function(): Promise<*>)}
 */
function scaffoldFuncs(logType, options) {
  const funcs = {
    noisyLogs: async function () {
      const djangoResult = await scaffoldDjango(options);

      ConsoleLogger.printMessage(`Django setup status: ${djangoResult.result}`);

      if (!djangoResult.success) {
        process.exit(1);
      }

      // Scaffold the React (FE) application
      const reactResult = await scaffoldReact(options);

      ConsoleLogger.printMessage(`React FE Status: ${reactResult.result}`);

      if (!reactResult.success) {
        process.exit(1);
      }
    },
    quietLogs: async function () {
      try {
        await oraPromise(
          scaffoldDjango(options),
          'Setting up Django project...'
        );
        await oraPromise(scaffoldReact(options), 'Setting up React project...');
      } catch (e) {
        console.log(`
        ${chalk.red(`Failed to scaffold project with error: ${e.toString()}`)}
        `);
        process.exit(1);
      }
    },
  };

  return funcs[logType] ? funcs[logType] : funcs['quietLogs'];
}

/**
 * @description entry point for the application / util. Scaffolding of the different parts of
 * a D.I.R.T Stack application happens here
 * @param args
 * @returns {Promise<void>}
 */
export async function cli(args) {
  // print welcome message
  preScaffold();

  // process prompts
  let options = await cliPrompts();

  // print welcome
  console.log(
    `${chalk.green.italic('\nSetting up your D.I.R.T Stack application...')}`
  );

  // Scaffolds the Django (core) application and sets up base structure
  const logType = options['verboseLogs'] ? 'noisyLogs' : 'quietLogs';

  console.log(`
  Setting up project with log mode: ${chalk.blue(
    options['verboseLogs'] ? 'Verbose' : 'Quiet'
  )}
  `);

  // Call scaffold functions based on log type selection
  await scaffoldFuncs(logType, options)();

  // print post scaffold message
  postScaffold(options);
}
