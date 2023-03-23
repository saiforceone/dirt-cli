import { exec } from 'child_process';
import { createRequire } from 'module';
import { standardOutputBuilder } from './standardOutputBuilder.js';
import path from 'path';
import { access, writeFile } from 'node:fs/promises';
import copy_ from 'recursive-copy';
import constants from 'node:constants';
import {
  REACT_SB_STORIES_PATH,
  REACT_SB_TEMPLATES_PATH,
  REACT_STATIC_TEMPLATES_PATH,
  REACT_TEMPLATES_PATH,
} from '../constants/reactConstants.js';
import {
  PACKAGE_JSON_FILE,
  STORYBOOK_SCRIPT_BUILD,
  STORYBOOK_SCRIPT_DEV,
  STORYBOOK_SCRIPT_DEV_PRE,
} from '../constants/feConstants.js';
import { getPackageFile } from './feUtils.js';
import { normalizeWinFilePath } from './fileUtils.js';
import os from 'os';
type TODO = any;
let copy: TODO = copy_;

const FILE_COPY_OPTS = Object.freeze({
  overwrite: true,
  dot: true,
});

const require = createRequire(import.meta.url);
const reactStorybookDeps = require('../../configs/reactStorybookDependencies.json');

/**
 * @description Helper function that handles installing core react frontend dependencies
 * @returns {Promise<*>}
 */
export function installCoreReactFEDependencies() {
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
 * @description Helper function that copies static files for react to the correct directory
 * @param destinationBase
 * @returns {Promise<{error: String, result: *, success: boolean}>}
 */
export async function copyReactStatic(destinationBase) {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;
    let templateBaseDir = path.resolve(
      new URL(currentFileUrl).pathname,
      REACT_STATIC_TEMPLATES_PATH
    );

    if (os.platform() === 'win32')
      templateBaseDir = normalizeWinFilePath(templateBaseDir);

    await access(destinationBase, constants.W_OK);
    const results = await copy(
      templateBaseDir,
      destinationBase,
      FILE_COPY_OPTS
    );
    output.result = `${results.length} React static files copied`;
    output.success = true;
    return output;
  } catch (e) {
    output.error = e.toString();
    output.result = 'Failed to copy react static files';
    return output;
  }
}

/**
 * @description Helper function that copies React Template files to the destination
 * @param destinationBase
 * @returns {Promise<{error: String, result: *, success: boolean}>}
 */
export async function copyReactFE(destinationBase) {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;
    let templateBaseDir = path.resolve(
      path.normalize(new URL(currentFileUrl).pathname),
      REACT_TEMPLATES_PATH
    );

    if (os.platform() === 'win32')
      templateBaseDir = normalizeWinFilePath(templateBaseDir);

    await access(destinationBase, constants.W_OK);

    const results = await copy(
      templateBaseDir,
      destinationBase,
      FILE_COPY_OPTS
    );

    output.result = `${results.length} React resources copied`;
    output.success = true;
    return output;
  } catch (e) {
    output.result = 'Failed to copy files to destination';
    output.error = e.toString();
    return output;
  }
}

/**
 * @description Helper function that copies storybook files for react
 * @param destinationBase
 * @returns {Promise<{error: String, result: *, success: boolean}>}
 */
export async function copyReactStorybookFiles(destinationBase) {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;
    let templateBaseDir = path.resolve(
      new URL(currentFileUrl).pathname,
      REACT_SB_TEMPLATES_PATH
    );

    if (os.platform() === 'win32')
      templateBaseDir = normalizeWinFilePath(templateBaseDir);

    await access(destinationBase, constants.W_OK);

    const results = await copy(
      templateBaseDir,
      destinationBase,
      FILE_COPY_OPTS
    );

    let storiesBaseDir = path.resolve(
      path.normalize(new URL(currentFileUrl).pathname),
      REACT_SB_STORIES_PATH
    );

    if (os.platform() === 'win32')
      storiesBaseDir = normalizeWinFilePath(storiesBaseDir);

    const storyResults = await copy(
      storiesBaseDir,
      path.join(destinationBase, 'dirt_fe_react', 'src'),
      FILE_COPY_OPTS
    );

    output.result = `${
      results.length + storyResults.length
    } Storybook files & folders copied`;
    output.success = true;
    return output;
  } catch (e) {
    output.result = 'Failed to copy files to destination';
    output.error = e.toString();
    return output;
  }
}

/**
 * @description Helper function that installs storybook.js dependencies
 * @returns {Promise<*>}
 */
export async function installStorybookReactDependencies() {
  const output = standardOutputBuilder();
  const { packages } = reactStorybookDeps;
  const installString = Object.keys(packages)
    .map((pkg) => {
      return `${pkg}@${reactStorybookDeps.packages[pkg]}`;
    })
    .join(' ');
  return new Promise((resolve, reject) => {
    exec(`npm i -D ${installString}`, (error, stdout, stderr) => {
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
 * @returns {Promise<{error: String, result: *, success: boolean}>}
 */
export async function updateNPMScriptsForStorybook(destinationPath) {
  const output = standardOutputBuilder();
  try {
    // read & parse the package.json file in the project
    const pkgFilePath = path.join(destinationPath, PACKAGE_JSON_FILE);
    const fileContents = await getPackageFile(destinationPath);

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
