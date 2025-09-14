/* global process */
/* global console */
import { fileURLToPath } from 'url';
import { readFileSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import path from 'path';

const [, , target = '--all'] = process.argv;
const args = ['--dev', '--prod', '--all'];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const devFolderPath = path.join(root, 'public');
const prodFolderPath = path.join(root, 'public', 'prod');
const sqlScriptPath = path.join(root, 'scripts', 'build.sql');
const dbFile = 'sud.db';
function buildDatabase(db) {
  const database = new Database(db);
  const ddl = readFileSync(sqlScriptPath, 'utf8');
  database.transaction(() => {
    database.exec(ddl);
  })();
  database.close();
}

if (!args.includes(target)) {
  console.error(`
    avaliable args is:

    --dev: generate database which is used in development
    --prod: generate database which is used in production
    --all: generate all env database (default)
  `);
  process.exit(1);
}
if (target === '--dev') {
  mkdirSync(devFolderPath, { recursive: true });
  buildDatabase(path.join(devFolderPath, dbFile));
} else if (target === '--prod') {
  mkdirSync(prodFolderPath, { recursive: true });
  buildDatabase(path.join(prodFolderPath, dbFile));
} else {
  mkdirSync(devFolderPath, { recursive: true });
  mkdirSync(prodFolderPath, { recursive: true });
  buildDatabase(path.join(devFolderPath, dbFile));
  buildDatabase(path.join(prodFolderPath, dbFile));
}
process.exit(0);
