import * as React from 'react';
import {
  BsInfoCircleFill,
  DiReact,
  FaDiscord,
  FaFileCode,
  FaFolder,
  FaGithubAlt,
  SiDjango,
  SiStorybook,
  SiTailwindcss,
  SiVite,
  TbShovel,
} from 'react-icons/all';
import { projectConfig } from '../../../../@dirt_project/dirt.json';
import { Note } from '../../components/shared/Note/Note';

const FolderIcon = <FaFolder size={20} />;
const Index = (): React.ReactNode => {
  return (
    <div
      className="flex flex-col gap-y-8 text-center w-full p-4 md:p-2 md:max-w-7xl md:min-w-5xl"
      style={{ background: '#2d2d2d' }}
    >
      <TbShovel className="self-center text-white" size={100} />
      <h1 className="text-white text-center text-7xl">
        Ready to get D.I.R.T-y?
      </h1>
      <p className="text-slate-400 text-lg">
        <span className="font-bold text-white">D.I.R.T Stack:</span> The modern
        way of building reactive fullstack Django web applications. D.I.R.T
        combines the power of <span className="font-bold text-white">D</span>
        jango, <span className="font-bold text-white">I</span>
        nertiaJs, Reactivity of <span className="font-bold text-white">R</span>
        eact and smoothness of <span className="font-bold text-white">T</span>
        ailwind CSS.
      </p>
      <h2 className="text-white text-4xl">Ready to dig in?</h2>
      <div className="flex px-2 py-4 bg-green-100 border-green-700 border-2 text-green-900 rounded items-center gap-x-2">
        <BsInfoCircleFill size={20} />
        <p className="text-left">
          You should replace this page with your own index page in{' '}
          <span className="underline font-semibold text-green-900">
            dirt_fe_react/pages/Home/Index.tsx
          </span>
        </p>
      </div>
      <h2 className="text-white text-4xl">Important Files & Folders</h2>
      <div className="flex flex-col px-2 py-2 gap-y-2 bg-green-100 border-green-700 border-2 text-green-900 rounded text-left">
        {projectConfig.withStorybook && (
          <Note
            iconElement={FolderIcon}
            labelText=".storybook"
            content="Contains configuration for StorybookJS"
          />
        )}
        <Note
          iconElement={FolderIcon}
          labelText="@dirt_project"
          content="Contains project config / settings"
        />
        <Note
          iconElement={FolderIcon}
          labelText="dirt_fe_react"
          content="Contains the React app including pages, components, etc."
        />
        <Note
          iconElement={FolderIcon}
          labelText="dirt_fe_react/src/pages"
          content="Contains this application's pages (Inertia views)"
        />
        <Note
          iconElement={FolderIcon}
          labelText="dirt_fe_react/src/components"
          content="Contains components used within the application"
        />
        <Note
          iconElement={FolderIcon}
          labelText={projectConfig.projectName}
          content="Main Django web application"
        />
        <Note
          iconElement={<FaFileCode size={20} />}
          labelText="dirt_fe_react/src/main.jsx"
          content="Main entry point of the Inertia application"
        />
      </div>
      <p className="text-slate-400 text-lg">
        <span className="font-bold text-white">D.I.R.T</span>, truly down to
        earth, built on a solid foundation with
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 px-4 md:px-0 gap-8 md:gap-2">
        <a
          className="w-fit text-white flex items-center gap-x-2"
          target="_blank"
          href="https://www.djangoproject.com/"
        >
          <SiDjango className="text-white" size={48} />
          <span className="text-2xl">Django</span>
        </a>
        <a
          className="w-fit flex items-center"
          target="_blank"
          href="https://inertiajs.com/"
        >
          <svg
            className="block fill-current text-white"
            viewBox="0 0 275.3 50.5"
            style={{ height: '25px' }}
          >
            <path d="M231.2 16.1h-17.8l17.2 17.2-17.2 17.2h17.8l17.2-17.2z"></path>
            <path d="M258.1 16.1h-17.8l17.2 17.2-17.2 17.2h17.8l17.2-17.2z"></path>
            <path d="M6 15.3h10.3l-6 34.2H0l6-34.2zm.6-9.1C7.2 2.9 10.3 0 13.7 0s5.7 2.8 5.2 6.2c-.5 3.4-3.7 6.2-7.2 6.2s-5.6-3-5.1-6.2zM54.3 28.5l-3.7 21H40.4L43.8 30c.8-4.4-1.6-6.2-4.9-6.2-3.4 0-6.5 2-7.5 6.6L28 49.5H17.8l6-34.2h10.3l-.5 3.2c2.3-2.6 6.2-4.2 10.1-4.2 6.9.1 12.2 5.1 10.6 14.2zM94.5 32.4c-.1.8-.5 2.7-1.1 4.1H68.9c.6 3.8 3.8 4.8 7 4.8 2.9 0 5.2-.8 7.2-2.7l7.2 5.9c-4 4-8.7 6-15 6-11.8 0-18-8.5-16.3-18.7a20.7 20.7 0 0 1 20.5-17.4c9.8 0 16.9 7.6 15 18zm-9.7-3.7c-.3-3.8-3-5.3-6.2-5.3a8.9 8.9 0 0 0-8.3 5.3h14.5zM123.9 14.6l-2 11.6c-4-.6-10.5.8-11.7 7.8l.1-.4-2.8 15.9H97.3l6-34.2h10.3l-1.1 6.2c2.1-4.7 6.6-6.9 11.4-6.9zM137.8 37.3c-.5 3.1 2 3.3 6.6 2.9l-1.6 9.3c-12.3 1.4-16.9-2.7-15.2-12.2l2.1-12.1h-5.5l1.8-9.9h5.4l1.2-6.5 10.8-3.1-1.7 9.6h7.1l-1.8 9.9h-7l-2.2 12.1zM155.3 15.3h10.3l-6 34.2h-10.3l6-34.2zm.6-9.1c.5-3.3 3.7-6.2 7.1-6.2s5.7 2.8 5.2 6.2c-.5 3.4-3.7 6.2-7.2 6.2s-5.7-3-5.1-6.2zM208.1 15.3l-6 34.2h-10.3l.4-2.3a15.5 15.5 0 0 1-10.3 3.3c-11.1 0-15.3-9.6-13.5-18.9 1.6-8.8 8.6-17.2 19.2-17.2 4.5 0 7.7 1.8 9.6 4.6l.6-3.6h10.3zm-13.2 17.2c.9-5.2-1.9-8.4-6.6-8.4a9.5 9.5 0 0 0-9.5 8.3c-.9 5.1 1.8 8.3 6.6 8.3 4.6.1 8.6-3.1 9.5-8.2z"></path>
          </svg>
        </a>
        <a
          className="text-white flex items-center gap-x-2"
          target="_blank"
          href="https://reactjs.org/"
        >
          <DiReact className="text-white" size={42} />
          <span className="text-2xl">ReactJs</span>
        </a>
        <a
          className="text-white flex items-center gap-x-2"
          target="_blank"
          href="https://tailwindcss.com/"
        >
          <SiTailwindcss className="text-white" size={42} />
          <span className="text-2xl">Tailwind CSS</span>
        </a>
      </div>
      <p className="text-slate-400 text-lg">
        and <span className="font-bold text-white">supercharged</span> by
      </p>
      <div className="flex items-center justify-between self-center gap-x-8">
        <div className="flex flex-col items-center">
          <a
            className="text-white flex items-center gap-x-2"
            href="https://vitejs.dev/"
            target="_blank"
          >
            <SiVite size={32} />
            <span className="text-2xl">ViteJs</span>
          </a>
        </div>
        {projectConfig.withStorybook && (
          <div className="flex flex-col text-white items-center gap-y-2">
            <a
              className="text-white flex items-center gap-x-2"
              href="https://storybook.js.org/"
              target="_blank"
            >
              <SiStorybook size={32} />
              <span className="text-2xl">StorybookJS</span>
            </a>
          </div>
        )}
      </div>

      <h2 className="text-center text-white text-2xl">Get Connected</h2>
      <div className="flex self-center gap-x-8 text-white">
        <a
          className="flex items-center gap-x-2"
          target="_blank"
          href="https://github.com/saiforceone/dirt-cli"
        >
          <FaGithubAlt size={32} /> <span>Git D.I.R.T-y</span>
        </a>
        <a
          className="flex items-center gap-x-2"
          target="_blank"
          href="https://discord.gg/sY3a5VN3y9"
        >
          <FaDiscord size={32} /> Peanut Cart Express on Discord
        </a>
      </div>
    </div>
  );
};

export default Index;
