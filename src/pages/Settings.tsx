import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Settings() {
  const { user, deleteAccount, logout, loading, error, clearError } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");

  // Determine the sign-in provider
  const providerId = user?.providerData[0]?.providerId;
  const isEmailPassword = providerId === "password";

  const handleDeleteAccount = async () => {
    clearError();
    setDeleteError(null);
    setDeleteInProgress(true);
    try {
      // For email/password users, pass the password for re-authentication.
      // For Google SSO users, no password is needed (popup re-auth).
      await deleteAccount(isEmailPassword ? deletePassword : undefined);
      // AuthContext will handle state change; user will be redirected to login
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete account.";
      setDeleteError(msg);
    } finally {
      setDeleteInProgress(false);
      setConfirmDelete(false);
      setDeletePassword("");
    }
  };

  return (
    <div className="page">
      <h1>Settings</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {deleteError && <div className="alert alert-error">{deleteError}</div>}

      <div className="card">
        <h2>Account</h2>
        <div className="settings-info">
          <p>
            <strong>Email:</strong> {user?.email ?? "N/A"}
          </p>
          <p>
            <strong>User ID:</strong> {user?.uid ?? "N/A"}
          </p>
          <p>
            <strong>Email Verified:</strong>{" "}
            {user?.emailVerified ? "Yes" : "No"}
          </p>
        </div>
      </div>

      <div className="card">
        <h2>Sign Out</h2>
        <p className="settings-description">
          Sign out of your account. You will be redirected to the login page.
        </p>
        <button
          onClick={logout}
          disabled={loading}
          className="btn-danger"
        >
          {loading ? "Signing out..." : "Sign Out"}
        </button>
      </div>

      <div className="card settings-danger">
        <h2>Delete Account</h2>
        <p className="settings-description">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="btn-danger"
          >
            Delete My Account
          </button>
        ) : (
          <div className="confirm-delete">
            <p className="confirm-delete-warning">
              Are you sure? This will permanently delete your account.
            </p>

            {isEmailPassword && (
              <div className="form-group">
                <label htmlFor="delete-password">
                  Enter your password to confirm:
                </label>
                <input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  disabled={deleteInProgress}
                />
              </div>
            )}

            <div className="confirm-delete-actions">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInProgress || (isEmailPassword && !deletePassword)}
                className="btn-danger"
              >
                {deleteInProgress ? "Deleting..." : "Yes, Delete My Account"}
              </button>
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  setDeletePassword("");
                }}
                disabled={deleteInProgress}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
