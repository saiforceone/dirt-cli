// Core dependencies
import os from 'node:os';
// 3rd-party dependencies
import {execaCommand} from 'execa';
import {standardOutputBuilder} from './utils/standardOutputBuilder.js';
import ConsoleLogger from './utils/ConsoleLogger.js';
import {updateNPMAttribs, writeProjectConfig} from './utils/feUtils.js';
import {
  copyFrontendResources,
  copyFrontendStaticResources,
  copyFrontendStorybookFiles,
  installCoreFrontendDependencies,
  installStorybookDependencies,
  updateNPMScriptsForStorybook,
} from './utils/frontendUtils.js';

import {FRONTEND_PATHS} from './constants/feConstants.js';
import { updateNPMScriptsWin32 } from './helpers/shared/win32FEHelpers.js';
// DIRT dependencies
import ScaffoldOptions = DIRTStackCLI.ScaffoldOptions;
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;

export async function scaffoldFrontend(
  options: ScaffoldOptions
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  const { verboseLogs: useVerboseLogs } = options;
  const destination = process.cwd();

  // if not in the correct directory, then change
  // process.chdir(destination);
  if (useVerboseLogs) {
    ConsoleLogger.printMessage(
      `Preparing to scaffold ${options.frontend} Frontend...`
    );
    ConsoleLogger.printMessage('Writing project configuration files...');
  }
  const projectConfigResults = await writeProjectConfig(options, destination);

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

  const copyFrontendFilesResults = await copyFrontendResources(
    FRONTEND_PATHS[options.frontend].TEMPLATES_PATH,
    destination
  );
  if (useVerboseLogs)
    ConsoleLogger.printMessage(
      copyFrontendFilesResults.error
        ? copyFrontendFilesResults.error
        : copyFrontendFilesResults.result,
      copyFrontendFilesResults.success ? 'success' : 'error'
    );

  if (!copyFrontendFilesResults.success) {
    return copyFrontendFilesResults;
  }

  const copyFrontendStaticResults = await copyFrontendStaticResources(
    FRONTEND_PATHS[options.frontend].STATIC_TEMPLATES_PATH,
    destination
  );
  if (useVerboseLogs)
    ConsoleLogger.printMessage(
      copyFrontendStaticResults.error
        ? copyFrontendStaticResults.error
        : copyFrontendStaticResults.result,
      copyFrontendStaticResults.success ? 'success' : 'error'
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
      `Installing core D.I.R.T Stack ${options.frontend} dependencies...`
    );

  const installFrontendDependenciesResults: ScaffoldOutput =
    await installCoreFrontendDependencies();

  if (!installFrontendDependenciesResults.success) {
    if (useVerboseLogs)
      ConsoleLogger.printMessage(
        installFrontendDependenciesResults.error
          ? installFrontendDependenciesResults.error
          : 'Install Error',
        'error'
      );
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
    const sbFileCopyResults = await copyFrontendStorybookFiles({
      destinationBase: destination,
      frontend: options.frontend,
      storySource: FRONTEND_PATHS[options.frontend].STORY_BOOK_STORIES_PATH,
      templateSource:
        FRONTEND_PATHS[options.frontend].STORY_BOOK_TEMPLATES_PATH,
    });

    if (!sbFileCopyResults.success) {
      return sbFileCopyResults;
    }

    if (useVerboseLogs)
      ConsoleLogger.printMessage('Storybook files copied', 'success');
    // install storybook deps

    if (useVerboseLogs)
      ConsoleLogger.printMessage('Installing Storybook dependencies...');

    const sbInstallDepResults: ScaffoldOutput =
      await installStorybookDependencies(options.frontend);
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

  output.result = `${options.frontend} Application Scaffolded...`;
  output.success = true;

  return output;
}
