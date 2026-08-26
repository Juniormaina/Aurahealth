function splitList(raw: string | undefined): string[] {
  return (raw || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminAllowlist(): string[] {
  return splitList(import.meta.env.VITE_ADMIN_EMAILS);
}

export function canAccessAdmin(email?: string | null, accessCode?: string): boolean {
  const allowlist = getAdminAllowlist();
  const configuredCode = String(import.meta.env.VITE_ADMIN_ACCESS_CODE || '');
  const normalizedEmail = email?.trim().toLowerCase() || '';

  if (normalizedEmail && allowlist.includes(normalizedEmail)) return true;
  if (configuredCode && accessCode && accessCode === configuredCode) return true;
  return false;
}

export function isAdminAccessConfigured(): boolean {
  return getAdminAllowlist().length > 0 || Boolean(import.meta.env.VITE_ADMIN_ACCESS_CODE);
}
