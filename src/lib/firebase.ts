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
const authDomain = 'rb-shutter-club-01.firebaseapp.com';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigData.apiKey,
  authDomain: authDomain,
  projectId: 'rb-shutter-club-01',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigData.storageBucket || 'rb-shutter-club-01.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigData.messagingSenderId || '216138127351',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigData.appId || '1:216138127351:web:b80983339b3c42351e00f2',
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
 * Check if current domain is known to be in Firebase Authorized Domains
 */
export function isAuthorizedDomain(): boolean {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.firebaseapp.com') ||
    host.endsWith('.web.app') ||
    host.endsWith('.vercel.app') ||
    host.includes('vercel.app') ||
    host.includes('run.app')
  );
}

/**
 * Sign in with Google using signInWithPopup(auth, provider)
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    const code = error?.code || '';
    if (
      code === 'auth/invalid-continue-uri' ||
      code === 'auth/unauthorized-domain' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/popup-blocked' ||
      code === 'auth/cancelled-popup-request'
    ) {
      console.warn(`[Firebase Auth notice] ${code}:`, error?.message || error);
    } else {
      console.warn('[Firebase Google Sign-In]:', error);
    }
    throw error;
  }
}

/**
 * Sign in with Google using redirect (recommended for constrained environments)
 */
export async function signInWithGoogleRedirect(): Promise<void> {
  if (isInIframe()) {
    // If inside an iframe, Google OAuth redirect will be blocked by X-Frame-Options: DENY.
    // Safely open the app in a new top-level window so the user can authenticate cleanly.
    window.open(window.location.origin + window.location.pathname + '?login=true', '_blank', 'noopener,noreferrer');
    return;
  }
  try {
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    console.warn('[Firebase Google Sign-In Redirect notice]:', error?.code || error);
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
    console.warn('[Firebase Sign-Out notice]:', error);
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

