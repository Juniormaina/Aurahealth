import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const handlerOut = path.join(root, 'api', 'handler.cjs');
const indexOut = path.join(root, 'api', 'index.js');

esbuild.buildSync({
  entryPoints: [path.join(root, 'src', 'server', 'vercelHandler.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  outfile: handlerOut,
  logLevel: 'info',
});

fs.writeFileSync(
  indexOut,
  [
    '"use strict";',
    'const mod = require("./handler.cjs");',
    'module.exports = typeof mod === "function" ? mod : mod.default;',
    '',
  ].join('\n')
);

const exported = require(indexOut);
if (typeof exported !== 'function') {
  console.error('api/index.js did not export a function handler');
  process.exit(1);
}

console.log('Wrote', path.relative(root, handlerOut), 'and', path.relative(root, indexOut));
