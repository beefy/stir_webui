import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  deleteUser,
  sendEmailVerification,
  type UserCredential,
  type Auth,
} from "firebase/auth";

const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_BASE_URL ?? "http://localhost:3001";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

async function getFirebaseConfig(): Promise<FirebaseConfig> {
  const res = await fetch(`${AUTH_BASE_URL}/api/firebase-config`);
  if (!res.ok) throw new Error("Failed to fetch Firebase configuration");
  return res.json();
}

export async function initFirebase(): Promise<Auth> {
  if (auth) return auth;
  const config = await getFirebaseConfig();
  app = initializeApp(config);
  auth = getAuth(app);
  return auth;
}

export async function createAccount(
  email: string,
  password: string
): Promise<UserCredential> {
  const a = await initFirebase();
  return createUserWithEmailAndPassword(a, email, password);
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const a = await initFirebase();
  return signInWithEmailAndPassword(a, email, password);
}

export async function loginWithGoogle(): Promise<UserCredential> {
  const a = await initFirebase();
  const provider = new GoogleAuthProvider();
  return signInWithPopup(a, provider);
}

export async function sendVerificationEmail(): Promise<void> {
  const a = await initFirebase();
  if (a.currentUser) {
    await sendEmailVerification(a.currentUser);
  }
}

export async function deleteFirebaseAccount(): Promise<void> {
  const a = await initFirebase();
  if (a.currentUser) {
    await deleteUser(a.currentUser);
  }
}

export async function signOut(): Promise<void> {
  const a = await initFirebase();
  await a.signOut();
}
