import path from 'node:path';
import { $ } from 'execa';
import {
  DEV_PY_FILENAME,
  DIRT_SETTINGS_FOLDER,
  PIPENV_COMMAND,
} from '../../constants/djangoConstants.js';
import { standardOutputBuilder } from '../../utils/standardOutputBuilder.js';
import {
  copyDjangoSettings,
  createDjangoProject,
  getVirtualEnvLocation,
  installDependencies,
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

const STDIO_OPTS = Object.freeze({ stdio: 'ignore' });

/**
 * @async
 * @description executes windows-specific commands to scaffold the Django application
 * @param options
 * @param {string} destination
 * @returns {Promise<{error: String, result: *, success: boolean}>}
 */
export async function scaffoldDjangoWindows(options, destination) {
  const { projectName, useVerboseLogs } = options;
  const output = standardOutputBuilder();
  // 1. init pipenv's shell
  await $(STDIO_OPTS)`${PIPENV_COMMAND}`;

  // 2. install dependencies
  const installDepsResult = await installDependencies();

  if (!installDepsResult.success) {
    if (useVerboseLogs) ConsoleLogger.printOutput(installDepsResult);

    return installDepsResult;
  }

  // 3. get venv location
  const pipenvLocResult = await getVirtualEnvLocation();
  if (useVerboseLogs) ConsoleLogger.printOutput(pipenvLocResult);
  if (!pipenvLocResult.success) {
    return pipenvLocResult;
  }

  // 4. build path to python executable
  const pythonExecutable = path.join(
    String(pipenvLocResult.result).trim(),
    'Scripts',
    'python.exe'
  );

  ConsoleLogger.printMessage(`Using python executable: ${pythonExecutable}`);

  // 5. create django project
  try {
    const createDjangoProjResult = await createDjangoProject(
      projectName,
      pythonExecutable
    );
    if (useVerboseLogs) ConsoleLogger.printOutput(createDjangoProjResult);
    if (!createDjangoProjResult.success) return createDjangoProjResult;
  } catch (e) {
    console.error('oops: ', e);
    output.error = e;
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
  ConsoleLogger.printMessage(MESSAGE_SECRET_KEY_SET);

  // finally, return output
  output.success = true;
  return output;
}
