/**
 * Translates Firebase Auth error codes into human-readable messages.
 * See: https://firebase.google.com/docs/auth/admin/errors
 */
export function translateFirebaseError(code: string): string {
  switch (code) {
    // Email/Password errors
    case "auth/email-already-exists":
      return "An account with this email already exists.";
    case "auth/email-already-in-use":
      return "An account with this email is already registered.";
    case "auth/invalid-email":
      return "The email address is not valid.";
    case "auth/invalid-password":
      return "The password is invalid. It must be at least 6 characters.";
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/weak-password":
      return "The password is too weak. Use at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait a moment and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support for help.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled. Contact support.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials and try again.";

    // Google SSO errors
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email but different sign-in method. Try signing in with email and password.";
    case "auth/credential-already-in-use":
      return "This credential is already linked to another account.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled. Please try again.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked. Please allow popups for this site.";
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled. Please try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for sign-in. Contact support.";

    // Token / session errors
    case "auth/id-token-expired":
      return "Your session has expired. Please sign in again.";
    case "auth/id-token-revoked":
      return "Your session has been revoked. Please sign in again.";
    case "auth/invalid-user-token":
      return "Your session is invalid. Please sign in again.";
    case "auth/user-token-expired":
      return "Your session has expired. Please sign in again.";

    // Account deletion errors
    case "auth/requires-recent-login":
      return "This action requires a recent login. Please sign out and sign in again before deleting your account.";

    // Network / general errors
    case "auth/network-request-failed":
      return "A network error occurred. Please check your internet connection and try again.";
    case "auth/internal-error":
      return "An unexpected error occurred. Please try again.";
    case "auth/timeout":
      return "The request timed out. Please check your connection and try again.";

    default:
      // If we don't have a translation, return a generic message with the code
      return `Authentication error: ${code}. Please try again.`;
  }
}
