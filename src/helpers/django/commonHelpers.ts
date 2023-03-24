import os from 'node:os';
import { chmod, mkdir, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { $, execaCommand } from 'execa';
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
  STDIO_OPTS,
} from '../../constants/djangoConstants.js';
import { standardOutputBuilder } from '../../utils/standardOutputBuilder.js';
import {
  copyDjangoSettings,
  copyInertiaDefaults,
  createDjangoProject,
  getVirtualEnvLocation,
  installDependencies,
  writeBaseSettings,
  writeDevSettings,
} from '../../utils/djangoUtils.js';
import ConsoleLogger from '../../utils/ConsoleLogger.js';
import {
  MESSAGE_COPYING_DIRT_FILES,
  MESSAGE_DIRT_FILES_COPIED,
  MESSAGE_SECRET_KEY_SET,
  MESSAGE_SETTING_SECRET_KEY,
} from '../../constants/strings.js';
import { generateSecretKey } from '../../utils/generateSecretKey.js';
import ScaffoldOptions = DIRTStackCLI.ScaffoldOptions;
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;

/**
 * @async
 * @description executes windows-specific commands to scaffold the Django application
 * @param {ScaffoldOptions} options
 * @param {string} destination
 */
export async function scaffoldDjangoProcess(
  options: ScaffoldOptions,
  destination: string
): Promise<ScaffoldOutput> {
  const { projectName, verboseLogs: useVerboseLogs } = options;

  const output = standardOutputBuilder();

  // 1. init pipenv's shell
  if (os.platform() === 'win32') {
    try {
      await $(STDIO_OPTS)`${PIPENV_COMMAND}`;
    } catch (e) {
      output.result = 'Failed to start virtual environment. Will exit now';
      output.error = e.toString();
      return output;
    }
  } else {
    try {
      // @ts-ignore
      await execaCommand(PIPENV_COMMAND).stdout.pipe(process.stdout);
    } catch (e) {
      if (useVerboseLogs)
        ConsoleLogger.printMessage((e as Error).message, 'error');
      output.result = `Failed to exec pipenv command: ${(e as Error).message}`;
      return output;
    }
  }

  // 2. install dependencies
  const installDepsResult: ScaffoldOutput = await installDependencies();

  if (!installDepsResult.success) {
    if (useVerboseLogs) ConsoleLogger.printOutput(installDepsResult);

    return installDepsResult;
  }

  // 3. get venv location
  const pipenvLocResult: ScaffoldOutput = await getVirtualEnvLocation();
  if (useVerboseLogs) ConsoleLogger.printOutput(pipenvLocResult);
  if (!pipenvLocResult.success) {
    return pipenvLocResult;
  }

  // 4. build path to python executable
  const pipenvLoc = String(pipenvLocResult.result).trim();
  const pythonExecutable =
    os.platform() === 'win32'
      ? path.join(pipenvLoc, 'Scripts', 'python.exe')
      : path.join(pipenvLoc, 'bin', 'python3');

  if (useVerboseLogs)
    ConsoleLogger.printMessage(`Using python executable: ${pythonExecutable}`);

  // 5. create django project
  try {
    const createDjangoProjResult: ScaffoldOutput = await createDjangoProject(
      projectName,
      pythonExecutable
    );
    if (useVerboseLogs) ConsoleLogger.printOutput(createDjangoProjResult);
    if (!createDjangoProjResult.success) return createDjangoProjResult;
  } catch (e) {
    output.error = (e as Error).message;
    return output;
  }

  // 6. copy django
  if (useVerboseLogs) ConsoleLogger.printMessage(MESSAGE_COPYING_DIRT_FILES);
  const copyDjangoFilesResult = await copyDjangoSettings(destination);
  if (useVerboseLogs) ConsoleLogger.printOutput(copyDjangoFilesResult);
  if (!copyDjangoFilesResult.success) return copyDjangoFilesResult;
  if (useVerboseLogs) ConsoleLogger.printMessage(MESSAGE_DIRT_FILES_COPIED);

  // 7. Secret key
  if (useVerboseLogs) ConsoleLogger.printMessage(MESSAGE_SETTING_SECRET_KEY);
  // 7.1 generate key
  const secretKey = generateSecretKey();
  // 7.2 Build path
  const devSettingsPath = path.join(
    destination,
    DIRT_SETTINGS_FOLDER,
    DEV_PY_FILENAME
  );
  // 7.3 write secret key
  const secretKeyResult = await writeDevSettings(secretKey, devSettingsPath);
  if (useVerboseLogs) ConsoleLogger.printOutput(secretKeyResult);
  if (!secretKeyResult.success) return secretKeyResult;
  if (useVerboseLogs) ConsoleLogger.printMessage(MESSAGE_SECRET_KEY_SET);

  // update base settings file
  const baseSettingsPath = path.join(
    destination,
    DIRT_SETTINGS_FOLDER,
    BASE_PY_FILENAME
  );
  if (useVerboseLogs)
    ConsoleLogger.printMessage('Updating Django application base settings...');
  const baseSettingsResult = await writeBaseSettings(
    projectName,
    baseSettingsPath
  );
  if (!baseSettingsResult.success) return baseSettingsResult;
  if (useVerboseLogs)
    ConsoleLogger.printMessage(
      'Successfully updated Django application base settings',
      'success'
    );

  // 7.4 delete generated settings file
  if (useVerboseLogs)
    ConsoleLogger.printMessage(
      "Removing default settings.py file (we won't need it anymore, trust me...)"
    );

  const originalSettingsFilePath = path.join(
    destination,
    projectName,
    SETTINGS_PY_FILE
  );

  try {
    await unlink(originalSettingsFilePath);

    if (useVerboseLogs)
      ConsoleLogger.printMessage('Removed default settings file', 'success');
  } catch (e) {
    ConsoleLogger.printMessage((e as Error).message, 'error');
    output.error = (e as Error).message;
    return output;
  }

  // rename git ignore file
  const originalIgnorePath = path.join(destination, GIT_IGNORE_TEMPLATE_FILE);
  const newIgnorePath = path.join(destination, GIT_IGNORE_FILENAME);
  if (useVerboseLogs) ConsoleLogger.printMessage('Renaming ignore file...');
  try {
    await rename(originalIgnorePath, newIgnorePath);
  } catch (e) {
    output.error = (e as Error).message;
    return output;
  }

  if (useVerboseLogs)
    ConsoleLogger.printMessage(
      'Ignore file was renamed. You may update this .gitignore file as you see fit',
      'success'
    );

  // overwrite urls.py and views.py in base project
  const projectPath = path.join(destination, projectName);
  if (useVerboseLogs)
    ConsoleLogger.printMessage(
      'Copying default D.I.R.T Stack Inertia files...'
    );
  const cpInertiaResult = await copyInertiaDefaults(projectPath);
  if (!cpInertiaResult.success) return cpInertiaResult;

  if (useVerboseLogs)
    ConsoleLogger.printMessage('Successfully copied files', 'success');

  if (useVerboseLogs)
    ConsoleLogger.printMessage(
      'Making project runnable by updating manage.py permissions...'
    );
  // change permissions of manage.py so that we can run it
  // check if on windows on *Nix
  const managePyPath = path.join(destination, MANAGE_PY_FILENAME);
  try {
    await chmod(managePyPath, MANAGE_PY_MODE);
  } catch (e) {
    if (useVerboseLogs)
      ConsoleLogger.printMessage(
        `Error changing manage.py permissions: ${(e as Error).message}`,
        'error'
      );
    output.error = (e as Error).message;
    return output;
  }

  if (useVerboseLogs)
    ConsoleLogger.printMessage(
      'Permissions updated. Project now runnable',
      'success'
    );

  // create additional folders
  if (useVerboseLogs) ConsoleLogger.printMessage('Creating static folder....');
  const staticFolderPath = path.join(destination, STATIC_FOLDER_NAME);
  try {
    await mkdir(staticFolderPath);
  } catch (e) {
    if (useVerboseLogs)
      ConsoleLogger.printMessage(
        `Failed to make static folder with error: ${(e as Error).message}`,
        'error'
      );
    output.error = (e as Error).message;
    return output;
  }

  if (useVerboseLogs)
    ConsoleLogger.printMessage('Static folder created', 'success');

  // finally, return output
  output.success = true;
  return output;
}
