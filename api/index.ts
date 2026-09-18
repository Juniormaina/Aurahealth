import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import dotenv from 'dotenv';
import { createApiApp } from '../src/server/createApp';

try {
  dotenv.config({ path: path.join(process.cwd(), 'src', '.env') });
  dotenv.config();
} catch (err) {
  console.warn('[api] dotenv load skipped:', err);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export const maxDuration = 60;

type ExpressApp = {
  (req: IncomingMessage, res: ServerResponse): void;
};

let app: ExpressApp | null = null;
let initError: string | null = null;

try {
  app = createApiApp() as ExpressApp;
} catch (err) {
  initError = err instanceof Error ? err.stack || err.message : String(err);
  console.error('[api] createApiApp failed:', initError);
}

function sendInitError(res: ServerResponse) {
  if (res.headersSent) return;
  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      error: 'API function failed to start',
      code: 'api_init_failed',
      detail: (initError || 'createApiApp returned null').slice(0, 500),
    })
  );
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!app) {
    sendInitError(res);
    return;
  }

  const url = req.url || '/';
  if (!url.startsWith('/api')) {
    const suffix = url.startsWith('/') ? url : `/${url}`;
    req.url = suffix === '/' ? '/api' : `/api${suffix}`;
  }

  await new Promise<void>((resolve, reject) => {
    const onDone = () => {
      res.off('finish', onDone);
      res.off('close', onDone);
      resolve();
    };
    res.on('finish', onDone);
    res.on('close', onDone);
    try {
      app!(req, res);
    } catch (err) {
      res.off('finish', onDone);
      res.off('close', onDone);
      reject(err);
    }
  });
}
