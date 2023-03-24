import { exec } from 'child_process';
import fs from 'node:fs';
import constants from 'node:constants';
import path from 'node:path';
import { access, appendFile, cp as copy } from 'node:fs/promises';
import { createRequire } from 'module';
import {
  DJANGO_TEMPLATES_PATH,
  INERTIA_DEFAULTS_PATH,
  PIPENV_VENV_COMMAND,
} from '../constants/djangoConstants.js';
import { standardOutputBuilder } from './standardOutputBuilder.js';
import { platform } from 'os';
import { normalizeWinFilePath } from './fileUtils.js';
import { FILE_COPY_OPTS } from '../constants/index.js';
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;

const require = createRequire(import.meta.url);
const djangoDependencies = require('../../configs/djangoDependencies.json');
type TODO = any;

/**
 * @description This function handles the installation of dependencies via Pipenv
 */
export function installDependencies(): Promise<ScaffoldOutput> {
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
 * @param {string} projectName This refers to the name of the project which is read from the command line
 * @param {string} pythonExecutablePath The path to the python executable so that `startproject` can be kicked off
 */
export function createDjangoProject(
  projectName: string,
  pythonExecutablePath: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  return new Promise((resolve, reject) => {
    try {
      fs.accessSync(pythonExecutablePath, constants.R_OK | constants.X_OK);
    } catch (e) {
      output.error = e.message;
      reject(output);
    }
    const venvCommand = PIPENV_VENV_COMMAND;
    const projectCommand = `${pythonExecutablePath} -m django startproject ${projectName} .`;
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
 */
export function getVirtualEnvLocation(): Promise<ScaffoldOutput> {
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
 * @param {string} destinationBase
 */
export async function copyDjangoSettings(
  destinationBase: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;
    let templateBaseDir = path.resolve(
      path.normalize(new URL(currentFileUrl).pathname),
      DJANGO_TEMPLATES_PATH
    );

    if (platform() === 'win32')
      templateBaseDir = normalizeWinFilePath(templateBaseDir);

    try {
      await access(destinationBase, constants.W_OK);
    } catch (e) {
      output.error = (e as Error).message;
      return output;
    }

    try {
      await copy(templateBaseDir, destinationBase, FILE_COPY_OPTS);
    } catch (e) {
      output.error = (e as Error).message;
      return output;
    }

    output.success = true;
    output.result = `File copy results files copied.`;
    return output;
  } catch (e) {
    output.result = 'Failed to copy files';
    output.error = e.toString();
    return output;
  }
}

/**
 * @description Writes settings for dev mode
 * @param {string} secretKey This serves as Django's secret key
 * @param {string} destination
 */
export async function writeDevSettings(
  secretKey: string,
  destination: string
): Promise<ScaffoldOutput> {
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
 * @param {string} projectName
 * @param {string} destination
 */
export async function writeBaseSettings(
  projectName: string,
  destination: string
): Promise<ScaffoldOutput> {
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
 * @param {string} destinationPath
 */
export async function copyInertiaDefaults(
  destinationPath: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();

  try {
    const currentFileUrl = import.meta.url;

    let inertiaDefaultsDir = path.resolve(
      path.normalize(new URL(currentFileUrl).pathname),
      INERTIA_DEFAULTS_PATH
    );

    if (platform() === 'win32')
      inertiaDefaultsDir = normalizeWinFilePath(inertiaDefaultsDir);
    try {
      await copy(inertiaDefaultsDir, destinationPath, FILE_COPY_OPTS);
    } catch (e) {
      output.error = (e as Error).message;
      return output;
    }

    output.success = true;
    output.result = `Inertia files copied`;
    return output;
  } catch (e) {
    output.error = e.toString();
    output.result = 'Failed to copy inertia defaults';
    return output;
  }
}
