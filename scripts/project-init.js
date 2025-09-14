/* global console */
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageManager = 'pnpm';
const options = { stdio: 'inherit', shell: true, cwd: root };
function run(manager, args = []) {
  return new Promise((resolve, reject) => {
    const command = spawn(manager, args, options);
    command.on('close', (exitCode) => (exitCode === 0 ? resolve() : reject()));
    command.on('error', reject);
  });
}

(async () => {
  try {
    console.log('[1/4] rebuild electron modules...');
    await run(packageManager, ['electron-rebuild']);
    console.log('[2/4] serialize development application config...');
    await run(packageManager, ['generate:config']);
    console.log('[3/4] generate development database...');
    await run(packageManager, ['generate:database']);
    console.log('[4/4] generate development typescript type...');
    await run(packageManager, ['generate:type']);
  } catch (error) {
    console.log(error);
  }
})();
