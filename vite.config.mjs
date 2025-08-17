import { defineConfig } from 'vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'fs';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import path from 'path';
import native from 'vite-plugin-native';
import Components from 'unplugin-vue-components/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectInfo = JSON.parse(readFileSync(resolve(__dirname, './package.json'), 'utf-8'));

export default defineConfig(async () => {
  const { default: tailwindcss } = await import('@tailwindcss/vite');
  return {
    plugins: [
      vue(),
      Components({
        resolvers: [AntDesignVueResolver({ resolveIcons: true, importStyle: false })],
        dts: 'src/type/components.d.ts',
      }),
      tailwindcss(),
      electron([
        {
          entry: 'src/main/main.ts', // Electron主进程入口文件
          vite: {
            plugins: [native({})],
            resolve: { alias: { '@': path.resolve(__dirname, './src') } },
            build: {
              minify: 'terser',
              terserOptions: { compress: true, mangle: true },
              rollupOptions: { external: ['better-sqlite3', 'typeorm'] },
            },
          },
        },
        {
          entry: 'src/main/handler/preload/preload.ts', // Electron预加载脚本入口文件
          onstart(options) {
            options.reload(); // 当预加载脚本修改时，重启Electron
          },
          vite: {
            build: {
              minify: 'terser',
              terserOptions: { compress: true, mangle: true },
            },
          },
        },
      ]),
    ],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    define: {
      __PROJECT_NAME__: JSON.stringify(projectInfo.build.productName),
      __PROJECT_VERSION__: JSON.stringify(projectInfo.version),
      __DEPENDENCIES__: JSON.stringify(projectInfo.dependencies),
    },
    base: './',
    publicDir: false,
    build: {
      minify: 'terser',
      terserOptions: { compress: true, mangle: true },
    },
  };
});

