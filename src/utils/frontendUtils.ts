import os from 'node:os';
import path from 'node:path';
import { access, cp as copy, writeFile } from 'node:fs/promises';
import { exec } from 'child_process';
import { createRequire } from 'module';
import { standardOutputBuilder } from './standardOutputBuilder.js';
import constants from 'node:constants';
import {
  PACKAGE_JSON_FILE,
  STORYBOOK_SCRIPT_BUILD,
  STORYBOOK_SCRIPT_DEV,
  STORYBOOK_SCRIPT_DEV_PRE,
} from '../constants/feConstants.js';
import { getPackageFile } from './feUtils.js';
import { normalizeWinFilePath } from './fileUtils.js';
import { FILE_COPY_OPTS } from '../constants/index.js';
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;
import DIRTPkgFile = DIRTStackCLI.DIRTPkgFile;
import DIRTStorybookOpts = DIRTStackCLI.DIRTStorybookOpts;
import Frontend = DIRTStackCLI.Frontend;

const require = createRequire(import.meta.url);
const storybookDeps = require('../../configs/storybookDependencies.json');

/**
 * @description Helper function that handles installing core frontend dependencies
 */
export function installCoreFrontendDependencies(): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  return new Promise((resolve, reject) => {
    exec('npm i', (error, stdout, stderr) => {
      if (error) {
        output.result = error.message;
        reject(output);
      }

      output.success = true;
      output.result = stdout ? stdout : stderr;
      resolve(output);
    });
  });
}

/**
 * @description Helper function that copies frontend static files to the correct directory
 * @param {string} source
 * @param {string} destinationBase
 */
export async function copyFrontendStaticResources(
  source: string,
  destinationBase: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;
    let templateBaseDir = path.resolve(
      new URL(currentFileUrl).pathname,
      source
    );

    if (os.platform() === 'win32')
      templateBaseDir = normalizeWinFilePath(templateBaseDir);

    try {
      await access(destinationBase, constants.W_OK);
      await copy(templateBaseDir, destinationBase, FILE_COPY_OPTS);
    } catch (e) {
      output.error = (e as Error).message;
      return output;
    }
    output.result = `Frontend static resources copied`;
    output.success = true;
    return output;
  } catch (e) {
    output.error = e.toString();
    output.result = 'Failed to copy frontend static resources';
    return output;
  }
}

/**
 * @description Helper function that copies frontend Template files to the destination
 * @param {string} source
 * @param {string} destinationBase
 * @returns {Promise<{error: String, result: *, success: boolean}>}
 */
export async function copyFrontendResources(
  source: string,
  destinationBase: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;
    let templateBaseDir = path.resolve(
      path.normalize(new URL(currentFileUrl).pathname),
      source
    );

    if (os.platform() === 'win32')
      templateBaseDir = normalizeWinFilePath(templateBaseDir);

    await access(destinationBase, constants.W_OK);

    try {
      await copy(templateBaseDir, destinationBase, FILE_COPY_OPTS);
    } catch (e) {
      output.error = (e as Error).message;
      return output;
    }

    output.result = `Frontend resources copied`;
    output.success = true;
    return output;
  } catch (e) {
    output.result = 'Failed to copy frontend resources to destination';
    output.error = e.toString();
    return output;
  }
}

/**
 * @description Helper function that copies storybook files for the frontend
 * @param {DIRTStorybookOpts} opts
 */
export async function copyFrontendStorybookFiles(
  opts: DIRTStorybookOpts
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;
    let templateBaseDir = path.resolve(
      new URL(currentFileUrl).pathname,
      opts.templateSource
    );

    if (os.platform() === 'win32')
      templateBaseDir = normalizeWinFilePath(templateBaseDir);

    await access(opts.destinationBase, constants.W_OK);

    try {
      await copy(templateBaseDir, opts.destinationBase, FILE_COPY_OPTS);
    } catch (e) {
      output.error = (e as Error).message;
      return output;
    }

    let storiesBaseDir = path.resolve(
      path.normalize(new URL(currentFileUrl).pathname),
      opts.storySource
    );

    if (os.platform() === 'win32')
      storiesBaseDir = normalizeWinFilePath(storiesBaseDir);

    try {
      await copy(
        storiesBaseDir,
        path.join(opts.destinationBase, `dirt_fe_${opts.frontend}`, 'src'),
        FILE_COPY_OPTS
      );
    } catch (e) {
      output.error = (e as Error).message;
      return output;
    }

    output.result = `Storybook resources copied`;
    output.success = true;
    return output;
  } catch (e) {
    output.result = 'Failed to Storybook resources to destination';
    output.error = e.toString();
    return output;
  }
}

/**
 * @description Helper function that installs storybook.js dependencies
 * @param {Frontend} frontend
 */
export async function installStorybookDependencies(
  frontend: Frontend
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  const { commonPackages } = storybookDeps;

  const installString = Object.keys(commonPackages)
    .map((pkg) => {
      return `${pkg}@${commonPackages[pkg]}`;
    })
    .join(' ');
  const feDeps = storybookDeps[frontend];
  const feString = Object.keys(feDeps)
    .map((pkg) => `${pkg}@${feDeps[pkg]}`)
    .join(' ');

  return new Promise((resolve, reject) => {
    exec(`npm i -D ${installString} ${feString}`, (error) => {
      if (error) {
        output.result = error.message;
        reject(output);
      }

      output.success = true;
      resolve(output);
    });
  });
}

/**
 * @todo Extract functionality to update package.json to a generic function
 * @description Updates the package.json file with the storybook scripts
 * @param destinationPath
 */
export async function updateNPMScriptsForStorybook(
  destinationPath: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    // read & parse the package.json file in the project
    const pkgFilePath = path.join(destinationPath, PACKAGE_JSON_FILE);
    const fileContents = (await getPackageFile(destinationPath)) as DIRTPkgFile;

    // add entries to "scripts" for storybook
    fileContents['scripts']['prestorybook'] = STORYBOOK_SCRIPT_DEV_PRE;
    fileContents['scripts']['storybook'] = STORYBOOK_SCRIPT_DEV;
    fileContents['scripts']['storybook-build'] = STORYBOOK_SCRIPT_BUILD;

    // save the file and return
    await writeFile(pkgFilePath, JSON.stringify(fileContents, null, 2));

    output.result = 'Package file updated';
    output.success = true;
    return output;
  } catch (e) {
    output.error = e.toString();
    output.result = 'Failed to update NPM scripts for Storybook';
    return output;
  }
}
