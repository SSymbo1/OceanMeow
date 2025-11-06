/* global process */
/* global console */
import { fileURLToPath } from 'node:url';
import { spawn } from 'child_process';
import path from 'node:path';

const [, , target] = process.argv;
const args = ['--lint', '--test'];
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
  if (!args.includes(target)) {
    console.error(`
    available args is:

    --lint: execute project code Prettier & ESLint
    --test: execute project code Jest
  `);
    process.exit(1);
  }
  if (target === '--lint') {
    await run(packageManager, ['prettier', '--write', ' "**/*.{ts,vue,css,js,mjs,json,md}"']);
    await run(packageManager, ['eslint', '.', '--ext', '.ts,.vue,.js,.mjs', '--fix']);
  } else if (target === '--test') {
    await run(packageManager, [
      'jest',
      '--watchAll=false',
      '--runInBand',
      '--detectOpenHandles',
      '--verbose',
      '--logHeapUsage',
    ]);
  }
})();
