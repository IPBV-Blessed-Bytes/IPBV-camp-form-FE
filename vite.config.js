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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/')) {
            return 'react-vendor';
          }
          if (id.includes('react-router')) return 'router-vendor';
          if (id.includes('react-bootstrap') || id.includes('/bootstrap/')) return 'bootstrap-vendor';
          if (id.includes('@mui') || id.includes('@emotion')) return 'mui-vendor';
          if (id.includes('recharts') || id.includes('/d3-') || id.includes('victory-vendor')) {
            return 'charts-vendor';
          }
          if (id.includes('xlsx')) return 'xlsx-vendor';
          if (id.includes('ckeditor')) return 'ckeditor-vendor';
          if (id.includes('date-fns') || id.includes('react-datepicker')) return 'date-vendor';
          if (id.includes('swiper')) return 'swiper-vendor';

          return 'vendor';
        },
      },
    },
  },
});
