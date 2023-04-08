/**
 * scaffoldDjango.js
 * This is the main file responsible for scaffolding the Django part of the DIRT stack
 */
import path from 'node:path';
import fs from 'node:fs';
import constants from 'node:constants';

import ConsoleLogger from './utils/ConsoleLogger.js';
import { standardOutputBuilder } from './utils/standardOutputBuilder.js';
import { validateProjectName } from './utils/validateProjectName.js';
import { scaffoldDjangoProcess } from './helpers/django/commonHelpers.js';
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;
import ScaffoldOptions = DIRTStackCLI.ScaffoldOptions;

/**
 * @description Main function that kicks off the process for scaffolding the Django application
 * @param options The options coming in from the CLI (process.argv)
 * @returns {Promise<*>}
 */
export async function scaffoldDjango(options: ScaffoldOptions) {
  const { projectName, verboseLogs: useVerboseLogs } = options;

  let output: ScaffoldOutput = standardOutputBuilder();

  if (useVerboseLogs) {
    ConsoleLogger.printMessage('Setting up Django project...');
    ConsoleLogger.printMessage('executing scaffoldDjango...');
  }

  // check if we have a project name in options, if not exit
  if (!validateProjectName(projectName)) {
    output.result =
      'Invalid project name. Project names should start with a letter and contain no spaces or dashes. For example: some_project';
    return output;
  }

  if (useVerboseLogs)
    ConsoleLogger.printMessage(`creating project with name: ${projectName}`);

  // get the current directory and append the projectName
  const destination = path.join(process.cwd(), projectName);
  try {
    // make the directory if it does not exist
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination);
    }

    fs.accessSync(destination, constants.R_OK | constants.W_OK);
  } catch (e) {
    output.result = `Failed to scaffold django project with error: ${e.toString()}`;
    return output;
  }

  // change directory to destination
  process.chdir(destination);

  if (useVerboseLogs)
    ConsoleLogger.printMessage(`in directory:  ${process.cwd()}`);

  // scaffold Django process execution
  output = await scaffoldDjangoProcess(options, destination);
  return output;
}
