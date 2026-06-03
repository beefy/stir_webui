import { initializeApp, type FirebaseApp } from "firebase/app";
import { deleteAccountBackend } from "../services/api";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  deleteUser,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type UserCredential,
  type Auth,
  type AuthCredential,
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

/**
 * Re-authenticate the user (required for sensitive operations like account
 * deletion), delete their data from the backend, and then delete the Firebase
 * account.
 *
 * For email/password users the caller must provide the current password.
 * For Google SSO users a new popup sign-in is triggered.
 */
export async function reauthenticateAndDeleteAccount(
  password?: string
): Promise<void> {
  const a = await initFirebase();
  const user = a.currentUser;
  if (!user) throw new Error("No user is signed in.");

  // Determine the sign-in provider
  const providerId = user.providerData[0]?.providerId;

  if (providerId === "password") {
    if (!password) {
      throw new Error("Password is required to re-authenticate.");
    }
    const cred = EmailAuthProvider.credential(
      user.email!,
      password
    );
    await reauthenticateWithCredential(user, cred);
  } else if (providerId === "google.com") {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(a, provider);
    // Extract the credential from the popup result
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential) {
      throw new Error("Failed to obtain Google credential for re-authentication.");
    }
    await reauthenticateWithCredential(user, credential);
  }

  // Delete user data from the backend first
  await deleteAccountBackend();

  // Now delete the Firebase account
  await deleteUser(user);
}

export async function signOut(): Promise<void> {
  const a = await initFirebase();
  await a.signOut();
}
