import { cert, getApps, initializeApp, applicationDefault, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const FALLBACK_PROJECT_ID = 'aura-health-f478f';

function projectId(): string {
  return process.env.FIREBASE_PROJECT_ID || FALLBACK_PROJECT_ID;
}

function serviceAccountFromEnv(): { projectId: string; clientEmail: string; privateKey: string } | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as {
        project_id?: string;
        client_email?: string;
        private_key?: string;
      };
      if (parsed.client_email && parsed.private_key) {
        return {
          projectId: parsed.project_id || projectId(),
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key,
        };
      }
    } catch (err) {
      console.warn('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON:', err);
    }
  }
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (clientEmail && privateKey) {
    return { projectId: projectId(), clientEmail, privateKey };
  }
  return null;
}

let app: App | null | undefined;
let db: Firestore | null | undefined;

function getAdminApp(): App | null {
  if (app !== undefined) return app;
  if (getApps().length) {
    app = getApps()[0]!;
    return app;
  }
  const sa = serviceAccountFromEnv();
  try {
    if (sa) {
      app = initializeApp({
        credential: cert({
          projectId: sa.projectId,
          clientEmail: sa.clientEmail,
          privateKey: sa.privateKey,
        }),
        projectId: sa.projectId,
      });
      return app;
    }
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      app = initializeApp({
        credential: applicationDefault(),
        projectId: projectId(),
      });
      return app;
    }
  } catch (err) {
    console.warn('Firebase Admin failed to initialize:', err);
    app = null;
    return null;
  }
  console.warn(
    'Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON (or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY). Cowries/streaks will not persist for signed-in users.'
  );
  app = null;
  return null;
}

export function getAdminDb(): Firestore | null {
  if (db !== undefined) return db;
  const adminApp = getAdminApp();
  if (!adminApp) {
    db = null;
    return null;
  }
  db = getFirestore(adminApp);
  return db;
}

export function rewardsLedgerConfigured(): boolean {
  return getAdminDb() != null;
}

/** Verify a Firebase ID token with revocation check when Admin SDK is configured. */
export async function verifyIdTokenWithAdmin(idToken: string): Promise<{
  uid: string;
  email?: string;
  emailVerified: boolean;
} | null> {
  const adminApp = getAdminApp();
  if (!adminApp) return null;
  try {
    const decoded = await getAuth(adminApp).verifyIdToken(idToken, true);
    return {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: Boolean(decoded.email_verified),
    };
  } catch {
    return null;
  }
}
