import arg from 'arg';
import inquirer from 'inquirer';

const { scaffoldDjango } = await import('./scaffoldDjango.js');

/**
 * @description Parses CLI arguments and returns a convenient object we can use
 * @param rawArgs
 * @returns {{withPipenv: boolean, projectName: string, withStorybook: boolean}}
 */
function parseArgs(rawArgs) {
  const args = arg(
    {
      '--withStorybook': Boolean,
      '--withPipenv': Boolean,
      '--sb': '--withStorybook',
    },
    {
      argv: rawArgs.slice(2),
    }
  );

  return {
    projectName: args._[0],
    withStorybook: args['--withStorybook'] || false,
    withPipenv: args['--withPipenv'] || false,
  };
}

/**
 * @description Triggers the prompt if the user has forgotten to enter the project name
 * @param options
 * @returns {Promise<*&{projectName: *}>}
 */
async function promptForMissingOpts(options) {
  const prompts = [];
  if (!options['projectName']) {
    prompts.push({
      type: 'string',
      name: 'projectName',
      message: 'What should we call this project? (no spaces, no dashes)',
    });
  }
  const answers = await inquirer.prompt(prompts);
  return {
    ...options,
    projectName: options.projectName || answers.projectName,
  };
}

/**
 * @description entry point for the application / util. Scaffolding of the different parts of
 * a D.I.R.T Stack application happens here
 * @param args
 * @returns {Promise<void>}
 */
export async function cli(args) {
  let options = parseArgs(args);
  options = await promptForMissingOpts(options);
  // Scaffolds the Django (core) application and sets up base structure
  const djangoResult = await scaffoldDjango(options);
  console.log(`Django setup status: ${djangoResult.result}`);
  // Scaffold the React (FE) application
}
