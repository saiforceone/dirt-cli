import arg from 'arg';
import inquirer from 'inquirer';
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
  ];
  return await inquirer.prompt(prompts);
}

/**
 * @description entry point for the application / util. Scaffolding of the different parts of
 * a D.I.R.T Stack application happens here
 * @param args
 * @returns {Promise<void>}
 */
export async function cli(args) {
  preScaffold();
  let options = await cliPrompts();
  // print welcome
  ConsoleLogger.printMessage(
    'Preparing to set up your D.I.R.T Stack application...'
  );
  // Scaffolds the Django (core) application and sets up base structure
  const djangoResult = await scaffoldDjango(options);
  ConsoleLogger.printMessage(`Django setup status: ${djangoResult.result}`);
  // Scaffold the React (FE) application
  const reactResult = await scaffoldReact(options);
  ConsoleLogger.printMessage(`React FE Status: ${reactResult.result}`);
  postScaffold(options);
}
