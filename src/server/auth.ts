import type { NextFunction, Request, Response } from 'express';

export type AuthUser = {
  uid: string;
  email?: string;
  emailVerified: boolean;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function firebaseWebApiKey(): string {
  return process.env.FIREBASE_WEB_API_KEY || 'AIzaSyD7JptGcJbWRAt44G3GCGj0zTZ-UwpF0W0';
}

function splitList(raw: string | undefined): string[] {
  return (raw || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminAllowlist(): string[] {
  return splitList(process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS);
}

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token || null;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseWebApiKey())}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      users?: Array<{
        localId?: string;
        email?: string;
        emailVerified?: boolean;
        disabled?: boolean;
      }>;
    };
    const user = data.users?.[0];
    if (!user?.localId || user.disabled) return null;
    return {
      uid: user.localId,
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
    };
  } catch (err) {
    console.warn('Firebase token lookup failed:', err);
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Sign in required' });
  }
  const user = await verifyFirebaseIdToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  req.user = user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const allowlist = getAdminAllowlist();
  const email = req.user?.email?.trim().toLowerCase();
  if (!allowlist.length || !email || !allowlist.includes(email)) {
    return res.status(403).json({ error: 'Admin only' });
  }
  if (!req.user?.emailVerified) {
    return res.status(403).json({ error: 'Verified admin email required' });
  }
  next();
}

type RateBucket = { n: number; reset: number };
const rateBuckets = new Map<string, RateBucket>();

export function rateLimit(opts: {
  windowMs: number;
  max: number;
  key: (req: Request) => string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = opts.key(req);
    const now = Date.now();
    let bucket = rateBuckets.get(key);
    if (!bucket || now > bucket.reset) {
      bucket = { n: 0, reset: now + opts.windowMs };
      rateBuckets.set(key, bucket);
    }
    bucket.n += 1;
    if (rateBuckets.size > 8000) {
      for (const [k, v] of rateBuckets) {
        if (now > v.reset) rateBuckets.delete(k);
      }
    }
    if (bucket.n > opts.max) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.reset - now) / 1000)));
      return res.status(429).json({ error: 'Too many requests' });
    }
    next();
  };
}

export function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function uidKey(prefix: string) {
  return (req: Request) => `${prefix}:${req.user?.uid || clientIp(req)}`;
}

export function ipKey(prefix: string) {
  return (req: Request) => `${prefix}:${clientIp(req)}`;
}

