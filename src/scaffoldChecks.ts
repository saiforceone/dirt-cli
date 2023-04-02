import ora from 'ora';
import path from 'node:path';
import { platform } from 'node:os';
import ScaffoldOptions = DIRTStackCLI.ScaffoldOptions;
import { checkDestinationExistence } from './helpers/shared/coreHelpers.js';
import ConsoleLogger from './utils/ConsoleLogger.js';
import {
  MESSAGE_EXAMPLE_VENV_PATH_POSIX,
  MESSAGE_EXAMPLE_VENV_PATH_WINDOWS,
} from './constants/strings.js';

/**
 * @description Checks that should be run before the scaffolding process starts
 * @param {ScaffoldOptions} options
 */
export function scaffoldChecks(options: ScaffoldOptions) {
  const checksSpinner = ora('Running pre-scaffold checks...');
  const { projectName, verboseLogs } = options;
  const destinationPath = path.join(process.cwd(), projectName);
  // check project existence
  if (verboseLogs)
    ConsoleLogger.printMessage('Checking if project destination is valid...');
  else checksSpinner.start('Checking if project destination is valid');

  const existenceResult = checkDestinationExistence(destinationPath);

  if (existenceResult.success) {
    if (verboseLogs) {
      ConsoleLogger.printMessage('Project destination already exists', 'error');
      ConsoleLogger.printMessage(
        `You may need to delete the corresponding virtual environment if it exists: ${
          platform() === 'win32'
            ? MESSAGE_EXAMPLE_VENV_PATH_WINDOWS + projectName + '-xxx'
            : MESSAGE_EXAMPLE_VENV_PATH_POSIX + projectName + '-xxx'
        }`
      );
    } else {
      checksSpinner.fail(existenceResult.error);
    }

    process.exit(1);
  }
  if (verboseLogs)
    ConsoleLogger.printMessage(
      'Project destination is valid. Scaffolding project...',
      'success'
    );
  else checksSpinner.succeed();
}
