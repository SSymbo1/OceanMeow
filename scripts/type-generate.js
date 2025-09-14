/* global process */
import { existsSync, rmSync } from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'src', 'type', 'electron');
const packageManager = 'pnpm';
const options = { stdio: 'inherit', shell: true, cwd: root };
const command = ['tsc -p tsconfig.types.json --incremental false', 'tsc-alias -p tsconfig.json'];
function typeGenerateRun(idx) {
  if (idx >= command.length) return;
  spawn(packageManager, ['exec', ...command[idx].split(' ')], options).on('close', (code) => {
    if (code) process.exit(code);
    typeGenerateRun(idx + 1);
  });
}

if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true });
}
typeGenerateRun(0);
