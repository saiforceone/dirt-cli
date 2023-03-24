import os from 'node:os';
import path from 'node:path';
import { execaCommand } from 'execa';

import ConsoleLogger from './utils/ConsoleLogger.js';
import { updateNPMAttribs, writeProjectConfig } from './utils/feUtils.js';
import { standardOutputBuilder } from './utils/standardOutputBuilder.js';
import {
  copyReactFE,
  copyReactStatic,
  copyReactStorybookFiles,
  installCoreReactFEDependencies,
  installStorybookReactDependencies,
  updateNPMScriptsForStorybook,
} from './utils/reactFEUtils.js';
import { updateNPMScriptsWin32 } from './helpers/shared/win32FEHelpers.js';
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;
import ScaffoldOptions = DIRTStackCLI.ScaffoldOptions;

/**
 * @description Main function that kicks off the process for scaffolding the React frontend
 * @param {ScaffoldOptions} options
 */
export async function scaffoldReact(
  options: ScaffoldOptions
): Promise<ScaffoldOutput> {
  const useVerboseLogs = options['verboseLogs'];
  const output = standardOutputBuilder();
  const destination = path.join(process.cwd());

  // if not in the correct directory, then change
  // process.chdir(destination);
  if (useVerboseLogs) {
    ConsoleLogger.printMessage('Preparing to scaffold React Frontend...');
    ConsoleLogger.printMessage('Writing project configuration files...');
  }
  const projectConfigResults = await writeProjectConfig(
    { ...options, frontend: 'react' },
    destination
  );

  if (!projectConfigResults.success) {
    return projectConfigResults;
  }

  if (useVerboseLogs) {
    ConsoleLogger.printMessage('Done', 'success');
    ConsoleLogger.printMessage('Initializing NPM...');
  }

  try {
    await execaCommand('npm init -y');
  } catch (e) {
    if (useVerboseLogs)
      ConsoleLogger.printMessage(
        `Failed to initialize NPM with error: ${e.toString()}`,
        'error'
      );
    output.result = e.toString();
    return output;
  }

  const copyReactFilesResults = await copyReactFE(destination);
  if (useVerboseLogs)
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
  if (useVerboseLogs)
    ConsoleLogger.printMessage(
      copyReactStaticResults.error
        ? copyReactStaticResults.error
        : copyReactStaticResults.result,
      copyReactStaticResults.success ? 'success' : 'error'
    );

  // update package.json attributes: name, description
  if (useVerboseLogs)
    ConsoleLogger.printMessage('Updating package.json file...');

  const updateNPMBaseResults = await updateNPMAttribs(options, destination);

  if (!updateNPMBaseResults.success) return updateNPMBaseResults;

  if (useVerboseLogs)
    ConsoleLogger.printMessage(updateNPMBaseResults.result, 'success');

  if (useVerboseLogs)
    ConsoleLogger.printMessage(
      'Installing core D.I.R.T Stack React dependencies...'
    );
  const installReactDepsResults: ScaffoldOutput =
    await installCoreReactFEDependencies();

  if (!installReactDepsResults.success) {
    if (useVerboseLogs)
      ConsoleLogger.printMessage(installReactDepsResults.error, 'error');
    return output;
  }

  if (useVerboseLogs)
    ConsoleLogger.printMessage(`Dependencies installed`, 'success');

  if (os.platform() === 'win32') {
    // update package json file for windows
    if (useVerboseLogs)
      ConsoleLogger.printMessage('Updating NPM Scripts (dirt-dev)...');
    const updateNpmScriptResult = await updateNPMScriptsWin32(destination);
    if (useVerboseLogs) ConsoleLogger.printOutput(updateNpmScriptResult);
    if (!updateNpmScriptResult.success) return updateNpmScriptResult;
  }

  if (options['withStorybook']) {
    if (useVerboseLogs) ConsoleLogger.printMessage('Setting up Storybook...');
    // copy storybook files
    const sbFileCopyResults = await copyReactStorybookFiles(destination);

    if (!sbFileCopyResults.success) {
      return sbFileCopyResults;
    }

    if (useVerboseLogs)
      ConsoleLogger.printMessage('Storybook files copied', 'success');
    // install storybook deps

    if (useVerboseLogs)
      ConsoleLogger.printMessage('Installing Storybook dependencies...');

    const sbInstallDepResults: ScaffoldOutput =
      await installStorybookReactDependencies();
    if (!sbInstallDepResults.success) {
      return sbInstallDepResults;
    }

    if (useVerboseLogs)
      ConsoleLogger.printMessage('Storybook dependencies installed', 'success');

    // update the scripts in package.json
    if (useVerboseLogs)
      ConsoleLogger.printMessage('Updating NPM scripts for Storybook...');

    const sbUpdatePkgResults = await updateNPMScriptsForStorybook(destination);
    if (!sbUpdatePkgResults.success) {
      return sbUpdatePkgResults;
    }

    if (useVerboseLogs)
      ConsoleLogger.printMessage('Updated NPM scripts', 'success');
  }

  output.result = 'React Application Scaffolded...';
  output.success = true;
  return output;
}
