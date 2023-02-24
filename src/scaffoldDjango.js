/**
 * scaffoldDjango.js
 * This is the main file responsible for scaffolding the Django part of the DIRT stack
 */
import { execaCommand } from 'execa';
import path from 'path';
import fs from 'fs';
import { chmod, mkdir, rename, unlink } from 'node:fs/promises';
import ConsoleLogger from './utils/ConsoleLogger.js';
import { generateSecretKey } from './utils/generateSecretKey.js';
import constants from 'node:constants';
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

const {
  copyDjangoSettings,
  copyInertiaDefaults,
  createDjangoProject,
  getVirtualEnvLocation,
  installDependencies,
  writeBaseSettings,
  writeDevSettings,
} = await import('./utils/djangoUtils.js');

/**
 * @description Main function that kicks off the process for scaffolding the Django application
 * @param options The options coming in from the CLI (process.argv)
 * @returns {Promise<*>}
 */
export async function scaffoldDjango(options) {
  const output = standardOutputBuilder();
  ConsoleLogger.printMessage('preparing to scaffold your django project...');
  ConsoleLogger.printMessage('executing scaffoldDjango...');
  // check if we have a project name in options, if not exit
  const { projectName } = options;
  // TODO: validate projectName based on Django requirements
  if (!validateProjectName(projectName)) {
    output.result =
      'Invalid project name. Project names should start with a letter and contain no spaces or dashes. For example: some_project';
    return output;
  }

  ConsoleLogger.printMessage(`creating project with name: ${projectName}`);

  // get the current directory and append the projectName
  const destination = path.join(process.cwd(), projectName);
  try {
    // make the directory if it does not exist
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination);
    }

    fs.accessSync(destination, constants.R_OK | constants.W_OK);
  } catch (e) {
    output.result = `Failed to scaffold django project with error: ${e.toString()}`;
    return output;
  }

  // change directory to destination
  process.chdir(destination);

  ConsoleLogger.printMessage(`in directory:  ${process.cwd()}`);
  // create virtual environment
  try {
    await execaCommand(PIPENV_COMMAND).stdout.pipe(process.stdout);
    // Kick off the dependency installation
    const installDepsResults = await installDependencies();
    const installDepsMessage = installDepsResults.success
      ? 'Django dependencies successfully installed'
      : `Django dependencies were not installed. Error information: ${installDepsResults.result}`;
    ConsoleLogger.printMessage(
      installDepsMessage,
      installDepsResults.success ? 'success' : 'error'
    );

    // Determine environment of the related virtual environment
    const pipenvLocation = await getVirtualEnvLocation();
    ConsoleLogger.printMessage(`Pipenv location: ${pipenvLocation.result}`);

    // build path to the python executable
    const pythonExecutable = path.join(
      String(pipenvLocation.result).trim(),
      'bin',
      'python3'
    );
    ConsoleLogger.printMessage(`Using Python executable ${pythonExecutable}`);

    // Create the django project or at least attempt to
    const createProjectResult = await createDjangoProject(
      projectName,
      pythonExecutable
    );
    ConsoleLogger.printMessage(
      `Django project was ${
        createProjectResult.success
          ? 'created successfully'
          : 'was not created successfully.'
      }`,
      createProjectResult.success ? 'success' : 'error'
    );

    // copy settings template
    ConsoleLogger.printMessage('Copying D.I.R.T Stack files to project...');
    await copyDjangoSettings(destination);
    ConsoleLogger.printMessage('D.I.R.T Stack files copied', 'success');
    // generate secret key file and update dirt_settings/dev.py
    const secretKey = generateSecretKey();
    ConsoleLogger.printMessage('Setting Django application secret key...');
    const devSettingsPath = path.join(
      destination,
      DIRT_SETTINGS_FOLDER,
      DEV_PY_FILENAME
    );
    await writeDevSettings(secretKey, devSettingsPath);
    ConsoleLogger.printMessage(
      'Django application secret key set successfully',
      'success'
    );
    const baseSettingsPath = path.join(
      destination,
      DIRT_SETTINGS_FOLDER,
      BASE_PY_FILENAME
    );
    ConsoleLogger.printMessage('Updating Django application base settings...');
    await writeBaseSettings(projectName, baseSettingsPath);
    ConsoleLogger.printMessage(
      'Successfully updated Django application base settings',
      'success'
    );
    // delete generated settings file
    ConsoleLogger.printMessage(
      "Removing default settings.py file (we won't need it anymore, trust me...)"
    );
    const originalSettingsFilePath = path.join(
      destination,
      projectName,
      SETTINGS_PY_FILE
    );
    await unlink(originalSettingsFilePath);
    ConsoleLogger.printMessage(
      'Successfully removed the default settings.py file',
      'success'
    );

    // rename git ignore file
    const originalIgnorePath = path.join(destination, GIT_IGNORE_TEMPLATE_FILE);
    const newIgnorePath = path.join(destination, GIT_IGNORE_FILENAME);
    ConsoleLogger.printMessage('Renaming ignore file...');
    await rename(originalIgnorePath, newIgnorePath);
    ConsoleLogger.printMessage(
      'Ignore file was renamed. You may update this .gitignore file as you see fit',
      'success'
    );

    // overwrite urls.py and views.py in base project
    const projectPath = path.join(destination, projectName);
    ConsoleLogger.printMessage(
      'Copying default D.I.R.T Stack Inertia files...'
    );
    await copyInertiaDefaults(projectPath);
    ConsoleLogger.printMessage('Successfully copied files', 'success');

    ConsoleLogger.printMessage(
      'Making project runnable by updating manage.py permissions...'
    );
    // change permissions of manage.py so that we can run it
    // check if on windows on *Nix
    const managePyPath = path.join(destination, MANAGE_PY_FILENAME);
    await chmod(managePyPath, MANAGE_PY_MODE);
    ConsoleLogger.printMessage(
      'Permissions updated. Project now runnable',
      'success'
    );
    // create additional folders
    ConsoleLogger.printMessage('Creating static folder....');
    const staticFolderPath = path.join(destination, STATIC_FOLDER_NAME);
    await mkdir(staticFolderPath);
    ConsoleLogger.printMessage('Folder created', 'success');
    output.success = true;
    output.result = 'Django project created successfully.';
    return output;
  } catch (e) {
    output.result = `Failed to scaffold Django project with error: ${e.message}`;
    return output;
  }
}
