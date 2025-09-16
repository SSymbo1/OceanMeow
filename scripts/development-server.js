/* global process */
/* global console */
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const [, , target] = process.argv;
const args = ['--electron', '--website', '--preview'];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const websiteSourceCodePath = path.join(root, 'src', 'website');
const websiteViteConfigPath = path.join(websiteSourceCodePath, 'vite.config.mjs');
const applicationDevConfigPath = path.join(root, 'public', 'application.json');
const applicationDevDatabasePath = path.join(root, 'public', 'sud.db');
const applicationTypePath = path.join(root, 'src', 'type', 'electron');
const websiteBuildDist = path.join(root, 'website-dist');
const previewPort = 4174;
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

    --electron: start electron application development hmr server
    --website: start website development hmr server
    --preview: start website build package preview server
  `);
    process.exit(1);
  }

  if (target === '--electron') {
    if (
      !existsSync(applicationDevConfigPath) ||
      !existsSync(applicationDevDatabasePath) ||
      !existsSync(applicationTypePath)
    ) {
      await run(packageManager, ['project:init']);
    }
    await run(packageManager, ['vite']);
  } else if (target === '--website') {
    await run(packageManager, [
      'vite',
      'serve',
      websiteSourceCodePath,
      '--config',
      websiteViteConfigPath,
    ]);
  } else if (target === '--preview') {
    if (!existsSync(websiteBuildDist)) {
      console.error('website build package not found, please run build:website first');
      process.exit(1);
    } else {
      await run(packageManager, [
        'vite',
        'preview',
        websiteSourceCodePath,
        '--config',
        websiteViteConfigPath,
        '--port',
        previewPort,
      ]);
    }
  }
})();
