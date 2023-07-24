import Frontend = DIRTStackCLI.Frontend;
import DIRTPathOpts = DIRTStackCLI.DIRTFrontendPathOpts;

export const DIRT_PROJECT_FOLDER_NAME = '@dirt_project';

export const DIRT_PROJECT_CONFIG_FILE_NAME = 'dirt.json';

export const STORYBOOK_SCRIPT_DEV_PRE =
  'tailwindcss -i ./static/css/main.css -o ./static/dist/css/app.css';
export const STORYBOOK_SCRIPT_DEV = 'storybook dev -p 6006 --disable-telemetry';
export const STORYBOOK_SCRIPT_BUILD = 'storybook build';

export const PACKAGE_JSON_FILE = 'package.json';

export const DIRT_DEV_SCRIPT_WINDOWS =
  'concurrently -c "auto" --names "dirt-backend,tailwind-css,dirt-frontend" "py manage.py runserver" "npm run tailwind-dev" "npm run vite-dev"';

export const PRETTIER_TEMPLATE_PATH = '../../templates/prettier-templates';

export const FRONTEND_PATHS: Record<Frontend, DIRTPathOpts> = {
  react: {
    BASE_HTML_TEMPLATES_PATH: '../../../templates/django-html-templates/react',
    STATIC_TEMPLATES_PATH: '../../../templates/static-files',
    STORY_BOOK_STORIES_PATH: '../../../templates/react-storybook-stories',
    STORY_BOOK_TEMPLATES_PATH: '../../../templates/react-storybook-templates',
    TEMPLATES_PATH: '../../../templates/react-templates',
    TYPES_PATH: '../../../templates/controller-templates/react/@types',
  },
  vue: {
    BASE_HTML_TEMPLATES_PATH: '../../../templates/django-html-templates/vue',
    STATIC_TEMPLATES_PATH: '../../../templates/static-files',
    STORY_BOOK_STORIES_PATH: '../../../templates/vue-storybook-stories',
    STORY_BOOK_TEMPLATES_PATH: '../../../templates/vue-storybook-templates',
    TEMPLATES_PATH: '../../../templates/vue-templates',
    TYPES_PATH: '../../../templates/controller-templates/vue/@types',
  },
};
