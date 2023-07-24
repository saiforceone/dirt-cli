import os from 'node:os';
import path from 'node:path';
import { access, cp as copy, writeFile } from 'node:fs/promises';
import { exec } from 'child_process';
import { createRequire } from 'module';
import { standardOutputBuilder } from './standardOutputBuilder.js';
import constants from 'node:constants';
import {
  PACKAGE_JSON_FILE,
  STORYBOOK_SCRIPT_BUILD,
  STORYBOOK_SCRIPT_DEV,
  STORYBOOK_SCRIPT_DEV_PRE,
} from '../constants/feConstants.js';
import { getPackageFile } from './feUtils.js';
import { normalizeWinFilePath } from './fileUtils.js';
import { FILE_COPY_OPTS } from '../constants/index.js';
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;
import DIRTPkgFile = DIRTStackCLI.DIRTPkgFile;
import DIRTStorybookOpts = DIRTStackCLI.DIRTStorybookOpts;
import Frontend = DIRTStackCLI.Frontend;

const require = createRequire(import.meta.url);
const storybookDeps = require('../../configs/storybookDependencies.json');

/**
 * @description Helper function that handles installing core frontend dependencies
 */
export function installCoreFrontendDependencies(): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  return new Promise((resolve, reject) => {
    exec('npm i', (error, stdout, stderr) => {
      if (error) {
        output.result = error.message;
        reject(output);
      }

      output.success = true;
      output.result = stdout ? stdout : stderr;
      resolve(output);
    });
  });
}

/**
 * @description Helper function that copies frontend static files to the correct directory
 * @param {string} source
 * @param {string} destinationBase
 */
export async function copyFrontendStaticResources(
  source: string,
  destinationBase: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;
    let templateBaseDir = path.resolve(
      new URL(currentFileUrl).pathname,
      source
    );

    if (os.platform() === 'win32')
      templateBaseDir = normalizeWinFilePath(templateBaseDir);

    try {
      await access(destinationBase, constants.W_OK);
      await copy(templateBaseDir, destinationBase, FILE_COPY_OPTS);
    } catch (e) {
      output.error = (e as Error).message;
      return output;
    }
    output.result = `Frontend static resources copied`;
    output.success = true;
    return output;
  } catch (e) {
    output.error = e.toString();
    output.result = 'Failed to copy frontend static resources';
    return output;
  }
}

/**
 * @description Helper function that copies frontend Template files to the destination
 * @param {string} source
 * @param {string} destinationBase
 * @returns {Promise<{error: String, result: *, success: boolean}>}
 */
export async function copyFrontendResources(
  source: string,
  destinationBase: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;
    let templateBaseDir = path.resolve(
      path.normalize(new URL(currentFileUrl).pathname),
      source
    );

    if (os.platform() === 'win32')
      templateBaseDir = normalizeWinFilePath(templateBaseDir);

    await access(destinationBase, constants.W_OK);

    try {
      await copy(templateBaseDir, destinationBase, FILE_COPY_OPTS);
    } catch (e) {
      output.error = (e as Error).message;
      return output;
    }

    output.result = `Frontend resources copied`;
    output.success = true;
    return output;
  } catch (e) {
    output.result = 'Failed to copy frontend resources to destination';
    output.error = e.toString();
    return output;
  }
}

/**
 * @description Helper function that copies storybook files for the frontend
 * @param {DIRTStorybookOpts} opts
 */
export async function copyFrontendStorybookFiles(
  opts: DIRTStorybookOpts
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;
    let templateBaseDir = path.resolve(
      new URL(currentFileUrl).pathname,
      opts.templateSource
    );

    if (os.platform() === 'win32')
      templateBaseDir = normalizeWinFilePath(templateBaseDir);

    await access(opts.destinationBase, constants.W_OK);

    try {
      await copy(templateBaseDir, opts.destinationBase, FILE_COPY_OPTS);
    } catch (e) {
      output.error = (e as Error).message;
      return output;
    }

    let storiesBaseDir = path.resolve(
      path.normalize(new URL(currentFileUrl).pathname),
      opts.storySource
    );

    if (os.platform() === 'win32')
      storiesBaseDir = normalizeWinFilePath(storiesBaseDir);

    try {
      await copy(
        storiesBaseDir,
        path.join(opts.destinationBase, `dirt_fe_${opts.frontend}`, 'src'),
        FILE_COPY_OPTS
      );
    } catch (e) {
      output.error = (e as Error).message;
      return output;
    }

    output.result = `Storybook resources copied`;
    output.success = true;
    return output;
  } catch (e) {
    output.result = 'Failed to Storybook resources to destination';
    output.error = e.toString();
    return output;
  }
}

/**
 * @description Helper function that installs storybook.js dependencies
 * @param {Frontend} frontend
 */
