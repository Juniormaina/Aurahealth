import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
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

// Configuration from firebase-applet-config.json
const firebaseConfig = {
  projectId: "fine-scheduler-3t3g1",
  appId: "1:345048568587:web:ba1e7a2156a9358f31480e",
  apiKey: "AIzaSyDfKBPKhZROmG-zcRammPR5JihSr_1jGrs",
  authDomain: "fine-scheduler-3t3g1.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-aurahealthdailyw-dba03373-0875-43ec-bb60-7fa3fc89dff3",
  storageBucket: "fine-scheduler-3t3g1.firebasestorage.app",
  messagingSenderId: "345048568587",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Specify custom database ID if provided in config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
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

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
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
