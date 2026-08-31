import { auth } from './firebase';
import { authorizedFetch } from './commerce';

export type AdminSession = {
  ok: true;
  email: string;
};

export async function fetchAdminSession(): Promise<AdminSession> {
  if (!auth.currentUser) {
    const err = Object.assign(new Error('Sign in required'), { code: 'unauthenticated' as const });
    throw err;
  }
  const res = await authorizedFetch('/api/admin/session');
  if (res.status === 401) {
    throw Object.assign(new Error('Sign in required'), { code: 'unauthenticated' as const });
  }
  if (res.status === 403) {
    throw Object.assign(new Error('Not authorized for admin'), { code: 'forbidden' as const });
  }
  if (!res.ok) {
    throw Object.assign(new Error('Admin check failed'), { code: 'failed' as const });
  }
  return res.json() as Promise<AdminSession>;
}
