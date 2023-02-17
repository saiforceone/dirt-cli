/**
 * scaffoldDjango.js
 * This is the main file responsible for scaffolding the Django part of the DIRT stack
 */
import { execaCommand } from 'execa';
import path from 'path';
import fs from 'fs';
import { chmod, mkdir, rename, unlink } from 'node:fs/promises';

const {
  copyDjangoSettings,
  copyInertiaDefaults,
  createDjangoProject,
  getVirtualEnvLocation,
  installDependencies,
  writeBaseSettings,
  writeDevSettings,
} = await import('./utils/djangoUtils.js');
import { generateSecretKey } from './utils/generateSecretKey.js';
import * as constants from 'constants';
import {
  BASE_PY_FILENAME,
  DEV_PY_FILENAME,
  DIRT_SETTINGS_FOLDER,
  GIT_IGNORE_FILENAME,
  GIT_IGNORE_TEMPLATE_FILE,
  MANAGE_PY_FILENAME,
  MANAGE_PY_MODE,
  PIPENV_COMMAND,
  SETTINGS_PY_FILE,
  STATIC_FOLDER_NAME,
} from './constants/djangoConstants.js';
import { standardOutputBuilder } from './utils/standardOutputBuilder.js';
import { validateProjectName } from './utils/validateProjectName.js';

/**
 * @description Main function that kicks off the process for scaffolding the Django application
 * @param options The options coming in from the CLI (process.argv)
 * @returns {Promise<*>}
 */
export async function scaffoldDjango(options) {
  const output = standardOutputBuilder();
  console.log('preparing to scaffold your django project...');
  console.log('executing scaffoldDjango at ', new Date().toString());
  // check if we have a project name in options, if not exit
  const { projectName, withPipenv } = options;
  // TODO: validate projectName based on Django requirements
  if (!validateProjectName(projectName)) {
    output.result =
      'Invalid project name. Project names should start with a letter and contain no spaces or dashes. For example: some_project';
    return output;
  }

  console.log('creating project with name: ', projectName);

  // get the current directory and append the projectName
  const destination = path.join(process.cwd(), projectName);
  try {
    // make the directory if it does not exist
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination);
    }

    fs.accessSync(destination, constants.R_OK | constants.W_OK);
  } catch (e) {
    console.log('nope, that did not work. Here is your error: ', e.toString());
    return false;
  }

  // change directory to destination
  process.chdir(destination);

  console.log('in directory: ', process.cwd());
  const venvCommand = 'python3 -m virtualenv .venv';
  const pipenvCommand = PIPENV_COMMAND;
  // create virtual environment
  try {
    await execaCommand(PIPENV_COMMAND).stdout.pipe(process.stdout);
    // Kick off the dependency installation
    const installDepsResults = await installDependencies();
    console.log('install deps results: ', installDepsResults.result);

    // Determine environment of the related virtual environment
    const pipenvLocation = await getVirtualEnvLocation();
    console.log('pipenv location: ', pipenvLocation.result);

    // build path to the python executable
    const pythonExecutable = path.join(
      String(pipenvLocation.result).trim(),
      'bin',
      'python3'
    );
    console.log('python executable to be used: ', pythonExecutable);

    // Create the django project or at least attempt to
    const createProjectResult = await createDjangoProject(
      projectName,
      pythonExecutable
    );
    console.log('create project results: ', createProjectResult.result);

    // copy settings template
    console.log('copy django files to project');
    await copyDjangoSettings(destination);
    // generate secret key file and update dirt_settings/dev.py
    const secretKey = generateSecretKey();
    console.log('setting secret key...');
    const devSettingsPath = path.join(
      destination,
      DIRT_SETTINGS_FOLDER,
      DEV_PY_FILENAME
    );
    await writeDevSettings(secretKey, devSettingsPath);
    const baseSettingsPath = path.join(
      destination,
      DIRT_SETTINGS_FOLDER,
      BASE_PY_FILENAME
    );
    await writeBaseSettings(projectName, baseSettingsPath);
    // delete generated settings file
    console.log(
      "Removing default settings.py file (we won't need it anymore, trust me...)"
    );
    const originalSettingsFilePath = path.join(
      destination,
      projectName,
      SETTINGS_PY_FILE
    );
    await unlink(originalSettingsFilePath);

    // rename git ignore file
    const originalIgnorePath = path.join(destination, GIT_IGNORE_TEMPLATE_FILE);
    const newIgnorePath = path.join(destination, GIT_IGNORE_FILENAME);
    console.log('renaming ignore file...');
    await rename(originalIgnorePath, newIgnorePath);

    // overwrite urls.py and views.py in base project
    const projectPath = path.join(destination, projectName);
    await copyInertiaDefaults(projectPath);

    console.log('Making project runnable...');
    // change permissions of manage.py so that we can run it
    // check if on windows on *Nix
    const managePyPath = path.join(destination, MANAGE_PY_FILENAME);
    await chmod(managePyPath, MANAGE_PY_MODE);
    // create additional folders
    console.log('Creating static folder....');
    const staticFolderPath = path.join(destination, STATIC_FOLDER_NAME);
    await mkdir(staticFolderPath);

    output.success = true;
    return output;
  } catch (e) {
    output.result = `Failed to scaffold Django project with error: ${e.message}`;
    return output;
  }
}
