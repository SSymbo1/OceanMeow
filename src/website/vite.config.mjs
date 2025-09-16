import { defineConfig } from 'vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import path from 'node:path';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

export default defineConfig(async () => {
  const { default: tailwindcss } = await import('@tailwindcss/vite');
  return {
    root: projectRoot,
    base: './',
    plugins: [
      vue(),
      tailwindcss(),
      Components({
        resolvers: [AntDesignVueResolver({ resolveIcons: true, importStyle: false })],
        dts: path.resolve(projectRoot, 'src/type/components.d.ts'),
      }),
    ],
    resolve: {
      alias: { '@': path.resolve(projectRoot, 'src') },
    },
    build: {
      outDir: path.resolve(projectRoot, 'website-dist'),
      emptyOutDir: true,
    },
    server: { port: 5174, strictPort: true },
  };
});
