import { exec } from 'child_process';
import { $ } from 'execa';
import fs from 'fs';
import constants from 'constants';
import path from 'path';
import { access, appendFile } from 'node:fs/promises';
import { createRequire } from 'module';
import copy_ from 'recursive-copy';
import {
  DJANGO_TEMPLATES_PATH,
  INERTIA_DEFAULTS_PATH,
  PIPENV_COMMAND,
  PIPENV_VENV_COMMAND,
} from '../constants/djangoConstants.js';
import { standardOutputBuilder } from './standardOutputBuilder.js';
import ConsoleLogger from './ConsoleLogger.js';
import { platform } from 'os';
import { normalizeWinFilePath } from './fileUtils.js';

const require = createRequire(import.meta.url);
const djangoDependencies = require('../../configs/djangoDependencies.json');
type TODO = any;
let copy: TODO = copy_;

/** @deprecated */
export function initPipenv() {
  const output = standardOutputBuilder();
  return new Promise((resolve, reject) => {
    exec(PIPENV_COMMAND, { windowsHide: true }, (error, stdout, stderr) => {
      console.log('stdout: ', stdout);
      console.error('stderr: ', stderr);
      console.error('err: ', error);
      if (error) {
        ConsoleLogger.printMessage(error.message, 'warning');
        output.error = error.message;
        reject(output);
      }
      output.success = true;
      output.result = stdout ? stdout : stderr;
      resolve(output);
    });
  });
}

export async function installWinDepsV2() {
  const output = standardOutputBuilder();
  try {
    const { stdout: pipenvOut } = await $({
      windowsHide: true,
    })`${PIPENV_COMMAND}`;
    console.log('pipenv out: ', pipenvOut);
    console.log('getting venv');
    const { stdout } = await $`${PIPENV_VENV_COMMAND}`;
    console.log('installWinDepsV2 stdout: ', stdout);
    output.success = true;
    return output;
  } catch (e) {
    output.error = e.toString();
    return output;
  }
}

export function installDependenciesWindows() {
  const output = standardOutputBuilder();
  return new Promise((resolve, reject) => {
    const packageList = Object.keys(djangoDependencies.packages)
      .map((pkg) => `${pkg}==${djangoDependencies.packages[pkg]}`)
      .join(' ');
    const command = `pipenv install ${packageList}`;
    console.log('executing command: ', command);
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      console.log('stdout: ', stdout);
      if (error) {
        // ConsoleLogger.printMessage(error.message, 'warning');
        output.error = error.message;
        reject(output);
      }
      output.success = true;
      output.result = stdout ? stdout : stderr;
      resolve(output);
    });
  });
}

/**
 * @description This function handles the installation of dependencies via Pipenv
 * @returns {Promise<*>}
 */
