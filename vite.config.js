import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import eslint from 'vite-plugin-eslint';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
});
