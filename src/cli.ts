import chalk from 'chalk';
import type { Answers, QuestionCollection } from 'inquirer';
import inquirer from 'inquirer';
import ora from 'ora';

import ConsoleLogger from './utils/ConsoleLogger.js';
import { preScaffold } from './preScaffold.js';
import { postScaffold } from './postScaffold.js';
import { validateProjectName } from './utils/validateProjectName.js';
import { setupGitRepo } from './setupGitRepo.js';
import { setupPrettier } from './setupPrettier.js';

import { scaffoldChecks } from './scaffoldChecks.js';
import LogType = DIRTStackCLI.LogType;
import ScaffoldOptions = DIRTStackCLI.ScaffoldOptions;
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;

const { scaffoldDjango } = await import('./scaffoldDjango.js');
const { scaffoldFrontend } = await import('./scaffoldFrontend.js');

/**
 * @description Prompt the user when setting up a new DIRT Stack project
 */
async function cliPrompts(): Promise<Answers> {
  const prompts: QuestionCollection = [
    {
      message: 'What should we call this project?',
      name: 'projectName',
      type: 'input',
      validate: function (input: string) {
        return validateProjectName(input) ? true : 'Not a valid project name';
      },
    },
    {
      choices: ['react', 'vue'],
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
      message: 'Would you like to install Prettier?',
      name: 'installPrettier',
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
  return inquirer.prompt(prompts);
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

      // Scaffold the Frontend application
      const frontendResult: ScaffoldOutput = await scaffoldFrontend(options);

      ConsoleLogger.printMessage(
        `${options.frontend} frontend Status: ${frontendResult.result}`
      );

      if (!frontendResult.success) {
        process.exit(1);
      }

      if (options['installPrettier']) {
        // todo: check if we are in the correct path for windows and posix systems
        ConsoleLogger.printMessage('Installing prettier...');
        const prettierResult = await setupPrettier(process.cwd());
        ConsoleLogger.printMessage(
          prettierResult.success
            ? 'Done'
            : `Failed to install Prettier with error: ${prettierResult.error}. You might want to try installing it manually`,
          prettierResult.success ? 'success' : 'warning'
        );
      }

      if (options['initializeGit']) {
        ConsoleLogger.printMessage('Initializing git...');
        const gitResult: ScaffoldOutput = await setupGitRepo();

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
      const prettierSpinner = ora('Setting up prettier in your project...');
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
        const frontendResult: ScaffoldOutput = await scaffoldFrontend(options);
        frontendResult.success
          ? frontendSpinner.succeed()
          : frontendSpinner.fail('Failed to setup Frontend. See below.');
        if (!frontendResult.success) {
          console.log(`
          ${chalk.red(`Error: ${frontendResult.error}`)}
          `);
          process.exit(1);
        }

        if (options['installPrettier']) {
          // todo: check if we are in the correct path for windows and posix systems
          prettierSpinner.start();
          const prettierResult = await setupPrettier(process.cwd());
          prettierResult.success
            ? prettierSpinner.succeed()
            : prettierSpinner.warn(prettierResult.error);
        }

        if (options['initializeGit']) {
          gitSpinner.start();
          const gitResult: ScaffoldOutput = await setupGitRepo();
          gitResult.success
            ? gitSpinner.succeed()
            : gitSpinner.warn(gitResult.error);
        }
      } catch (e) {
        console.log(`
        ${chalk.red(
          `Failed to scaffold project with error: ${(e as Error).message}`
        )}
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
  const options = await cliPrompts();

  // environment checks
  scaffoldChecks(options as ScaffoldOptions);

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
  await scaffoldFuncs(logType, options as ScaffoldOptions)();

  // print post scaffold message
  postScaffold(options as ScaffoldOptions);
}
