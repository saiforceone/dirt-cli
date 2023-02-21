// .storybook/main.js

module.exports = {
  stories: [
    '../dirt_fe_react/src/**/*.stories.mdx',
    '../dirt_fe_react/src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  core: {
    builder: '@storybook/builder-vite',
  },
  typescript: {
    reactDocgen: 'react-docgen',
  },
};
