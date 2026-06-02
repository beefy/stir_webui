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
  loginWithEmail,
  loginWithGoogle,
  signOut as firebaseSignOut,
  sendVerificationEmail,
  deleteFirebaseAccount,
} from "../services/firebase";
import { translateFirebaseError } from "../services/firebaseErrors";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogleSso: () => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  deleteAccount: () => Promise<void>;
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
    try {
      const cred = await loginWithEmail(email, password);

      // Check if email is verified
      if (!cred.user.emailVerified) {
        // Send a new verification email
        await sendVerificationEmail();
        // Sign the user out since they can't proceed without verification
        await firebaseSignOut();
        setState({
          user: null,
          loading: false,
          initialized: true,
          error:
            "Please verify your email before signing in. A new verification email has been sent.",
        });
        return;
      }

      setState({
        user: cred.user,
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
          : "An unexpected error occurred during sign in.";
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

  const deleteAccount = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await deleteFirebaseAccount();
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
        loginWithGoogleSso,
        logout,
        resendVerification,
        deleteAccount,
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
