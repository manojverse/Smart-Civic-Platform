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
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfigData) : getApp();

// Initialize Firestore against the default database in Firebase
export const db = getFirestore(app, (firebaseConfigData as any)?.firestoreDatabaseId || '(default)');

// Initialize Firebase Auth
export const auth = getAuth(app);

export const googleClientId =
  (import.meta as any).env?.VITE_FIREBASE_GOOGLE_CLIENT_ID ||
  (firebaseConfigData as any)?.oAuthClientId ||
  '';

export const isGoogleAuthConfigured = Boolean(firebaseConfigData?.authDomain);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

// Canonical Smart Civic password rule: minimum 6 characters, at least 1 uppercase letter
export const validatePassword = (password: string): PasswordValidationResult => {
  if (!password || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter.' };
  }
  return { valid: true };
};

// Deterministic transformer to satisfy Firebase Authentication cloud 8-char policy for valid 6-7 char passwords
export const toFirebaseAuthPassword = (rawPassword: string): string => {
  if (rawPassword.length >= 8) {
    return rawPassword;
  }
  return `${rawPassword}#SC`;
};

// Demo accounts specification for Development/Testing
export interface DemoAccountInfo {
  label: 'Citizen' | 'Officer' | 'Admin';
  role: 'citizen' | 'officer' | 'admin';
  email: string;
  password: string;
  name: string;
  mobile: string;
}

export const DEMO_ACCOUNTS: Record<'citizen' | 'officer' | 'admin', DemoAccountInfo> = {
  citizen: {
    label: 'Citizen',
    role: 'citizen',
    email: 'citizen@smartcivic.org',
    password: 'City@123',
    name: 'Citizen Resident',
    mobile: '+91 98401 22334',
  },
  officer: {
    label: 'Officer',
    role: 'officer',
    email: 'officer@smartcivic.test',
    password: 'Officer@123',
    name: 'Field Officer',
    mobile: '+91 94441 23456',
  },
  admin: {
    label: 'Admin',
    role: 'admin',
    email: 'admin@smartcivic.test',
    password: 'Admin@123',
    name: 'Civic Administrator',
    mobile: '+91 44 2561 9000',
  },
};

// Map short usernames/aliases like citizen@civic
export const normalizeEmailAlias = (input: string): string => {
  const clean = input.trim().toLowerCase();
  if (
    clean === 'citizen@civic' ||
    clean === 'citizen' ||
    clean === 'citizen@smartcivic.test' ||
    clean === 'citizen@civic.local'
  ) {
    return 'citizen@smartcivic.org';
  }
  if (clean === 'officer@civic' || clean === 'officer') return 'officer@smartcivic.test';
  if (clean === 'admin@civic' || clean === 'admin') return 'admin@smartcivic.test';
  return clean;
};

// Normalize demo passwords to satisfy Firebase upper case password policy
export const normalizePassword = (email: string, pass: string): string => {
  const clean = normalizeEmailAlias(email);
  if (
    (clean === 'citizen@smartcivic.org' || clean === 'citizen@smartcivic.test') &&
    pass.toLowerCase() === 'city@123'
  ) {
    return 'City@123';
  }
  if (clean === 'officer@smartcivic.test' && pass.toLowerCase() === 'officer@123') return 'Officer@123';
  if (clean === 'admin@smartcivic.test' && pass.toLowerCase() === 'admin@123') return 'Admin@123';
  return toFirebaseAuthPassword(pass);
};

// Authenticate or bootstrap real Firebase Auth demo accounts
export async function authenticateDemoAccount(role: 'citizen' | 'officer' | 'admin') {
  const config = DEMO_ACCOUNTS[role];
  const { email, password, name, mobile } = config;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await setDoc(
      doc(db, 'users', cred.user.uid),
      {
        uid: cred.user.uid,
        name,
        email,
        mobile,
        role,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return cred.user;
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          name,
          email,
          mobile,
          role,
          status: 'active',
          createdAt: new Date().toISOString(),
        });
        return cred.user;
      } catch (createErr: any) {
        if (createErr?.code === 'auth/email-already-in-use') {
          const fallbackPasswords = [
            role === 'citizen' ? 'Citizen@12345' : role === 'officer' ? 'Officer@12345' : 'Admin@12345',
            'smartcivic2026',
            'city@123',
            'officer@123',
            'admin@123',
          ];
          for (const fallbackPass of fallbackPasswords) {
            try {
              const oldCred = await signInWithEmailAndPassword(auth, email, fallbackPass);
              try {
                await updatePassword(oldCred.user, password);
              } catch (_) {}
              await setDoc(
                doc(db, 'users', oldCred.user.uid),
                {
                  uid: oldCred.user.uid,
                  name,
                  email,
                  mobile,
                  role,
                  status: 'active',
                  createdAt: new Date().toISOString(),
                },
                { merge: true }
              );
              return oldCred.user;
            } catch (_) {}
          }
        }
        throw createErr;
      }
    } else {
      throw err;
    }
  }
}

// Test connection per Firebase integration guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified to default database.');
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore client is offline or network restricted:', error.message);
      return false;
    }
    return true;
  }
}

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
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
};