export function installDependencies() {
  const output = standardOutputBuilder();
  return new Promise((resolve, reject) => {
    // use the dependencies file to build the install string
    const packageList = Object.keys(djangoDependencies.packages)
      .map((pkg) => `${pkg}==${djangoDependencies.packages[pkg]}`)
      .join(' ');
    const command = `pipenv install ${packageList}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // ConsoleLogger.printMessage(error.message, 'warning');
        output.error = error.message;
        reject(output);
      }
      output.success = true;
      output.result = stdout ? stdout : stderr;
      resolve(output);
    });
  });
}

/**
 * @description This function is responsible for creating the Django project. For this process to work, we
 * have to specify which python executable needs to be used as we cannot activate the virtual environment.
 * @param projectName This refers to the name of the project which is read from the command line
 * @param pythonExecutable The path to the python executable so that `startproject` can be kicked off
 * @returns {Promise<*>}
 */
export function createDjangoProject(projectName, pythonExecutable) {
  const output = standardOutputBuilder();
  return new Promise((resolve, reject) => {
    try {
      fs.accessSync(pythonExecutable, constants.R_OK | constants.X_OK);
    } catch (e) {
      output.error = e.message;
      reject(output);
    }
    const venvCommand = PIPENV_VENV_COMMAND;
    const projectCommand = `${pythonExecutable} -m django startproject ${projectName} .`;
    exec(venvCommand, (error, stdout, stderr) => {
      if (error) {
        output.error = error.message;
        reject(output);
      }
      exec(projectCommand, (pcError, pcStdout, pcStderr) => {
        if (pcError) {
          output.error = pcError.toString();
          output.result = 'Failed to create Django project.';
          reject(output);
        }
        output.success = true;
        output.result = pcStdout ? pcStdout : pcStderr;
        resolve(output);
      });
    });
  });
}

/**
 * @description Gets the location of the virtual environment that was created so that
 * the path to the python executable can be determined.
 * @returns {Promise<*>}
 */
export function getVirtualEnvLocation() {
  const output = standardOutputBuilder();
  return new Promise((resolve, reject) => {
    exec(PIPENV_VENV_COMMAND, (error, stdout, stderr) => {
      if (error) {
        output.error = error.message;
        reject(output);
      }
      output.success = true;
      output.result = stdout ? stdout : stderr;
      resolve(output);
    });
  });
}

/**
 * @description Copies django template data to the destination directory. Overwrites the original manage.py file
 * @param destinationBase
 * @returns {Promise<{error: String, result: *, success: boolean}>}
 */
export async function copyDjangoSettings(destinationBase) {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;
    let templateBaseDir = path.resolve(
      path.normalize(new URL(currentFileUrl).pathname),
      DJANGO_TEMPLATES_PATH
    );

    if (platform() === 'win32')
      templateBaseDir = normalizeWinFilePath(templateBaseDir);

    await access(destinationBase, constants.W_OK);
    const results = await copy(templateBaseDir, destinationBase, {
      overwrite: true,
      dot: true,
    });

    output.success = true;
    output.result = `File copy results: ${results.length} files copied.`;
    return output;
  } catch (e) {
    output.result = 'Failed to copy files';
    output.error = e.toString();
    return output;
  }
}

/**
 * @description Writes settings for dev mode
 * @param secretKey This serves as Django's secret key
 * @param destination
 * @returns {Promise<{error: String, result: *, success: boolean}>}
 */
export async function writeDevSettings(secretKey, destination) {
  const output = standardOutputBuilder();
  try {
    await appendFile(destination, `\nSECRET_KEY = "${secretKey}"`);
    output.result = 'Dev settings updated';
    output.success = true;
    return output;
  } catch (e) {
    output.error = e.toString();
    return output;
  }
}

/**
 * @description Writes updated configuration to base settings
 * @param projectName
 * @param destination
 * @returns {Promise<{error: String, result: *, success: boolean}>}
 */
export async function writeBaseSettings(projectName, destination) {
  const output = standardOutputBuilder();
  try {
    await appendFile(
      destination,
      `\nWSGI_APPLICATION = "${projectName}.wsgi.application"`
    );
    await appendFile(destination, `\nROOT_URLCONF = "${projectName}.urls"`);
    output.result = 'Base settings updated';
    output.success = true;
    return output;
  } catch (e) {
    output.error = e.toString();
    return output;
  }
}

/**
 * @description Copies inertia specific urls.py and default views file to the project destination
 * @param destinationPath
 * @returns {Promise<{error: String, result: *, success: boolean}>}
 */
export async function copyInertiaDefaults(destinationPath) {
  const output = standardOutputBuilder();

  try {
    const currentFileUrl = import.meta.url;

    let inertiaDefaultsDir = path.resolve(
      path.normalize(new URL(currentFileUrl).pathname),
      INERTIA_DEFAULTS_PATH
    );

    if (platform() === 'win32')
      inertiaDefaultsDir = normalizeWinFilePath(inertiaDefaultsDir);

    const copyResults = await copy(inertiaDefaultsDir, destinationPath, {
      overwrite: true,
    });

    output.success = true;
    output.result = `${copyResults.length} Inertia files copied`;
    return output;
  } catch (e) {
    output.error = e.toString();
    output.result = 'Failed to copy inertia defaults';
    return output;
  }
}
