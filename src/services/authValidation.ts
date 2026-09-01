export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 80;

const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  '12345678',
  '123456789',
  'qwerty123',
  'letmein1',
  'welcome1',
  'admin123',
  'iloveyou',
  'football',
  'baseball',
  'abc12345',
]);

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  if (email.length < 5 || email.length > 320) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeDisplayName(raw: string): string {
  return raw
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME_LENGTH);
}

export function passwordIssue(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`;
  }
  if (/\s/.test(password)) {
    return 'Password cannot contain spaces.';
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must include a letter and a number.';
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return 'That password is too common. Choose a stronger one.';
  }
  return null;
}

export function signupFieldError(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): string | null {
  const name = sanitizeDisplayName(input.name);
  if (name.length < MIN_NAME_LENGTH) {
    return 'Enter your name (at least 2 characters).';
  }
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    return 'Enter a valid email address.';
  }
  const pw = passwordIssue(input.password);
  if (pw) return pw;
  if (input.password !== input.confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
}

export function signinFieldError(email: string, password: string): string | null {
  if (!email.trim() || !password) {
    return 'Please fill in both email and password.';
  }
  if (!isValidEmail(normalizeEmail(email))) {
    return 'Enter a valid email address.';
  }
  return null;
}
