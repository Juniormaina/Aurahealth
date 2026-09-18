import * as esbuild from 'esbuild';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, 'api', 'index.cjs');

esbuild.buildSync({
  entryPoints: [path.join(root, 'src', 'server', 'vercelHandler.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  outfile: outFile,
  footer: {
    // esbuild CJS default export is module.exports.default; Vercel needs the function.
    js: 'module.exports = module.exports.default;',
  },
  logLevel: 'info',
});

const exported = require(outFile);
if (typeof exported !== 'function') {
  console.error('api/index.cjs did not export a function handler, got', typeof exported);
  process.exit(1);
}

console.log('Wrote', path.relative(root, outFile), `(${typeof exported})`);
