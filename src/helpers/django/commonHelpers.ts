import os, { platform } from 'node:os';
import { chmod, mkdir, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { $, execa, execaCommand } from 'execa';
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
  STATIC_FILES_FOLDER_NAME,
  STATIC_FOLDER_NAME,
  STDIO_OPTS,
} from '../../constants/djangoConstants.js';
import { standardOutputBuilder } from '../../utils/standardOutputBuilder.js';
import {
  copyAssets,
  copyDjangoHTMLTemplates,
  copyDjangoSettings,
  copyInertiaDefaults,
  createDjangoProject,
  getVirtualEnvLocation,
  installDependencies,
  writeBaseSettings,
  writeDatabaseSettings,
  writeDevSettings,
  writeInertiaViewsFile,
} from '../../utils/djangoUtils.js';
import ConsoleLogger from '../../utils/ConsoleLogger.js';
import {
  MESSAGE_COPYING_DIRT_FILES,
  MESSAGE_COPYING_HTML_TEMPLATES,
  MESSAGE_DIRT_FILES_COPIED,
  MESSAGE_DIRT_TEMPLATES_COPIED,
  MESSAGE_SECRET_KEY_SET,
  MESSAGE_SETTING_SECRET_KEY,
} from '../../constants/strings.js';
import { generateSecretKey } from '../../utils/generateSecretKey.js';
import { normalizeWinFilePath } from '../../utils/fileUtils.js';
import { LOCAL_ASSET_BUILDERS_PATH } from '../../constants/index.js';
import ScaffoldOptions = DIRTStackCLI.ScaffoldOptions;
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;
import { checkDestinationExistence } from '../shared/coreHelpers.js';

async function executeCommand(commandString: string): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    if (platform() === 'win32') {
      await $(STDIO_OPTS)`${commandString}`;
    } else {
      // exec for anything non-windows
      await execaCommand(commandString).stdout?.pipe(process.stdout);
    }
    output.success = true;
    return output;
  } catch (e) {
    output.result = 'Failed to execute command';
    output.error = (e as Error).message;
    return output;
  }
}

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
      await execaCommand(PIPENV_COMMAND).stdout?.pipe(process.stdout);
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

  // Copy Django Base Templates
  if (useVerboseLogs)
    ConsoleLogger.printMessage(MESSAGE_COPYING_HTML_TEMPLATES);
  const copyDjangoTemplateFilesResult = await copyDjangoHTMLTemplates({
    destinationBase: destination,
    frontend: options.frontend,
  });
  if (useVerboseLogs) ConsoleLogger.printOutput(copyDjangoTemplateFilesResult);
  if (!copyDjangoTemplateFilesResult.success)
    return copyDjangoTemplateFilesResult;
  if (useVerboseLogs) ConsoleLogger.printMessage(MESSAGE_DIRT_TEMPLATES_COPIED);

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
  const secretKeyResult = await writeDevSettings(
    secretKey,
    projectName,
    devSettingsPath
  );
  if (useVerboseLogs) ConsoleLogger.printOutput(secretKeyResult);
  if (!secretKeyResult.success) return secretKeyResult;
  if (useVerboseLogs) ConsoleLogger.printMessage(MESSAGE_SECRET_KEY_SET);

  // Database
  if (options['databaseOption'] !== 'None') {
    if (useVerboseLogs)
      ConsoleLogger.printMessage('Applying database settings...');
    const databaseResult = await writeDatabaseSettings(
      options.projectName,
      devSettingsPath,
      options['databaseOption']
    );
    if (useVerboseLogs) ConsoleLogger.printOutput(databaseResult);
    if (!databaseResult.success) return databaseResult;
  }

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
    if (useVerboseLogs)
      ConsoleLogger.printMessage((e as Error).message, 'error');
    output.error = (e as Error).message;
    return output;
  }

  // copy template tags
  try {
    if (useVerboseLogs) ConsoleLogger.printMessage('Copying template tags');
  } catch (e) {
    if (useVerboseLogs)
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
  let staticFolderPath = path.join(destination, STATIC_FOLDER_NAME);
  let staticFilesPath = path.join(destination, STATIC_FILES_FOLDER_NAME);
  if (platform() === 'win32') {
    staticFolderPath = normalizeWinFilePath(staticFolderPath);
    staticFilesPath = normalizeWinFilePath(staticFilesPath);
  }
  try {
    await mkdir(staticFolderPath);
    await mkdir(staticFilesPath);
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

  // copy build-script
  if (useVerboseLogs)
    ConsoleLogger.printMessage('Copying local asset builder scripts...');
  const copyAssetBuilderResult = await copyAssets(
    LOCAL_ASSET_BUILDERS_PATH,
    destination
  );

  if (!copyAssetBuilderResult.success) {
    if (useVerboseLogs) ConsoleLogger.printOutput(copyAssetBuilderResult);
    return copyAssetBuilderResult;
  }

  if (useVerboseLogs) ConsoleLogger.printOutput(copyAssetBuilderResult);

  // finally, return output
  output.success = true;
  return output;
}

/**
 * todo restructure order of steps being executed
 * @description Executes the process to create a django application copying the
 * necessary files to target locations
 * @param destinationBase
 * @param appName
 */
export async function createDjangoApp(
  destinationBase: string,
  appName: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    // check destination existence
    let targetPath = path.join(destinationBase, appName);
    ConsoleLogger.printMessage(
      `attempting to scaffold app at target path: ${targetPath}`
    );
    if (platform() === 'win32') targetPath = normalizeWinFilePath(targetPath);

    if (checkDestinationExistence(targetPath).success) {
      output.error = 'Controller already exists. Exiting...';
      return output;
    }

    // get the path to the python executable
    const envLocationResult = await getVirtualEnvLocation();
    if (!envLocationResult.success) {
      output.error = envLocationResult.error;
      return output;
    }

    const envPath = envLocationResult.result.trim();
    const pythonExecPath =
      platform() === 'win32'
        ? normalizeWinFilePath(path.join(envPath, 'Scripts', 'python.exe'))
        : path.join(envPath, 'bin', 'python3');

    ConsoleLogger.printMessage(`python path: ${pythonExecPath}`);

    // execute command to create the django application
    if (os.platform() === 'win32') {
      try {
        await $(STDIO_OPTS)`python manage.py startapp ${appName}`;
      } catch (e) {
        output.error = (e as Error).message;
        return output;
      }
    } else {
      try {
        // execute the command
        const commandString = `${pythonExecPath} manage.py startapp ${appName}`;

        console.log('use command string: ', commandString);
        console.log('running from: ', process.cwd());
        const { stdout, stderr } = await execa(commandString);
        console.log('stdout: ', stdout);

        // overwrite urls.py file

        // exec write files
        const writeFilesResult = await writeInertiaViewsFile(
          destinationBase,
          appName
        );

        ConsoleLogger.printOutput(writeFilesResult);
        // copy over templates
      } catch (e) {
        console.log('failed to execute command with error: ', e.toString());
        output.error = (e as Error).message;
        return output;
      }
    }

    return output;
  } catch (e) {
    ConsoleLogger.printMessage(e.toString(), 'error');
    output.error = (e as Error).message;
    return output;
  }
}
