import cors from 'cors';
import type { Express, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

/** Origins allowed for browser CORS. */
export function allowedOrigins(): string[] {
  const fromEnv = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const appUrl = process.env.APP_URL?.trim();
  const defaults = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://www.aurahealth.co.ke',
    'https://aurahealth.co.ke',
    'https://aurahealth-delta.vercel.app',
  ];
  const set = new Set([...defaults, ...fromEnv]);
  if (appUrl) {
    try {
      set.add(new URL(appUrl).origin);
    } catch {
      /* ignore invalid APP_URL */
    }
  }
  return [...set];
}

/** Drop non-primitive funnel meta to avoid logging emails / free-form PHI blobs. */
export function sanitizeFunnelMeta(meta: unknown): Record<string, string | number | boolean> | undefined {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
    if (Object.keys(out).length >= 12) break;
    const k = key.slice(0, 40).toLowerCase();
    if (/email|password|token|phone|note|message|prompt|image|base64/.test(k)) continue;
    if (typeof value === 'string') out[key.slice(0, 40)] = value.slice(0, 120);
    else if (typeof value === 'number' && Number.isFinite(value)) out[key.slice(0, 40)] = value;
    else if (typeof value === 'boolean') out[key.slice(0, 40)] = value;
  }
  return Object.keys(out).length ? out : undefined;
}

export function isSafeHttpUrl(raw: unknown): boolean {
  if (typeof raw !== 'string' || !raw.trim()) return false;
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export function applySecurityMiddleware(app: Express) {
  app.disable('x-powered-by');

  const isProd = process.env.NODE_ENV === 'production';
  app.use(
    helmet({
      contentSecurityPolicy: isProd
        ? {
            useDefaults: true,
            directives: {
              defaultSrc: ["'self'"],
              baseUri: ["'self'"],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
              formAction: ["'self'"],
              imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
              fontSrc: ["'self'", 'data:', 'https:'],
              styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
              scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                'https://*.googleapis.com',
                'https://*.gstatic.com',
              ],
              connectSrc: [
                "'self'",
                'https://*.googleapis.com',
                'https://*.firebaseio.com',
                'https://*.firebaseapp.com',
                'https://identitytoolkit.googleapis.com',
                'https://securetoken.googleapis.com',
                'https://firestore.googleapis.com',
                'https://www.googleapis.com',
              ],
              workerSrc: ["'self'", 'blob:'],
              upgradeInsecureRequests: [],
            },
          }
        : false,
      frameguard: { action: 'deny' },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts: isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins().includes(origin)) return callback(null, true);
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      maxAge: 86400,
    })
  );

  // Extra hardening not covered by default Helmet presets.
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    next();
  });
}
