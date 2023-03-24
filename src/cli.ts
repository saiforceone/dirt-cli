import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

import ConsoleLogger from './utils/ConsoleLogger.js';
import { preScaffold } from './preScaffold.js';
import { postScaffold } from './postScaffold.js';
import { validateProjectName } from './utils/validateProjectName.js';
import { setupGitRepo } from './setupGitRepo.js';
import LogType = DIRTStackCLI.LogType;
import ScaffoldOptions = DIRTStackCLI.ScaffoldOptions;

const { scaffoldDjango } = await import('./scaffoldDjango.js');
const { scaffoldReact } = await import('./scaffoldReact.js');
type TODO = any;

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
      validate: function (input: string) {
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
 * @param {LogType} logType
 * @param {ScaffoldOptions} options
 * @returns {*|(function(): Promise<*>)}
 */
function scaffoldFuncs(logType: LogType, options: ScaffoldOptions) {
  const funcs = {
    noisyLogs: async function () {
      const djangoResult = await scaffoldDjango(options);

      ConsoleLogger.printMessage(`Django setup status: ${djangoResult.result}`);

      if (!djangoResult.success) {
        process.exit(1);
      }

      // Scaffold the React (FE) application
      const reactResult: TODO = await scaffoldReact(options);

      ConsoleLogger.printMessage(`React FE Status: ${reactResult.result}`);

      if (!reactResult.success) {
        process.exit(1);
      }

      if (options['initializeGit']) {
        ConsoleLogger.printMessage('Initializing git...');
        const gitResult: TODO = await setupGitRepo();

        ConsoleLogger.printMessage(
          gitResult.success
            ? 'Done'
            : 'Failed to initialize git. You might want to try running the command yourself',
          gitResult.success ? 'success' : 'warning'
        );
      }
    },
    quietLogs: async function () {
      const djangoSpinner = ora('Setting up Django...');
      const frontendSpinner = ora(
        `Setting up Frontend (${chalk.green(options['frontend'])})...`
      );
      const gitSpinner = ora('Setting up git in your project...');
      try {
        djangoSpinner.start();
        const djangoResult = await scaffoldDjango(options);
        djangoResult.success
          ? djangoSpinner.succeed()
          : djangoSpinner.fail('Failed to setup Django. See below.');
        if (!djangoResult.success) {
          console.log(`${chalk.red(`Error: ${djangoResult.error}`)}`);
          process.exit(1);
        }
        frontendSpinner.start();
        const frontendResult: any = await scaffoldReact(options);
        frontendResult.success
          ? frontendSpinner.succeed()
          : frontendSpinner.fail('Failed to setup Frontend. See below.');
        if (!frontendResult.success) {
          console.log(`
          ${chalk.red(`Error: ${frontendResult.error}`)}
          `);
          process.exit(1);
        }

        if (options['initializeGit']) {
          gitSpinner.start();
          const gitResult: any = await setupGitRepo();
          gitResult.success
            ? gitSpinner.succeed()
            : gitSpinner.warn(gitResult.error);
        }
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
 * @returns {Promise<void>}
 */
export async function cli() {
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

  console.log(`Setting up project with log mode: ${chalk.blue(
    options['verboseLogs'] ? 'Verbose' : 'Quiet'
  )}
  `);

  // Call scaffold functions based on log type selection
  await scaffoldFuncs(logType, options)();

  // print post scaffold message
  postScaffold(options);
}
