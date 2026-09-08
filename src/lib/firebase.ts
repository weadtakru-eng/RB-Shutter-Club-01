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
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseConfigData from '../../firebase-applet-config.json';

// Environment variables with fallback
const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const envStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const envMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const envAppId = import.meta.env.VITE_FIREBASE_APP_ID;

// Detect if running in AI Studio development container vs Vercel / custom production
const isDefaultAiStudioKey = !envApiKey || envApiKey === firebaseConfigData.apiKey;
const isLocalOrStudioDev =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('run.app') ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

// Match authDomain with the corresponding project to prevent INVALID_CONTINUE_URI:
// If using the default AI Studio key in development, route to its hosting domain.
// On Vercel (or when VITE_FIREBASE_AUTH_DOMAIN is provided), use rb-shutter-club-01.firebaseapp.com.
const authDomain =
  envAuthDomain ||
  (isDefaultAiStudioKey && isLocalOrStudioDev
    ? 'gen-lang-client-0251310318.firebaseapp.com'
    : 'rb-shutter-club-01.firebaseapp.com');

const projectId =
  envProjectId ||
  (authDomain.includes('gen-lang-client')
    ? 'gen-lang-client-0251310318'
    : 'rb-shutter-club-01');

export const firebaseConfig = {
  apiKey: envApiKey || firebaseConfigData.apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket:
    envStorageBucket ||
    firebaseConfigData.storageBucket ||
    'rb-shutter-club-01.firebasestorage.app',
  messagingSenderId:
    envMessagingSenderId ||
    firebaseConfigData.messagingSenderId ||
    '216138127351',
  appId:
    envAppId ||
    firebaseConfigData.appId ||
    '1:216138127351:web:b80983339b3c42351e00f2',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  firestoreInstance = getFirestore(app);
}
export const db = firestoreInstance;

let storageInstance: FirebaseStorage;
try {
  storageInstance = getStorage(app);
} catch {
  storageInstance = getStorage();
}
export const storage = storageInstance;

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
    host === 'rb-shutter-club-01.vercel.app' ||
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
    const message = error?.message || '';

    // Explicit error logging with error.code, error.message, and runtime context
    console.error('[Firebase Auth Error - signInWithPopup]:', {
      code,
      message,
      authDomain: auth.config.authDomain,
      projectId: firebaseConfig.projectId,
      currentOrigin: typeof window !== 'undefined' ? window.location.origin : '',
      currentHost: typeof window !== 'undefined' ? window.location.hostname : '',
      fullError: error,
    });

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
    const code = error?.code || '';
    const message = error?.message || '';

    // Explicit error logging with error.code, error.message, and runtime context
    console.error('[Firebase Auth Error - signInWithGoogleRedirect]:', {
      code,
      message,
      authDomain: auth.config.authDomain,
      projectId: firebaseConfig.projectId,
      currentOrigin: typeof window !== 'undefined' ? window.location.origin : '',
      currentHost: typeof window !== 'undefined' ? window.location.hostname : '',
      fullError: error,
    });

    throw error;
  }
}

/**
 * Sign out from Firebase
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('[Firebase Auth Error - signOut]:', {
      code: error?.code,
      message: error?.message,
      fullError: error,
    });
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

