import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLocale } from "../contexts/LocaleContext";
import { localeNames, type Locale } from "../i18n";

export default function Settings() {
  const { user, deleteAccount, logout, loading, error, clearError } = useAuth();
  const { theme, setTheme } = useTheme();
  const { translations: tr, locale, setLocale } = useLocale();
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
      <h1>{tr.settingsTitle}</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {deleteError && <div className="alert alert-error">{deleteError}</div>}

      <div className="card">
        <h2>{tr.account}</h2>
        <div className="settings-info">
          <p>
            <strong>{tr.emailLabel}</strong> {user?.email ?? "N/A"}
          </p>
          <p>
            <strong>{tr.userIdLabel}</strong> {user?.uid ?? "N/A"}
          </p>
          <p>
            <strong>{tr.emailVerified}</strong>{" "}
            {user?.emailVerified ? tr.yes : tr.no}
          </p>
        </div>
      </div>

      <div className="card">
        <h2>{tr.theme}</h2>
        <p className="settings-description">
          {tr.themeDescription}
        </p>
        <div className="theme-options">
          <label className={`theme-option ${theme === "system" ? "active" : ""}`}>
            <input
              type="radio"
              name="theme"
              value="system"
              checked={theme === "system"}
              onChange={() => setTheme("system")}
            />
            <span className="theme-option-label">{tr.system}</span>
          </label>
          <label className={`theme-option ${theme === "light" ? "active" : ""}`}>
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === "light"}
              onChange={() => setTheme("light")}
            />
            <span className="theme-option-label">{tr.light}</span>
          </label>
          <label className={`theme-option ${theme === "dark" ? "active" : ""}`}>
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === "dark"}
              onChange={() => setTheme("dark")}
            />
            <span className="theme-option-label">{tr.dark}</span>
          </label>
        </div>
      </div>

      <div className="card">
        <h2>{tr.language}</h2>
        <p className="settings-description">
          {tr.languageDescription}
        </p>
        <div className="theme-options">
          {(Object.keys(localeNames) as Locale[]).map((loc) => (
            <label key={loc} className={`theme-option ${locale === loc ? "active" : ""}`}>
              <input
                type="radio"
                name="language"
                value={loc}
                checked={locale === loc}
                onChange={() => setLocale(loc)}
              />
              <span className="theme-option-label">{localeNames[loc]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>{tr.signOut}</h2>
        <p className="settings-description">
          {tr.signOutDescription}
        </p>
        <button
          onClick={logout}
          disabled={loading}
          className="btn-danger"
        >
          {loading ? tr.signingOut : tr.signOutButton}
        </button>
      </div>

      <div className="card settings-danger">
        <h2>{tr.deleteAccount}</h2>
        <p className="settings-description">
          {tr.deleteAccountDescription}
        </p>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="btn-danger"
          >
            {tr.deleteMyAccount}
          </button>
        ) : (
          <div className="confirm-delete">
            <p className="confirm-delete-warning">
              {tr.confirmDelete}
            </p>

            {isEmailPassword && (
              <div className="form-group">
                <label htmlFor="delete-password">
                  {tr.enterPasswordConfirm}
                </label>
                <input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder={tr.yourPassword}
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
                {deleteInProgress ? tr.deleting : tr.yesDelete}
              </button>
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  setDeletePassword("");
                }}
                disabled={deleteInProgress}
                className="btn-cancel"
              >
                {tr.cancel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
