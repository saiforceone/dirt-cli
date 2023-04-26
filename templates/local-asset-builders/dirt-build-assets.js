/**
 * Basic script to package assets for deployment based on requirements for Vercel
 */
const { platform } = require('node:os');
const { exec } = require('node:child_process');

const COMMAND_VITE_BUILD = 'npm run vite-build';
const COMMAND_TAILWIND_BUILD = 'npm run tailwind';
const COMMAND_DJ_COLLECT = 'exec ./manage.py collectstatic --no-input';
const COMMAND_DJ_COLLECT_WIN = 'py manage.py collectstatic --no-input';
const COMMAND_DJ_FREEZE = 'exec pipenv --quiet requirements > requirements.txt';
const COMMAND_DJ_FREEZE_WIN = 'pipenv --quiet requirements > requirements.txt';

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