export async function installStorybookDependencies(
  frontend: Frontend
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  const { commonPackages } = storybookDeps;

  const installString = Object.keys(commonPackages)
    .map((pkg) => {
      return `${pkg}@${commonPackages[pkg]}`;
    })
    .join(' ');
  const feDeps = storybookDeps[frontend];
  const feString = Object.keys(feDeps)
    .map((pkg) => `${pkg}@${feDeps[pkg]}`)
    .join(' ');

  return new Promise((resolve, reject) => {
    exec(`npm i -D ${installString} ${feString}`, (error) => {
      if (error) {
        output.result = error.message;
        reject(output);
      }

      output.success = true;
      resolve(output);
    });
  });
}

/**
 * @todo Extract functionality to update package.json to a generic function
 * @description Updates the package.json file with the storybook scripts
 * @param destinationPath
 */
export async function updateNPMScriptsForStorybook(
  destinationPath: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    // read & parse the package.json file in the project
    const pkgFilePath = path.join(destinationPath, PACKAGE_JSON_FILE);
    const fileContents = (await getPackageFile(destinationPath)) as DIRTPkgFile;

    // add entries to "scripts" for storybook
    fileContents['scripts']['prestorybook'] = STORYBOOK_SCRIPT_DEV_PRE;
    fileContents['scripts']['storybook'] = STORYBOOK_SCRIPT_DEV;
    fileContents['scripts']['storybook-build'] = STORYBOOK_SCRIPT_BUILD;

    // save the file and return
    await writeFile(pkgFilePath, JSON.stringify(fileContents, null, 2));

    output.result = 'Package file updated';
    output.success = true;
    return output;
  } catch (e) {
    output.error = e.toString();
    output.result = 'Failed to update NPM scripts for Storybook';
    return output;
  }
}

export function writeReactFrontendPage() {
  return `// Generated with D.I.R.T Stack CLI
// todo: replace the markup as needed
import React from 'react';
import { TbShovel } from 'react-icons/tb';
import { FaDiscord, FaGithubAlt } from 'react-icons/fa';
import { BaseControllerProps } from '../../@types/dirtReact';

const Main = ({ controllerName }: BaseControllerProps): React.ReactNode => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#02111B] to-[#30292F]">
      <div className="flex flex-col container mx-auto md:max-w-5xl gap-y-10 text-center h-full p-4">
        <TbShovel className="self-center text-white" size={100} />
        <h1 className="text-white text-2xl sm:text-3xl md:text-7xl font-heading">
          Controller / Django App: {controllerName}
        </h1>
        <h3 className="text-2xl sm:text-3xl text-white font-heading underline">
          General Information
        </h3>
        <div className="flex flex-col self-center gap-y-2 w-4/5 md:w-3/5">
          <p className="text-white">
            This is the default page for the generated app. Replace the contents
            of this page with whatever you want.
          </p>
          <p className="text-white">
            To change the props that are passed to this inertia view, edit the
            dictionary returned by the following file:{' '}
            <span className="font-semibold bg-blue-800 px-1 rounded">{controllerName}/views.py'</span>
          </p>
        </div>
        <h3 className="text-2xl sm:text-3xl text-white font-heading underline">
          Database Information
        </h3>
        <div className="flex flex-col self-center w-4/5 md:w-3/5">
          <p className="text-white">
            To make use of the models file and run db migrations{' '}
            <span className="font-semibold bg-blue-800 px-1 rounded">{controllerName}/models.py</span>
            , you will need to add{' '}
            <span className="text-gray-100">{controllerName}</span> to{' '}
            <span className="font-semibold text-white px-1 rounded bg-blue-800">
              INSTALLED_APPS
            </span>{' '}
            in your settings files as shown in the example below
          </p>
          <div className="mt-1 text-md sm:text-base inline-flex text-left w-fit self-center items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 pl-6">
            <span className="flex-1">
              <span>INSTALLED_APPS += </span>[
              <span className="text-orange-600 font-semibold">
                '{controllerName}'
              </span>
              ]
            </span>
          </div>
        </div>
        <h3 className="text-2xl sm:text-3xl text-white font-heading underline">
          Resources
        </h3>
        <p className="text-white">
          Feeling stuck or have questions? Try the links below
        </p>
        <div className="flex self-center gap-x-8 text-white">
          <a
            className="flex text-white items-center hover:text-white gap-x-2"
            target="_blank"
            href="https://github.com/saiforceone/dirt-cli"
          >
            <FaGithubAlt size={32} /> <span>Git D.I.R.T-y</span>
          </a>
          <a
            className="flex text-white items-center hover:text-white gap-x-2"
            target="_blank"
            href="https://discord.gg/sY3a5VN3y9"
          >
            <FaDiscord size={32} /> PCE Discord
          </a>
        </div>
      </div>
    </div>
  );
};

export default Main;

`;
}
