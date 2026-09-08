import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

// Ensure authDomain is strictly Firebase Authentication domain (rb-shutter-club-01.firebaseapp.com)
// and NEVER set to a Vercel domain.
let authDomain =
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
  firebaseConfigData.authDomain ||
  'rb-shutter-club-01.firebaseapp.com';

if (authDomain.includes('vercel.app')) {
  console.warn('Warning: authDomain cannot be a Vercel domain. Automatically reverting to rb-shutter-club-01.firebaseapp.com');
  authDomain = 'rb-shutter-club-01.firebaseapp.com';
}

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigData.apiKey,
  authDomain: authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigData.projectId || 'rb-shutter-club-01',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigData.storageBucket || 'rb-shutter-club-01.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigData.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigData.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Google OAuth Provider with explicit scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Export provider alias for direct signInWithPopup(auth, provider) compatibility
export const provider = googleProvider;

/**
 * Check if the application is currently running inside an iframe
 */
export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

/**
 * Sign in with Google using signInWithPopup(auth, provider)
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Google Sign-In Popup Error:', error);
    throw error;
  }
}

/**
 * Sign in with Google using redirect (recommended for constrained environments)
 */
export async function signInWithGoogleRedirect(): Promise<void> {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    console.error('Firebase Google Sign-In Redirect Error:', error);
    throw error;
  }
}

/**
 * Sign out from Firebase
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase Sign-Out Error:', error);
    throw error;
  }
}

export {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
};
export type { FirebaseUser };

