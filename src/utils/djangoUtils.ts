import { exec } from 'child_process';
import fs from 'node:fs';
import constants from 'node:constants';
import path from 'node:path';
import {
  access,
  appendFile,
  cp as copy,
  mkdir,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'module';
import {
  DIRT_TEMPLATES_FOLDER,
  DJANGO_TEMPLATES_PATH,
  INERTIA_DEFAULTS_PATH,
  PIPENV_VENV_COMMAND,
} from '../constants/djangoConstants.js';
import { standardOutputBuilder } from './standardOutputBuilder.js';
import { platform } from 'os';
import { normalizeWinFilePath } from './fileUtils.js';
import { FILE_COPY_OPTS } from '../constants/index.js';
import { FRONTEND_PATHS } from '../constants/feConstants.js';
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;
import DIRTCoreOpts = DIRTStackCLI.DIRTCoreOpts;
import DIRTDatabaseOpt = DIRTStackCLI.DIRTDatabaseOpt;
import { generateDatabaseSettings } from './databaseUtils.js';
import { checkDestinationExistence } from '../helpers/shared/coreHelpers.js';
import Frontend = DIRTStackCLI.Frontend;
import { toTitleCase } from '../utils/feUtils.js';
import ConsoleLogger from '../utils/ConsoleLogger.js';

const require = createRequire(import.meta.url);
const djangoDependencies = require('../../configs/djangoDependencies.json');

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
    exec(venvCommand, (error) => {
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

export async function copyDjangoHTMLTemplates(
  options: DIRTCoreOpts
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;
    let templateBaseDir = path.resolve(
      path.normalize(new URL(currentFileUrl).pathname),
      FRONTEND_PATHS[options.frontend].BASE_HTML_TEMPLATES_PATH
    );

    if (platform() === 'win32')
      templateBaseDir = normalizeWinFilePath(templateBaseDir);

    // create dirt_templates folder
    const templateDestination = path.join(
      options.destinationBase,
      DIRT_TEMPLATES_FOLDER
    );

    // create folder
    await mkdir(templateDestination);

    // check destination
    // await access(options.destinationBase, constants.W_OK);

    // copy files
    await copy(templateBaseDir, templateDestination, FILE_COPY_OPTS);

    output.result = 'Base templates copied';
    output.success = true;
    return output;
  } catch (e) {
    output.result = 'Failed to copy templates';
    output.error = (e as Error).message;
    return output;
  }
}

/**
 * @description Writes settings for dev mode
 * @param {string} secretKey This serves as Django's secret key
 * @param {string} projectName The name of the project
 * @param {string} destination
 */
export async function writeDevSettings(
  secretKey: string,
  projectName: string,
  destination: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    const appSettings = `
    \n#Add extra apps here
    \nINSTALLED_APPS += ['${projectName}']
    \n#Secret Key\nSECRET_KEY = "${secretKey}"
    `;
    await appendFile(destination, appSettings);
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

export async function writeDatabaseSettings(
  projectName: string,
  destination: string,
  databaseOpt: Omit<'None', DIRTDatabaseOpt>
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    // get the database options object that should be written to settings
    const dbSettings = generateDatabaseSettings(projectName, databaseOpt);
    // write to file
    await appendFile(destination, `\n# DATABASE SETTINGS`);
    await appendFile(destination, `\nDATABASES = ${dbSettings}`);

    output.success = true;
    return output;
  } catch (e) {
    output.error = (e as Error).message;
    return output;
  }
}

/**
 * @deprecated Replaced with copyAssets
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

    await copy(inertiaDefaultsDir, destinationPath, FILE_COPY_OPTS);

    output.success = true;
    output.result = `Inertia files copied`;
    return output;
  } catch (e) {
    output.error = e.toString();
    output.result = 'Failed to copy inertia defaults';
    return output;
  }
}

export async function copyAssets(
  sourcePath: string,
  destinationPath: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;

    let assetBuilderSrcPath = path.resolve(
      path.normalize(new URL(currentFileUrl).pathname),
      sourcePath
    );

    if (platform() === 'win32')
      assetBuilderSrcPath = normalizeWinFilePath(assetBuilderSrcPath);

    await copy(assetBuilderSrcPath, destinationPath, FILE_COPY_OPTS);

    output.success = true;
    return output;
  } catch (e) {
    output.error = `Failed to copy assets with error: ${(e as Error).message}`;
    return output;
  }
}

/**
 * @description Writes the necessary data to the generated views.py file to make the inertia view work
 * @param destinationPath
 * @param controllerName
 * @param frontend
 */
export async function writeInertiaViewsFile(
  destinationPath: string,
  controllerName: string,
  frontend: Frontend = 'react'
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    // get path to file
    const filePath = path.join(
      destinationPath,
      controllerName.toLowerCase(),
      'views.py'
    );

    // check destination existence
    const folderPath = path.join(destinationPath, controllerName);

    // construct file contents
    const fileContent = `
# Generated using D.I.R.T Stack CLI
\nfrom inertia import inertia
\n# Create your views here.
\n\n@inertia('${controllerName}/Index')
def index(request):
\treturn {
\t\t'controllerName': '${controllerName}'
\t}
\n\n
`;

    console.log(`try to write file: ${filePath}`);

    // overwrite original views.py file that was created from django-admin startapp <app_name>
    await writeFile(filePath, fileContent, { encoding: 'utf-8' });

    // construct the urls.py file for the controller
    const urlsFilePath = path.join(
      destinationPath,
      controllerName.toLowerCase(),
      'urls.py'
    );

    const urlsFileContent = `
# Generated using D.I.R.T Stack CLI
\nfrom django.urls import path
\nfrom . import views
\n\nurlpatterns = [
\tpath('', views.index, name='${controllerName}')
]
\n
`;
    // overwrite original urls.py file that was created from django-admin startapp <app_name>
    await writeFile(urlsFilePath, urlsFileContent, { encoding: 'utf-8' });

    // overwrite main urls.py? or print out string to paste into main urls.py
    ConsoleLogger.printMessage(
      `Update the imports in your main [urls.py] as follows: from django.urls import path, include`,
      'success'
    );
    ConsoleLogger.printMessage(
      `Paste this into [urlpatterns] in your main [urls.py] file: path('${controllerName}/', include('${controllerName}.urls'))`,
      'success'
    );

    // write out inertia template files
    // determine target path for Inertia views
    const inertiaViewsPath = path.join(
      destinationPath,
      `dirt_fe_${frontend}`,
      'src',
      'pages',
      toTitleCase(controllerName),
      'Index.tsx'
    );

    ConsoleLogger.printMessage(`Write page component to: ${inertiaViewsPath}`);

    output.success = true;
    return output;
  } catch (e) {
    output.result = `Failed to generate controller view with error: ${
      (e as Error).message
    }`;
    output.error = `Failed to generate controller views file with error: ${
      (e as Error).message
    }`;
    return output;
  }
}
