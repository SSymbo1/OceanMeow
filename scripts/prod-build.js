/* global console */
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { rmSync } from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prodFolderPath = path.join(root, 'public/prod');
const distFolderPath = path.join(root, 'dist');
const distElectronFolderPath = path.join(root, 'dist-electron');
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
  try {
    console.log('[1/10] generate electron main thread type...');
    await applicationReleaseBuild(packageManager, ['generate:type']);
    console.log('[2/10] rebuild electron modules...');
    await applicationReleaseBuild(packageManager, ['electron-rebuild']);
    console.log('[3/10] build prod release sqlite3 database...');
    await applicationReleaseBuild(packageManager, [
      'electron',
      path.join('scripts', 'database-create.mjs'),
      '--prod',
    ]);
    console.log('[4/10] serialize application prod config...');
    await applicationReleaseBuild(packageManager, [
      'tsx',
      path.join('scripts', 'config-serialize.js'),
      '--prod',
    ]);
    console.log('[5/10] check and lint source code...');
    await applicationReleaseBuild(packageManager, ['lint']);
    console.log('[6/10] run unit test...');
    await applicationReleaseBuild(packageManager, ['test']);
    console.log('[7/10] complile typescript...');
    await applicationReleaseBuild(packageManager, ['vue-tsc']);
    console.log('[8/10] transform render and main thread code...');
    await applicationReleaseBuild(packageManager, ['vite build']);
    console.log('[9/10] build application release package...');
    await applicationReleaseBuild(packageManager, ['electron-builder']);
    console.log('[10/10] clean build release dist...');
    cleanResource();
  } catch (error) {
    console.log(error);
  }
})();
