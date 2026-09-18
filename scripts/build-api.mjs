import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appOut = path.join(root, 'api', 'app.cjs');
const indexOut = path.join(root, 'api', 'index.js');

esbuild.buildSync({
  entryPoints: [path.join(root, 'src', 'server', 'vercelHandler.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  outfile: appOut,
  footer: {
    js: 'module.exports = module.exports.default;',
  },
  logLevel: 'info',
});

// Thin entry: catch module-load failures and return JSON instead of FUNCTION_INVOCATION_FAILED.
fs.writeFileSync(
  indexOut,
  [
    '"use strict";',
    'module.exports = async function handler(req, res) {',
    '  let app;',
    '  try {',
    '    app = require("./app.cjs");',
    '  } catch (err) {',
    '    const detail = err && err.stack ? err.stack : String(err);',
    '    console.error("[api] failed to load app.cjs:", detail);',
    '    if (!res.headersSent) {',
    '      res.statusCode = 500;',
    '      res.setHeader("Content-Type", "application/json");',
    '      res.end(JSON.stringify({ error: "API bundle failed to load", code: "api_bundle_load_failed", detail: String(detail).slice(0, 800) }));',
    '    }',
    '    return;',
    '  }',
    '  if (typeof app !== "function") {',
    '    if (!res.headersSent) {',
    '      res.statusCode = 500;',
    '      res.setHeader("Content-Type", "application/json");',
    '      res.end(JSON.stringify({ error: "API bundle export is not a function", code: "api_bundle_bad_export" }));',
    '    }',
    '    return;',
    '  }',
    '  return app(req, res);',
    '};',
    '',
  ].join('\n')
);

const exported = require(appOut);
if (typeof exported !== 'function') {
  console.error('api/app.cjs did not export a function handler, got', typeof exported);
  process.exit(1);
}

console.log('Wrote', path.relative(root, appOut), 'and', path.relative(root, indexOut));
