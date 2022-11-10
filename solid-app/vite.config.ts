import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: 'http://localhost:3000/',
  server: {
    port: 3000,
  },
  build: {
    watch: {},
    target: 'esnext',
  },
});
