/**
 * This is the default vite.config.js file. Feel free to make changes as required
 */

import path, { resolve } from 'path';
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
    host: '127.0.0.1',
    port: 3000,
    open: false,
    watch: {
      usePolling: true,
      disableGlobbing: false,
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './dirt_fe_react/src'),
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  build: {
    outDir: resolve('./static/dist/js'),
    assetsDir: '',
    manifest: true,
    emptyOutDir: true,
    target: 'es2015',
    rollupOptions: {
      input: {
        main: resolve('./dirt_fe_react/src/main.tsx'),
      },
      output: {
        chunkFileNames: '[name].js',
        entryFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
};
