import { Command } from '@commander-js/extra-typings';
import ConsoleLogger from './utils/ConsoleLogger.js';
import { checkDirt, cliInfo } from './advancedCommand.js';
import { generateSecretKey } from './utils/generateSecretKey.js';

// Main program instance
const program = new Command();

program
  .name('d.i.r.t-stack')
  .description('D.I.R.T Stack Advanced Command Executor');

/**
 * @description Info command to show details about the CLI
 */
program
  .command('info')
  .description('Shows information about the D.I.R.T Stack CLI')
  .action(async () => {
    await cliInfo();
  });

/**
 * todo: refactor / change from using exec
 * @description Exec command that runs advanced CLI commands
 */
program
  .command('exec')
  .description('Executes a given dirt-cli command')
  .option(
    '-c, --create-controller <controller>',
    'Creates a Django "app" within a scaffolded project with default templates where <controller> is the name of the Django app you would like to create'
  )
  .action(async (str, options) => {
    const isValidProject = await checkDirt();
    if (!isValidProject)
      return ConsoleLogger.printMessage(
        'This command was not run from a valid D.I.R.T Stack project',
        'error'
      );
    ConsoleLogger.printMessage(
      `This command was called with [${str.createController}] and options: ${options} but this is just a placeholder`
    );
  });

/**
 * @description Generate a secret key and print to the console / terminal
 */
program
  .command('gen-key')
  .alias('generate-key')
  .description(
    'Generates a pseudo-random string that can be used as a secret key'
  )
  .action(() => {
    const key = generateSecretKey();
    ConsoleLogger.printMessage(`Generated Key: ${key}`, 'success');
  });

export default program;
