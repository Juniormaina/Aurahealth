import type { IncomingMessage, ServerResponse } from 'node:http';

/** Temporary probe — replace with createApiApp wiring after Vercel invoke works. */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      status: 'ok',
      probe: 'minimal-vercel-handler',
      url: req.url || null,
    })
  );
}
