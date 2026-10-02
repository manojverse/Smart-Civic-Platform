import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfigData) : getApp();

// Initialize Firestore against the actual default database in Firebase Console.
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

export const googleClientId = (import.meta as any).env?.VITE_FIREBASE_GOOGLE_CLIENT_ID || '';
export const isGoogleAuthConfigured = Boolean(googleClientId && firebaseConfigData?.authDomain);

export const googleProvider = isGoogleAuthConfigured ? new GoogleAuthProvider() : null;
if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  });
}

// Test connection per Firebase integration guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore client is offline or network restricted:', error.message);
      return false;
    }
    // Document not existing or permission on test doc is expected and means server answered
    return true;
  }
}

// Kick off connection test
testFirestoreConnection().catch(() => {});

export {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
};
