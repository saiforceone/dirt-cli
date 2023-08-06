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

/**
 * @description Util function that returns a string content for CLI-generated
 * controller pages (React).
 */
export function writeReactFrontendPage(): string {
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
            <span className="font-semibold bg-blue-800 px-1 rounded">{controllerName}/views.py</span>
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

/**
 * @description Util function that returns a string content for CLI-generated
 * controller pages (Vue).
 */
export function writeVueFrontendPage(): string {
  return `// Generated with D.I.R.T Stack CLI
// todo: replace the markup as needed
<script lang="ts">
import { defineComponent } from 'vue';
import { DiscordIcon, GithubIcon } from 'vue3-simple-icons';

/**
 * @description This forms the basis for generated controller templates
 */
export default defineComponent({
  components: {
    DiscordIcon,
    GithubIcon,
  },
  props: {
    controllerName: String,
  },
});
</script>

<template>
  <div class="w-full h-full bg-gradient-to-b from-[#02111B] to-[#30292F]">
    <div
      class="flex flex-col container mx-auto md:max-w-5xl gap-y-10 text-center h-full p-4"
    >
      <svg
        class="self-center"
        fill="#fff"
        height="100px"
        width="100px"
        style="margin-top: 1rem"
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 490 490"
        xml:space="preserve"
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path
            d="M316.624,0l-18.061,24.729l59.624,43.557L207.064,273.202l-93.413-68.225l-59.774,81.363 c-20.034,27.255-28.212,60.835-23.009,94.549c5.248,34.043,23.428,63.96,51.207,84.248C105.039,481.912,131.757,490,158.205,490 c39.455,0,78.298-17.986,103.251-51.94l59.848-81.422l-89.521-65.383L382.903,86.342l59.697,43.611l18.06-24.729L316.624,0z M236.786,419.94c-31.741,43.163-93.039,52.328-136.651,20.468c-21.156-15.444-35.015-38.244-39.007-64.184 c-3.947-25.611,2.228-51.102,17.418-71.764l41.713-56.754l158.195,115.54L236.786,419.94z"
          ></path>
        </g>
      </svg>
      <h1 class="text-white text-2xl sm:text-3xl md:text-7xl font-heading">
        Controller / Django App: {{ controllerName }}
      </h1>
      <h3 class="text-2xl sm:text-3xl text-white font-heading underline">
        General Information
      </h3>
      <div class="flex flex-col self-center gap-y-2 w-4/5 md:w-3/5">
        <p class="text-white">
          This is the default page for the generated app. Replace the contents
          of this page with whatever you want.
        </p>
        <p class="text-white">
          To change the props that are passed to this inertia view, edit the
          dictionary returned by the following file:
          <span class="font-semibold bg-blue-800 px-1 rounded">
            {{ controllerName + '/views.py' }}
          </span>
        </p>
      </div>
      <h3 class="text-2xl sm:text-3xl text-white font-heading underline">
        Database Information
      </h3>
      <div class="flex flex-col self-center w-4/5 md:w-3/5">
        <p class="text-white">
          To make use of the models file and run db migrations
          <span class="font-semibold bg-blue-800 px-1 rounded">
            {{ controllerName + '/models.py' }}
          </span>
          , you will need to add
          <span class="text-gray-100">{{ controllerName }}</span>
          to
          <span class="font-semibold text-white px-1 rounded bg-blue-800">
            INSTALLED_APPS </span
          >in your settings files as shown in the example below
        </p>
        <div
          class="mt-1 text-md sm:text-base inline-flex text-left w-fit self-center items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 pl-6"
        >
          <span class="flex-1">
            <span>INSTALLED_APPS += </span>[
            <span class="text-orange-600 font-semibold">
              '{{ controllerName }}'
            </span>
            ]
          </span>
        </div>
      </div>
      <h3 class="text-2xl sm:text-3xl text-white font-heading underline">
        Resources
      </h3>
      <p class="text-white">
        Feeling stuck or have questions? Try the links below
      </p>
      <div class="flex self-center gap-x-8 text-white">
        <a
          class="flex text-white items-center hover:text-white gap-x-2"
          target="_blank"
          href="https://github.com/saiforceone/dirt-cli"
        >
          <GithubIcon :size="'32'" style="fill: white" />
          <span>Git D.I.R.T-y</span>
        </a>
        <a
          class="flex text-white items-center hover:text-white gap-x-2"
          target="_blank"
          href="https://discord.gg/sY3a5VN3y9"
        >
          <DiscordIcon :size="'32'" style="fill: white" /> PCE Discord
        </a>
      </div>
    </div>
  </div>
</template>
`;
}
