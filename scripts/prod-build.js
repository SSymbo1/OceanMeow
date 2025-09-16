/* global console */
/* global process */
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { rmSync } from 'fs';
import path from 'path';

const [, , target] = process.argv;
const args = ['--electron', '--website'];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prodFolderPath = path.join(root, 'public/prod');
const distFolderPath = path.join(root, 'dist');
const distElectronFolderPath = path.join(root, 'dist-electron');
const websiteSourceCodePath = path.join(root, 'src', 'website');
const websiteViteConfigPath = path.join(websiteSourceCodePath, 'vite.config.mjs');
const applicationRelease = path.join(root, 'release');
const websiteRelease = path.join(root, 'website-dist');
const packageManager = 'pnpm';
const options = { stdio: 'inherit', shell: true, cwd: root };
function applicationReleaseBuild(manager, args = []) {
  return new Promise((resolve, reject) => {
    const command = spawn(manager, args, options);
    command.on('close', (exitCode) => (exitCode === 0 ? resolve() : reject()));
    command.on('error', reject);
  });
}
function cleanResource() {
  rmSync(distFolderPath, { recursive: true, force: true });
  rmSync(distElectronFolderPath, { recursive: true, force: true });
  rmSync(prodFolderPath, { recursive: true, force: true });
}

(async () => {
  if (!args.includes(target)) {
    console.error(`
    available args is:

    --electron: build electron desktop application release package
    --website: build website deploy dist
  `);
    process.exit(1);
  }
  if (target === '--electron') {
    try {
      console.log('[1/11] clean oid build package...');
      rmSync(applicationRelease, { recursive: true, force: true });
      console.log('[2/11] generate electron main thread type...');
      await applicationReleaseBuild(packageManager, ['generate:type']);
      console.log('[3/11] rebuild electron modules...');
      await applicationReleaseBuild(packageManager, ['electron-rebuild']);
      console.log('[4/11] build prod release sqlite3 database...');
      await applicationReleaseBuild(packageManager, [
        'electron',
        path.join('scripts', 'database-create.mjs'),
        '--prod',
      ]);
      console.log('[5/11] serialize application prod config...');
      await applicationReleaseBuild(packageManager, [
        'tsx',
        path.join('scripts', 'config-serialize.js'),
        '--prod',
      ]);
      console.log('[6/11] check and lint source code...');
      await applicationReleaseBuild(packageManager, ['lint']);
      console.log('[7/11] run unit test...');
      await applicationReleaseBuild(packageManager, ['test']);
      console.log('[8/11] complie typescript...');
      await applicationReleaseBuild(packageManager, ['vue-tsc']);
      console.log('[9/11] transform render and main thread code...');
      await applicationReleaseBuild(packageManager, ['vite build']);
      console.log('[10/11] build application release package...');
      await applicationReleaseBuild(packageManager, ['electron-builder']);
      console.log('[11/11] clean build release dist...');
      cleanResource();
    } catch (error) {
      console.log(error);
    }
  } else if (target === '--website') {
    console.log('[1/2] clean oid deploy package...');
    rmSync(websiteRelease, { recursive: true, force: true });
    console.log('[2/2] build website deploy package...');
    await applicationReleaseBuild(packageManager, [
      'vite',
      'build',
      websiteSourceCodePath,
      '--config',
      websiteViteConfigPath,
    ]);
  }
})();
