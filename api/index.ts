import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import dotenv from 'dotenv';

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

let appPromise: Promise<ExpressApp> | null = null;
let initError: string | null = null;

function loadApp(): Promise<ExpressApp> {
  if (!appPromise) {
    appPromise = import('../src/server/createApp')
      .then((mod) => mod.createApiApp() as ExpressApp)
      .catch((err: unknown) => {
        initError = err instanceof Error ? err.stack || err.message : String(err);
        console.error('[api] createApiApp failed:', initError);
        appPromise = null;
        throw err;
      });
  }
  return appPromise;
}

function sendInitError(res: ServerResponse, err: unknown) {
  if (res.headersSent) return;
  const detail = (err instanceof Error ? err.message : String(err)).slice(0, 500);
  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      error: 'API function failed to start',
      code: 'api_init_failed',
      detail: initError?.slice(0, 500) || detail,
    })
  );
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = req.url || '/';
    if (!url.startsWith('/api')) {
      const suffix = url.startsWith('/') ? url : `/${url}`;
      req.url = suffix === '/' ? '/api' : `/api${suffix}`;
    }
    const app = await loadApp();
    await new Promise<void>((resolve, reject) => {
      const onDone = () => {
        res.off('finish', onDone);
        res.off('close', onDone);
        resolve();
      };
      res.on('finish', onDone);
      res.on('close', onDone);
      try {
        app(req, res);
      } catch (err) {
        res.off('finish', onDone);
        res.off('close', onDone);
        reject(err);
      }
    });
  } catch (err) {
    sendInitError(res, err);
  }
}
