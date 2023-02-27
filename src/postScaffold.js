import chalk from 'chalk';
import ConsoleLogger from './utils/ConsoleLogger.js';

/**
 * @description Prints out information after the scaffolding process has completed including
 * information like what to do next, where to get help, etc
 * @param options
 * @returns {Promise<void>}
 */
export function postScaffold(options) {
  const storybookInstructions = `
 ${chalk.blue.underline('Running Storybook')}\n
 Since you have used the Storybook option, please see below for instructions:\n
 1. In a separate terminal, run Storybook: ${chalk.green("'npm run storybook'")}
`;

  console.log(`
 ${chalk.green.bold('Ready to get D.I.R.T-y?')}\n
 ${chalk.underline.blue('Installation Summary')}\n
 Project Name: ${chalk.blue(options['projectName'])}
 Frontend: ${chalk.blue(options['frontend'])}
 Storybook Enabled: ${
   options['withStorybook'] ? chalk.green('Yes') : chalk.dim('No')
 }\n
 ${chalk.blue.underline('What do next')}\n
 1. navigate to: ${chalk.green(options['projectName'])}
 2. activate pipenv: ${chalk.green("'pipenv shell'")}
 3. run the project: ${chalk.green("'npm run dirt-dev'")}
${options['withStorybook'] ? storybookInstructions : ''}
`);
}
