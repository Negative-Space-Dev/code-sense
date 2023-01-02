import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: 'http://localhost:49168/',
  server: {
    port: 49168,
  },
  build: {
    watch: {},
    target: 'esnext',
  },
});
