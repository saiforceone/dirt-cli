import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

module.exports = {
  plugins: [
    tsconfigPaths(),
    react({
      include: '**/*.disabled',
    }),
  ],
  root: resolve('./dirt_fe_react'),
  base: '/static/',
  server: {
    host: 'localhost',
    port: 3000,
    open: false,
    watch: {
      usePolling: true,
      disableGlobbing: false,
    },
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  build: {
    outDir: resolve('./dirt_fe_react/dist'),
    assetsDir: '',
    manifest: true,
    emptyOutDir: true,
    target: 'es2015',
    rollupOptions: {
      input: {
        main: resolve('./dirt_fe_react/src/main.jsx'),
      },
      output: {
        chunkFileNames: undefined,
      },
    },
  },
};
