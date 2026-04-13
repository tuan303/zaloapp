import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig, loadEnv} from 'vite';

const zmaAppConfigPlugin = (outDir: string) => ({
  name: 'copy-zma-app-config',
  closeBundle() {
    fs.copyFileSync('app-config.json', path.resolve(outDir, 'app-config.json'));
  },
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const isZmaBuild = mode === 'zma';
  const outDir = isZmaBuild ? 'dist-zma' : 'dist';

  return {
    base: isZmaBuild ? './' : '/',
    plugins: [
      react(),
      tailwindcss(),
      ...(isZmaBuild ? [zmaAppConfigPlugin(outDir)] : []),
    ],
    build: isZmaBuild
      ? {
          outDir,
          emptyOutDir: true,
          cssCodeSplit: false,
          minify: false,
          modulePreload: false,
          lib: {
            entry: path.resolve(__dirname, 'src/main.tsx'),
            formats: ['iife'],
            name: 'NgoiSaoHoangMaiPortal',
            fileName: () => 'app.js',
            cssFileName: 'app',
          },
          rollupOptions: {
            output: {
              intro:
                'var process = globalThis.process || { env: { NODE_ENV: "production" } };',
              assetFileNames: assetInfo => {
                if (assetInfo.name?.endsWith('.css')) {
                  return 'assets/app.css';
                }
                return 'assets/[name][extname]';
              },
            },
          },
        }
      : {
          outDir,
          emptyOutDir: true,
        },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
