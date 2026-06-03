import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  initFirebase,
  createAccount,
  loginWithEmail,
  loginWithGoogle,
  signOut as firebaseSignOut,
  sendVerificationEmail,
  reauthenticateAndDeleteAccount,
  resetPassword as firebaseResetPassword,
} from "../services/firebase";
import { translateFirebaseError } from "../services/firebaseErrors";
import { loginBackend } from "../services/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

// Tracks whether we're about to sign the user out after login/signup
// (e.g., because email is not verified). This prevents the brief flash
// of the authenticated app before the sign-out completes.
let isPendingSignOut = false;

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogleSso: () => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false,
    error: null,
  });

  // Initialize Firebase and listen for auth state changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    initFirebase()
      .then((auth) => {
        unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
          // During signup or unverified-email login we sign in then immediately
          // sign out, so ignore the intermediate authenticated state.
          if (isPendingSignOut) return;

          setState({
            user: firebaseUser,
            loading: false,
            initialized: true,
            error: null,
          });
        });
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to initialize Firebase";
        setState({
          user: null,
          loading: false,
          initialized: false,
          error: msg,
        });
      });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    // Set the flag before signing in so onAuthStateChanged ignores the
    // intermediate authenticated state if we need to sign out again.
    isPendingSignOut = true;
    try {
      const cred = await loginWithEmail(email, password);

      // Check if email is verified
      if (!cred.user.emailVerified) {
        // Send a new verification email
        await sendVerificationEmail();
        // Sign the user out since they can't proceed without verification
        await firebaseSignOut();
        isPendingSignOut = false;
        setState({
          user: null,
          loading: false,
          initialized: true,
          error:
            "Please verify your email before signing in. A new verification email has been sent.",
        });
        return;
      }

      // Email is verified — allow the login
      isPendingSignOut = false;
      setState({
        user: cred.user,
        loading: false,
        initialized: true,
        error: null,
      });

      // Register the Firebase user ID with the backend
      loginBackend().catch(() => {
        // Non-critical — the backend will pick up the user on first real request
      });
    } catch (err: unknown) {
      isPendingSignOut = false;
      const firebaseErr = err as { code?: string };
      const msg = firebaseErr.code
        ? translateFirebaseError(firebaseErr.code)
        : err instanceof Error
          ? err.message
          : "An unexpected error occurred during sign in.";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }));
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    isPendingSignOut = true;
    try {
      await createAccount(email, password);

      // Send verification email immediately after signup
      await sendVerificationEmail();

      // Sign the user out since they need to verify their email first
      await firebaseSignOut();
      isPendingSignOut = false;
      setState({
        user: null,
        loading: false,
        initialized: true,
        error:
          "Account created! A verification email has been sent. Please verify your email before signing in.",
      });
    } catch (err: unknown) {
      isPendingSignOut = false;
      const firebaseErr = err as { code?: string };
      const msg = firebaseErr.code
        ? translateFirebaseError(firebaseErr.code)
        : err instanceof Error
          ? err.message
          : "An unexpected error occurred during sign up.";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }));
    }
  }, []);

  const loginWithGoogleSso = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const cred = await loginWithGoogle();
      setState({
        user: cred.user,
        loading: false,
        initialized: true,
        error: null,
      });

      // Register the Firebase user ID with the backend
      loginBackend().catch(() => {
        // Non-critical — the backend will pick up the user on first real request
      });
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      const msg = firebaseErr.code
        ? translateFirebaseError(firebaseErr.code)
        : err instanceof Error
          ? err.message
          : "An unexpected error occurred during Google sign in.";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await firebaseSignOut();
      setState({
        user: null,
        loading: false,
        initialized: true,
        error: null,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to sign out.";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }));
    }
  }, []);

  const resendVerification = useCallback(async () => {
    try {
      await sendVerificationEmail();
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      const msg = firebaseErr.code
        ? translateFirebaseError(firebaseErr.code)
        : err instanceof Error
          ? err.message
          : "Failed to send verification email.";
      setState((prev) => ({ ...prev, error: msg }));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await firebaseResetPassword(email);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      const msg = firebaseErr.code
        ? translateFirebaseError(firebaseErr.code)
        : err instanceof Error
          ? err.message
          : "Failed to send password reset email.";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }));
    }
  }, []);

  const deleteAccount = useCallback(async (password?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await reauthenticateAndDeleteAccount(password);
      setState({
        user: null,
        loading: false,
        initialized: true,
        error: null,
      });
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      const msg = firebaseErr.code
        ? translateFirebaseError(firebaseErr.code)
        : err instanceof Error
          ? err.message
          : "Failed to delete account.";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        loginWithGoogleSso,
        logout,
        resendVerification,
        deleteAccount,
        resetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
