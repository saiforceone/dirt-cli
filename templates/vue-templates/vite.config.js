/**
 * This is the default vite.config.js file. Feel free to make changes as required
 */
import path, { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import Vue from '@vitejs/plugin-vue';

module.exports = {
  plugins: [tsconfigPaths(), Vue()],
  root: resolve('./dirt_fe_vue'),
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
      '~': path.resolve(__dirname, './dirt_fe_vue/src'),
    },
    extensions: ['.js', '.json', '.vue'],
  },
  build: {
    outDir: resolve('./static/dist/js'),
    assetsDir: '',
    manifest: true,
    emptyOutDir: true,
    target: 'es2015',
    rollupOptions: {
      input: {
        main: resolve('./dirt_fe_vue/src/main.js'),
      },
      output: {
        chunkFileNames: '[name].js',
        entryFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
};
