import ConsoleLogger from './utils/ConsoleLogger.js';
import {execaCommand} from 'execa';
import {updateNPMAttribs, writeProjectConfig} from './utils/feUtils.js';

import {standardOutputBuilder} from './utils/standardOutputBuilder.js';
import path from 'path';
import {
  copyReactFE,
  copyReactStatic,
  copyReactStorybookFiles,
  installCoreReactFEDependencies,
  installStorybookReactDependencies,
  updateNPMScriptsForStorybook,
} from './utils/reactFEUtils.js';

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

  ConsoleLogger.printMessage('Writing project configuration files...');

  const projectConfigResults = await writeProjectConfig(
    { ...options, frontend: 'react' },
    destination
  );

  if (!projectConfigResults.success) {
    return projectConfigResults;
  }

  ConsoleLogger.printMessage('Done', 'success');

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

  // update package.json attributes: name, description
  ConsoleLogger.printMessage('Updating package.json file...');

  const updateNPMBaseResults = await updateNPMAttribs(options, destination);

  if (!updateNPMBaseResults.success) return updateNPMBaseResults;

  ConsoleLogger.printMessage(updateNPMBaseResults.result, 'success');

  ConsoleLogger.printMessage(
    'Installing core D.I.R.T Stack React dependencies...'
  );
  const installReactDepsResults = await installCoreReactFEDependencies();

  if (!installReactDepsResults.success) {
    return output;
  }

  ConsoleLogger.printMessage(`Dependencies installed`, 'success');

  if (options['withStorybook']) {
    ConsoleLogger.printMessage('Setting up Storybook...');
    // copy storybook files
    const sbFileCopyResults = await copyReactStorybookFiles(destination);

    if (!sbFileCopyResults.success) {
      return sbFileCopyResults;
    }

    ConsoleLogger.printMessage('Storybook files copied', 'success');
    // install storybook deps

    ConsoleLogger.printMessage('Installing Storybook dependencies...');

    const sbInstallDepResults = await installStorybookReactDependencies();
    if (!sbInstallDepResults.success) {
      return sbInstallDepResults;
    }

    ConsoleLogger.printMessage('Storybook dependencies installed', 'success');

    // update the scripts in package.json
    ConsoleLogger.printMessage('Updating NPM scripts for Storybook...');

    const sbUpdatePkgResults = await updateNPMScriptsForStorybook(destination);
    if (!sbUpdatePkgResults.success) {
      return sbUpdatePkgResults;
    }

    ConsoleLogger.printMessage('Updated NPM scripts', 'success');
  }

  output.result = 'React Application Scaffolded...';
  output.success = true;
  return output;
}
