import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslint({
      emitError: true,
      failOnError: false,
    }),
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url),
    },
  },
  server: {
    port: 3000,
  },
});
