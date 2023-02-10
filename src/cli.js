import arg from 'arg';
import inquirer from 'inquirer';

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

export async function cli(args) {
  let options = parseArgs(args);
  options = await promptForMissingOpts(options);
  console.log(options);
}
