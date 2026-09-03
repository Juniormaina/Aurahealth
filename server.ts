import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import { createApiApp } from './src/server/createApp';

// This project's env vars (GEMINI_API_KEY, PRIVATE_KEY, etc.) live in
// src/.env, not a root .env — load that explicitly, with a plain
// dotenv.config() fallback for deployments that inject env vars a
// different way (e.g. a root .env, or the platform's own env injection).
dotenv.config({ path: path.join(process.cwd(), 'src', '.env') });
dotenv.config();

function listenPort(raw: string | undefined, fallback = 3000): number {
  const n = Number.parseInt(String(raw || ''), 10);
  if (!Number.isInteger(n) || n < 1 || n > 65535) return fallback;
  return n;
}

async function startServer() {
  const app = createApiApp();
  const PORT = listenPort(process.env.PORT);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
