import { exec } from 'child_process';
import fs from 'fs';
import constants from 'constants';
import path from 'path';
import { access, appendFile } from 'node:fs/promises';
import { createRequire } from 'module';
import copy from 'recursive-copy';
import {
  DJANGO_TEMPLATES_PATH,
  INERTIA_DEFAULTS_PATH,
  PIPENV_VENV_COMMAND,
} from '../constants/djangoConstants.js';
import ConsoleLogger from './ConsoleLogger.js';
const require = createRequire(import.meta.url);
const djangoDependencies = require('../configs/djangoDependencies.json');
import { standardOutputBuilder } from './standardOutputBuilder.js';

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
        ConsoleLogger.printMessage(error.message, 'warning');
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
          ConsoleLogger.printMessage(pcError.message, 'warnging');
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
    const templateBaseDir = path.resolve(
      new URL(currentFileUrl).pathname,
      DJANGO_TEMPLATES_PATH
    );

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
 * @returns {Promise<void>}
 */
export async function writeDevSettings(secretKey, destination) {
  try {
    await appendFile(destination, `\nSECRET_KEY = "${secretKey}"`);
  } catch (e) {
    ConsoleLogger.printMessage(
      `Failed to overwrite settings file with error: ${e.toString()} `
    );
  }
}

/**
 * @description Writes updated configuration to base settings
 * @param projectName
 * @param destination
 * @returns {Promise<void>}
 */
export async function writeBaseSettings(projectName, destination) {
  try {
    await appendFile(
      destination,
      `\nWSGI_APPLICATION = "${projectName}.wsgi.application"`
    );
    await appendFile(destination, `\nROOT_URLCONF = "${projectName}.urls"`);
  } catch (e) {
    ConsoleLogger.printMessage(
      `Failed to overwrite vase settings with error: ${e.toString()}`,
      'error'
    );
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

    const inertiaDefaultsDir = path.resolve(
      new URL(currentFileUrl).pathname,
      INERTIA_DEFAULTS_PATH
    );

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
