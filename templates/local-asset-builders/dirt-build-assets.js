/**
 * Basic script to package assets for deployment based on requirements for Vercel
 */
const { existsSync } = require('node:fs');
const { platform } = require('node:os');
const { exec } = require('node:child_process');
const path = require('node:path');

const COMMAND_VITE_BUILD = 'npm run vite-build';
const COMMAND_TAILWIND_BUILD = 'npm run tailwind';
const COMMAND_DJ_COLLECT =
  'exec ./manage.py collectstatic --settings=dirt_settings.prod --no-input';
const COMMAND_DJ_COLLECT_WIN =
  'py manage.py collectstatic --settings=dirt_settings.prod --no-input';
const COMMAND_DJ_FREEZE = 'exec pipenv --quiet requirements > requirements.txt';
const COMMAND_DJ_FREEZE_WIN = 'pipenv --quiet requirements > requirements.txt';

/**
 * @description Helper function that ensures that our file path will work with windows
 * @param {string} filePath
 * @returns
 */
function normalizeWinFilePath(filePath) {
  return filePath.replace(/^([A-Z]:\\)([A-Z]:\\)/i, '$2');
}

/**
 * @description Helper function that checcks for the existence of production py file
 * @returns <{success: boolean, message: string}>
 */
function preBuildChecks() {
  const result = { success: false, message: undefined };
  // get the current directory
  const currentDir = process.cwd();
  // construct the path to our settings file
  let settingsPath = path.join(currentDir, 'dirt_settings', 'prod.py');

  if (platform() === 'win32') settingsPath = normalizeWinFilePath(settingsPath);

  // check if it exists
  if (existsSync(settingsPath)) {
    result.success = true;
    return result;
  }

  // check environment variable
  // Note: If you don't want to use environment variables, you may remove this check
  if (!process.env.DIRT_SKEY) {
    result.message =
      'You have not yet set a secret key [DIRT_SKEY] in your environment. Please do so or update this script [dirt-build-assets.js] to not perform this check';
    return result;
  }

  result.message =
    'Production settings file [prod.py] not found. You should create this file first using the [production.example.py] file in dirt_settings.';
  return result;
}

/**
 * @description Helper function that executes commands via the shell
 * @param commandString
 * @returns {Promise<{success: boolean, stdout: string, error: string}>}
 */
function execCommand(commandString) {
  return new Promise((resolve, reject) => {
    exec(commandString, (error, stdout, stderr) => {
      const output = { success: false, stdout, error: error || stderr };
      if (error) {
        reject(output);
      }

      output.success = true;
      resolve(output);
    });
  });
}

/**
 * @description Helper function that builds the assets required for production.
 * This should work with the vercel deployment config or a standard Django app deployment
 * @returns {Promise<void>}
 */
async function runScripts() {

  const isWindows = platform() === 'win32';
  // preBuild checks
  const preBuildCheckResults = preBuildChecks();
  if (!preBuildCheckResults.success) {
    console.log(preBuildCheckResults.message);
    process.exit(1);
  }
  // run vite build
  console.log('building vite assets...');
  const viteBuildResult = await execCommand(COMMAND_VITE_BUILD);
  console.log(viteBuildResult.stdout);
  // run tailwind
  console.log('building tailwind assets...');
  const tailwindBuildResult = await execCommand(COMMAND_TAILWIND_BUILD);
  console.log(tailwindBuildResult.stdout);
  // collect static
  console.log('copying static files...');
  const djangoCollectResult = await execCommand(
    isWindows ? COMMAND_DJ_COLLECT_WIN : COMMAND_DJ_COLLECT
  );
  console.log(djangoCollectResult.error);
  console.log(djangoCollectResult.stdout);
  // update requirements.txt
  console.log('Freezing Django dependencies...');
  const freezeResult = await execCommand(
    isWindows ? COMMAND_DJ_FREEZE_WIN : COMMAND_DJ_FREEZE
  );
  console.log(freezeResult.error);
  console.log(freezeResult.stdout);

  console.log('All production assets built. Happy deployment');
}

runScripts().then();
