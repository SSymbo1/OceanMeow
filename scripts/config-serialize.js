/* global process */
/* global console */
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
import { ApplicationConfig } from '../src/main/entity/dto/ApplicationConfig.ts';
import stringify from 'json-stable-stringify';
import path from 'node:path';

const [, , target = '--all'] = process.argv;
const args = ['--dev', '--prod', '--all'];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const devFolderPath = path.join(root, 'public');
const prodFolderPath = path.join(root, 'public', 'prod');
const configName = 'application.json';
const applicationConfig = new ApplicationConfig();
function configSerialize(dir, data) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, configName), stringify(data, { space: 2 }), 'utf8');
}

if (!args.includes(target)) {
  console.error(`
    available args is:

    --dev: serialize config which is used in development
    --prod: serialize config which is used in production
    --all: serialize all env config (default)
  `);
  process.exit(1);
}
if (target === '--dev') {
  configSerialize(devFolderPath, applicationConfig);
} else if (target === '--prod') {
  configSerialize(prodFolderPath, applicationConfig);
} else {
  configSerialize(devFolderPath, applicationConfig);
  configSerialize(prodFolderPath, applicationConfig);
}
