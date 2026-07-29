import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
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

/**
 * Sign in with Email and Password using Firebase Auth.
 */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/**
 * Sign up with Email and Password using Firebase Auth.
 */
export async function signUpWithEmail(email: string, pass: string, name?: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (name && result.user) {
    await updateProfile(result.user, { displayName: name });
  }
  return result.user;
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
      return 'Password should be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error — check your connection and try again.';
    default:
      return error?.message || 'Something went wrong. Please try again.';
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
  updatedAt?: any;
}

export async function syncUserProfile(user: User): Promise<UserProfileData> {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data() as UserProfileData;
    return data;
  } else {
    const newProfile: UserProfileData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Aura Member',
      photoURL: user.photoURL || '',
      cowriesBalance: 0, // Starts at 0 for fresh user
      totalXp: 0, // Starts at 0 for fresh user
      updatedAt: serverTimestamp()
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }
}

export async function updateUserCowries(uid: string, cowriesBalance: number, totalXp: number) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    cowriesBalance,
    totalXp,
    updatedAt: serverTimestamp()
  });
}

// Health Log Helper
export async function saveHealthLogToFirestore(uid: string, logData: any) {
  const logsRef = collection(db, 'healthLogs');
  await addDoc(logsRef, {
    uid,
    ...logData,
    createdAt: serverTimestamp()
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
