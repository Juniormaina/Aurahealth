import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import {
  isValidEmail,
  normalizeEmail,
  passwordIssue,
  sanitizeDisplayName,
  signupFieldError,
} from './authValidation';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

// Standalone Firebase project (not tied to AI Studio's Starter Tier, which
// blocked adding authorized domains). Uses the default Firestore database.
const firebaseConfig = {
  apiKey: "AIzaSyD7JptGcJbWRAt44G3GCGj0zTZ-UwpF0W0",
  authDomain: "aura-health-f478f.firebaseapp.com",
  projectId: "aura-health-f478f",
  storageBucket: "aura-health-f478f.firebasestorage.app",
  messagingSenderId: "462623100241",
  appId: "1:462623100241:web:9c7d142b97488d1f4b5770",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Sign in with real Google Account.
 * Tries popup first, falls back to redirect if popup is blocked by iframe constraints.
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Google Popup login failed or blocked by iframe, falling back to redirect:', error);
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, googleProvider);
      throw new Error('Redirecting to Google Sign-In...');
    }
    throw error;
  }
}

export async function checkRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch (error) {
    console.error('Error handling redirect result:', error);
    return null;
  }
}

function continueUrl() {
  if (typeof window === 'undefined') return undefined;
  return { url: `${window.location.origin}/`, handleCodeInApp: false as const };
}

/**
 * Sign in with Email and Password using Firebase Auth.
 */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, normalizeEmail(email), pass);
  return result.user;
}

/**
 * Sign up with Email and Password, then send a verification link.
 */
export async function signUpWithEmail(email: string, pass: string, name: string): Promise<User> {
  const displayName = sanitizeDisplayName(name);
  const normalizedEmail = normalizeEmail(email);
  const invalid = signupFieldError({
    name: displayName,
    email: normalizedEmail,
    password: pass,
    confirmPassword: pass,
  });
  if (invalid) {
    throw Object.assign(new Error(invalid), { code: 'auth/invalid-signup' });
  }
  const weak = passwordIssue(pass);
  if (weak) {
    throw Object.assign(new Error(weak), { code: 'auth/weak-password' });
  }

  const result = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
  await updateProfile(result.user, { displayName });
  try {
    await sendEmailVerification(result.user, continueUrl());
  } catch (err) {
    console.warn('Could not send verification email:', err);
  }
  await result.user.reload();
  return auth.currentUser ?? result.user;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    throw Object.assign(new Error('Enter a valid email address.'), { code: 'auth/invalid-email' });
  }
  await sendPasswordResetEmail(auth, normalized, continueUrl());
}

export async function resendEmailVerification(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw Object.assign(new Error('Sign in required'), { code: 'auth/user-not-found' });
  }
  if (user.emailVerified) return;
  await sendEmailVerification(user, continueUrl());
}

/** Reload the user and mint a fresh ID token so the API sees emailVerified. */
export async function refreshAuthUser(): Promise<User | null> {
  const user = auth.currentUser;
  if (!user) return null;
  await user.reload();
  await user.getIdToken(true);
  return auth.currentUser;
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Maps a Firebase Auth error to a message safe to show the user. Configuration
 * errors (provider disabled, domain not authorized) are project-setup issues
 * in the Firebase Console, not something the user can fix by retrying.
 */
export function getAuthErrorMessage(error: any): string {
  switch (error?.code) {
    case 'auth/invalid-signup':
      return error?.message || 'Check your name, email, and password and try again.';
    case 'auth/operation-not-allowed':
      return 'Email sign-in isn\'t enabled for this app yet. Please try Google Sign-In or Guest mode, or contact support.';
    case 'auth/unauthorized-domain':
      return 'This domain isn\'t authorized for sign-in yet. Please try Email Sign-In or Guest mode, or contact support.';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Sign-in is temporarily misconfigured. Please try Guest mode, or contact support.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/user-not-found':
      return 'No account found for this email. Try Signing Up!';
    case 'auth/email-already-in-use':
      return 'Email is already registered. Please Sign In instead.';
    case 'auth/weak-password':
      return error?.message || 'Password must be at least 8 characters and include a letter and a number.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a minute and try again.';
    case 'auth/network-request-failed':
      return 'Network error — check your connection and try again.';
    case 'auth/missing-password':
    case 'auth/missing-email':
      return 'Please fill in both email and password.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

// User Profile Database Helpers
export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  cowriesBalance: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  completedRewardKeys?: string[];
  habitClaims?: Record<string, string>;
  updatedAt?: any;
}

function identityFromAuth(user: User, existing?: UserProfileData) {
  return {
    email: user.email || existing?.email || '',
    displayName:
      sanitizeDisplayName(user.displayName || existing?.displayName || '') ||
      user.email?.split('@')[0] ||
      'Aura Member',
    photoURL: user.photoURL || existing?.photoURL || '',
  };
}

export async function syncUserProfile(user: User): Promise<UserProfileData> {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data() as UserProfileData;
    const identity = identityFromAuth(user, data);
    const needsIdentitySync =
      identity.email !== (data.email || '') ||
      identity.displayName !== (data.displayName || '') ||
      identity.photoURL !== (data.photoURL || '');
    if (needsIdentitySync) {
      await setDoc(userRef, { ...identity, updatedAt: serverTimestamp() }, { merge: true });
    }
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
      completedRewardKeys: [],
      habitClaims: {},
      ...data,
      ...identity,
    };
  }

  const identity = identityFromAuth(user);
  const newProfile: UserProfileData = {
    uid: user.uid,
    ...identity,
    cowriesBalance: 0,
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCheckInDate: null,
    completedRewardKeys: [],
    habitClaims: {},
    updatedAt: serverTimestamp(),
  };
  await setDoc(userRef, newProfile);
  return newProfile;
}

// Health Log Helper
export async function saveHealthLogToFirestore(uid: string, logData: any) {
  const logsRef = collection(db, 'healthLogs');
  const clip = (value: unknown, max: number) =>
    typeof value === 'string' ? value.slice(0, max) : value;
  await addDoc(logsRef, {
    ...logData,
    id: clip(logData?.id, 128),
    timestamp: clip(logData?.timestamp, 64),
    type: clip(logData?.type, 64),
    notes: clip(logData?.notes, 2000),
    symptoms: clip(logData?.symptoms, 2000),
    proofHash: clip(logData?.proofHash, 128),
    txHash: clip(logData?.txHash, 128),
    aiFeedback: clip(logData?.aiFeedback, 2000),
    uid,
    createdAt: serverTimestamp(),
  });
}

export async function getUserHealthLogsFromFirestore(uid: string) {
  try {
    const logsRef = collection(db, 'healthLogs');
    const q = query(logsRef, where('uid', '==', uid));
    const snap = await getDocs(q);
    const logs: any[] = [];
    snap.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
  } catch (err) {
    console.error('Error getting health logs:', err);
    return [];
  }
}

// Companion Data Sync
export async function getCompanionFromFirestore(uid: string) {
  const compRef = doc(db, 'companion', uid);
  const snap = await getDoc(compRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

export async function saveCompanionToFirestore(uid: string, companionData: any) {
  const compRef = doc(db, 'companion', uid);
  await setDoc(compRef, {
    uid,
    ...companionData,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
