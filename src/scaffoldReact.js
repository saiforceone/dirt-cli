import ConsoleLogger from './utils/ConsoleLogger.js';
import {execaCommand} from 'execa';

import {standardOutputBuilder} from './utils/standardOutputBuilder.js';
import path from 'path';
import {copyReactFE, copyReactStatic, installCoreReactFEDependencies,} from './utils/reactFEUtils.js';

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

  const copyReactStaticResults = await copyReactStatic(destination);
  ConsoleLogger.printMessage(
    copyReactStaticResults.error
      ? copyReactStaticResults.error
      : copyReactStaticResults.result,
    copyReactStaticResults.success ? 'success' : 'error'
  );

  ConsoleLogger.printMessage(
    'Installing core D.I.R.T Stack React dependencies...'
  );
  const installReactDepsResults = await installCoreReactFEDependencies();

  if (!installReactDepsResults.success) {
    return output;
  }

  ConsoleLogger.printMessage(`Dependencies installed`, 'success');

  output.result = 'React Application Scaffolded...';
  output.success = true;
  return output;
}
