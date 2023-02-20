import ConsoleLogger from './utils/ConsoleLogger.js';
import { execaCommand } from 'execa';

import { standardOutputBuilder } from './utils/standardOutputBuilder.js';
import path from 'path';
import { copyReactFE } from './utils/reactFEUtils.js';
import copy from 'recursive-copy';
/**
 * @description Main function that kicks off the process for scaffolding the React frontend
 * @param options
 */
export async function scaffoldReact(options) {
  const output = standardOutputBuilder();
  const destination = path.join(process.cwd());

  // if not in the correct directory, then change
  // process.chdir(destination);
  ConsoleLogger.printMessage('Preparing to scaffold React Frontend...');
  ConsoleLogger.printMessage('Initializing NPM...');

  try {
    await execaCommand('npm init -y');
  } catch (e) {
    ConsoleLogger.printMessage(
      `Failed to initialize NPM with error: ${e.toString()}`,
      'error'
    );
    output.result = e.toString();
    return output;
  }

  const copyReactFilesResults = await copyReactFE(destination);
  ConsoleLogger.printMessage(
    copyReactFilesResults.error
      ? copyReactFilesResults.error
      : copyReactFilesResults.result,
    copyReactFilesResults.success ? 'success' : 'error'
  );

  if (!copyReactFilesResults.success) {
    return copyReactFilesResults;
  }

  ConsoleLogger.printMessage('Installing NPM dependencies...');
  try {
    await execaCommand('npm i').stdout.pipe(process.stdout);
    ConsoleLogger.printMessage('NPM packages installed', 'success');
  } catch (e) {
    output.result = 'Failed to install NPM packages';
    output.error = e.toString();
    return output;
  }

  output.result = 'React Application Scaffolded...';
  output.success = true;
  return output;
}
