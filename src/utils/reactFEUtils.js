import { exec } from 'child_process';
import { createRequire } from 'module';
import { standardOutputBuilder } from './standardOutputBuilder.js';
import path from 'path';
import { access } from 'node:fs/promises';
import copy from 'recursive-copy';
import constants from 'node:constants';
import {
  REACT_SB_TEMPLATES_PATH,
  REACT_STATIC_TEMPLATES_PATH,
  REACT_TEMPLATES_PATH,
} from '../constants/reactConstants.js';

const FILE_COPY_OPTS = Object.freeze({
  overwrite: true,
  dot: true,
});

const require = createRequire(import.meta.url);
const reactStorybookDeps = require('../configs/reactStorybookDependencies.json');

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
      output.result = stdout ? stdout : stderr.message;
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
    const templateBaseDir = path.resolve(
      new URL(currentFileUrl).pathname,
      REACT_STATIC_TEMPLATES_PATH
    );

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
    const templateBaseDir = path.resolve(
      new URL(currentFileUrl).pathname,
      REACT_TEMPLATES_PATH
    );

    await access(destinationBase, constants.W_OK);

    const results = await copy(
      templateBaseDir,
      destinationBase,
      FILE_COPY_OPTS
    );

    output.result = `${results.length} React files copied`;
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
    const templateBaseDir = path.resolve(
      new URL(currentFileUrl).pathname,
      REACT_SB_TEMPLATES_PATH
    );

    await access(destinationBase, constants.W_OK);

    const results = await copy(
      templateBaseDir,
      destinationBase,
      FILE_COPY_OPTS
    );

    output.result = `${results.length} Storybook files copied`;
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
