import chalk from 'chalk';
import ScaffoldOptions = DIRTStackCLI.ScaffoldOptions;

/**
 * @description Convenience function that retrieves database instructions that will be printed to the terminal
 * at the end of the scaffold process.
 * @param dbOpt
 */
function getDatabaseInstructions(dbOpt: string): string {
  if (dbOpt === 'None') return '';
  const instructions: { [key: string]: string } = {
    mysql: `
 ${chalk.blue.underline('Database Setup: MySQL')}\n
 1. You may be required to install ${chalk.green(
   'mysqlclient'
 )} if you haven't done so already before attempting to run any migrations.\n Refer to: ${chalk.underline(
      'https://pypi.org/project/mysqlclient/'
    )} for more information.
`,
    postgresql: `
 ${chalk.blue.underline('Database Setup: Postgresql')}\n
 1. You may be required to install ${chalk.green(
   'psycopg/psycopg2'
 )} if you haven't done so already.\n Refer to: ${chalk.underline(
      'https://www.psycopg.org/docs/install.html'
    )} for more information.
`,
    sqlite: `
 ${chalk.blue.underline('Database Setup: SQLite')}\n
 ${chalk.bold(
   'Note:'
 )} You're already good to go. Nothing else needs to be done.
`,
  };
  return instructions[dbOpt] ?? '';
}

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
 Database: ${chalk[options['databaseOption'] === 'None' ? 'dim' : 'green'](
   options['databaseOption']
 )}
 Storybook Enabled: ${
   options['withStorybook'] ? chalk.green('Yes') : chalk.dim('No')
 }
 Prettier Installed: ${
   options['installPrettier'] ? chalk.green('Yes') : chalk.dim('No')
 }\n
${
  options['databaseOption'] !== 'None'
    ? getDatabaseInstructions(options['databaseOption'])
    : ''
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
