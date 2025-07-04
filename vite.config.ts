import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [
        react(),
        tailwindcss()
      ],
      define: {
        'process.env': JSON.stringify(env)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src/'),
        }
      }
    };
});