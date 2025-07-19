import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [
        react()
      ],
      css: {
        postcss: {
          plugins: [
            tailwindcss,
            autoprefixer,
          ],
        },
      },
      define: {
        'process.env': JSON.stringify(env)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src/'),
          // Add the test aliases here to make them globally available
          '@fixtures': path.resolve(__dirname, './tests/fixtures/'),
          '@utils': path.resolve(__dirname, './tests/utils/'),
        }
      },
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false
          }
        }
      }
    };
});