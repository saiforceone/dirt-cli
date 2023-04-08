import chalk from 'chalk';
import ScaffoldOptions = DIRTStackCLI.ScaffoldOptions;

/**
 * @description Prints out information after the scaffolding process has completed including
 * information like what to do next, where to get help, etc
 * @param options
 * @returns {void}
 */
export function postScaffold(options: ScaffoldOptions) {
  const storybookInstructions = `
 ${chalk.blue.underline('Running Storybook')}\n
 Since you have used the Storybook option, please see below for instructions:\n
 1. In a separate terminal, run Storybook: ${chalk.green("'npm run storybook'")}
`;

  const prettierInstructions = ` ${chalk.blue.underline('Using Prettier')}\n
 Since you have chosen to install Prettier, you may need to configure your IDE or editor to use it.
`;

  console.log(`
 ${chalk.green.bold('Ready to get D.I.R.T-y?')}\n
 ${chalk.underline.blue('Installation Summary')}\n
 Project Name: ${chalk.blue(options['projectName'])}
 Frontend: ${chalk.blue(options['frontend'])}
 Storybook Enabled: ${
   options['withStorybook'] ? chalk.green('Yes') : chalk.dim('No')
 }
 Prettier Installed: ${
   options['installPrettier'] ? chalk.green('Yes') : chalk.dim('No')
 }\n
 ${chalk.blue.underline('What do next')}\n
 1. navigate to: ${chalk.green(options['projectName'])}
 2. activate pipenv: ${chalk.green("'pipenv shell'")}
 3. run the project: ${chalk.green("'npm run dirt-dev'")}
 4. In your browser, navigate to: ${chalk.green('http://localhost:8000')}\n
 ${chalk.grey(
   'Note: due to a limitation with concurrently, some output (django dev server) will not be displayed when the dirt-dev command is run.'
 )}
 ${chalk.gray(
   "Workaround: Activate the shell and run 'python manage.py runserver' in a separate terminal and then 'npm run dirt-fe' in another terminal"
 )}
${options['withStorybook'] ? storybookInstructions : ''}
${options['installPrettier'] ? prettierInstructions : ''}
`);
}
