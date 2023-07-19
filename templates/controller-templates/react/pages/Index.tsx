import React from 'react';
import { TbShovel } from 'react-icons/tb';
import { FaDiscord, FaGithubAlt } from 'react-icons/fa';
import { BaseControllerProps } from '../../@types/dirtReact';

/**
 * @description Represents a default / generated controller when the create-controller
 * option is used by the CLI.
 * @param controllerName
 * @constructor
 */
const Index = ({ controllerName }: BaseControllerProps): React.ReactNode => {
  // todo: Modify the component's return markup as necessary
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#02111B] to-[#30292F]">
      <div className="flex flex-col container mx-auto md:max-w-5xl gap-y-10 text-center h-full p-4">
        <TbShovel className="self-center text-white" size={100} />
        <h1 className="text-white text-7xl font-heading">
          Controller / Django App: {controllerName}
        </h1>
        <h3 className="text-3xl text-white font-heading underline">
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
            <span className="font-semibold bg-blue-800 px-1 rounded">{`${controllerName}/views.py`}</span>
          </p>
        </div>
        <h3 className="text-3xl text-white font-heading underline">
          Database Information
        </h3>
        <div className="flex flex-col self-center w-4/5 md:w-3/5">
          <p className="text-white">
            To make use of the models file and run db migrations{' '}
            <span className="font-semibold bg-blue-800 px-1 rounded">{`${controllerName}/models.py`}</span>
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
        <h3 className="text-3xl text-white font-heading underline">
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

export default Index;
