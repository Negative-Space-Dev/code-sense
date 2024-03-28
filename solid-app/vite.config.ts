import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from 'node:path';

export default defineConfig({
  plugins: [solidPlugin()],
  base: 'http://localhost:PORT/',
  build: {
    watch: {},
    target: 'esnext',
  }
});
