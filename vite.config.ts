import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import path from 'path';
import native from 'vite-plugin-native';

export default defineConfig(async () => {
  const { default: tailwindcss } = await import('@tailwindcss/vite');
  return {
    plugins: [
      vue(),
      tailwindcss(),
      electron([
        {
          entry: 'electron/main.ts', // Electron主进程入口文件
          vite: {
            plugins: [native({})],
            resolve: {
              alias: {
                '#': path.resolve(__dirname, './electron')
              }
            },
            build: {
              rollupOptions: {
                 external: ['better-sqlite3', 'typeorm']
              }
            }
          }
        },
        {
          entry: 'electron/preload.ts', // Electron预加载脚本入口文件
          onstart(options) {
            options.reload() // 当预加载脚本修改时，重启Electron
          },
        },
      ]),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '#': path.resolve(__dirname, './electron')
      },
    },
    base: './',
  }
})

