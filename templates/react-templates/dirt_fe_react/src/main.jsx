import {createRoot} from 'react-dom/client';
import {createInertiaApp} from '@inertiajs/react';

document.addEventListener('DOMContentLoaded', () => {
  createInertiaApp({
    resolve: (name) => {
      const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
      return pages[`./pages/${name}.tsx`];
    },
    setup({ el, App, props }) {
      createRoot(el).render(<App {...props} />);
    }
  }).then(() => {});
});
