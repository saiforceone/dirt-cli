export const DIRT_PROJECT_FOLDER_NAME = '@dirt_project';

export const DIRT_PROJECT_CONFIG_FILE_NAME = 'dirt.json';

export const STORYBOOK_SCRIPT_DEV_PRE =
  'tailwindcss -i ./static/css/main.css -o ./static/dist/css/app.css';
export const STORYBOOK_SCRIPT_DEV =
  'start-storybook -p 6006 --disable-telemetry';
export const STORYBOOK_SCRIPT_BUILD = 'build-storybook';

export const PACKAGE_JSON_FILE = 'package.json';

export const DIRT_DEV_SCRIPT_WINDOWS =
  'concurrently -c "auto" --names "dirt-backend,tailwind-css,dirt-frontend" "py manage.py runserver" "npm run tailwind-dev" "npm run vite-dev"';
