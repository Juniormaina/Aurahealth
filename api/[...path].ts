import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import dotenv from 'dotenv';
import { createApiApp } from '../src/server/createApp';

dotenv.config({ path: path.join(process.cwd(), 'src', '.env') });
dotenv.config();

const app = createApiApp();

export const config = {
  api: {
    bodyParser: false,
  },
};

export const maxDuration = 60;

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const url = req.url || '/';
  if (!url.startsWith('/api')) {
    const suffix = url.startsWith('/') ? url : `/${url}`;
    req.url = suffix === '/' ? '/api' : `/api${suffix}`;
  }
  app(req, res);
}
