import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { BANNED_LOCATIONS } from "../services/locationCheck";

type Mode = "signin" | "signup" | "forgot";

// Location data for the signup form
const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const COUNTRIES = [
  "US", "AU", "FR", "PT", "IT", "GR",
];

const BANNED_STATES_SET = new Set(BANNED_LOCATIONS.usStates);
const BANNED_COUNTRIES_SET = new Set(BANNED_LOCATIONS.countries);

export default function Login() {
  const { login, signup, loginWithGoogleSso, resetPassword, loading, error, clearError } =
    useAuth();
  const { translations: tr } = useLocale();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [locationCountry, setLocationCountry] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationError, setLocationError] = useState("");

  const switchMode = (newMode: Mode) => {
    clearError();
    setResetSent(false);
    setAgreeTerms(false);
    setLocationCountry("");
    setLocationState("");
    setLocationError("");
    setMode(newMode);
  };

  const isBannedLocation = (country: string, state: string): string | null => {
    if (BANNED_COUNTRIES_SET.has(country)) {
      const key = `location${country}` as keyof typeof tr;
      const name = tr[key] || country;
      return tr.locationBanned.replace("{location}", name);
    }
    if (country === "US" && state && BANNED_STATES_SET.has(state)) {
      const key = `location${state}` as keyof typeof tr;
      const name = tr[key] || state;
      return tr.locationBanned.replace("{location}", name);
    }
    return null;
  };

  const handleCountryChange = (value: string) => {
    setLocationCountry(value);
    setLocationState("");
    setLocationError("");

    if (value && BANNED_COUNTRIES_SET.has(value)) {
      const key = `location${value}` as keyof typeof tr;
      const name = tr[key] || value;
      setLocationError(tr.locationBanned.replace("{location}", name));
    }
  };

  const handleStateChange = (value: string) => {
    setLocationState(value);
    setLocationError("");

    if (value && BANNED_STATES_SET.has(value)) {
      const key = `location${value}` as keyof typeof tr;
      const name = tr[key] || value;
      setLocationError(tr.locationBanned.replace("{location}", name));
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (mode === "forgot") {
      if (!email.trim()) return;
      await resetPassword(email);
      setResetSent(true);
      return;
    }

    if (!email.trim() || !password.trim()) return;

    if (mode === "signin") {
      await login(email, password);
    } else {
      await signup(email, password);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    await loginWithGoogleSso();
  };

  const isSignin = mode === "signin";
  const isForgot = mode === "forgot";
  const isSignup = mode === "signup";

  return (
    <div className="page login-page">
      <h1 className="login-hero">{tr.loginHero}</h1>
      <div className="card login-card">
        {isForgot ? (
          <>
            <h1>{tr.resetPassword}</h1>
            <p className="login-subtitle">
              {tr.resetPasswordSubtitle}
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            {resetSent ? (
              <>
                <div className="alert alert-success">
                  {tr.resetSent}
                </div>
                <button
                  onClick={() => switchMode("signin")}
                  className="btn-primary btn-full"
                >
                  {tr.backToSignIn}
                </button>
              </>
            ) : (
              <form onSubmit={handleEmailSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="resetEmail">{tr.email}</label>
                  <input
                    id="resetEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={tr.emailPlaceholder}
                    required
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary btn-full"
                >
                  {loading ? tr.sendingReset : tr.sendResetLinkButton}
                </button>
              </form>
            )}

            {!resetSent && (
              <p className="login-toggle">
                <button onClick={() => switchMode("signin")} className="link-btn" disabled={loading}>
                  {tr.backToSignIn}
                </button>
              </p>
            )}
          </>
        ) : (
          <>
            <h1>{isSignin ? tr.signIn : tr.createAccount}</h1>
            <p className="login-subtitle">
              {isSignin ? tr.signInSubtitle : tr.createAccountSubtitle}
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleEmailSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="loginEmail">{tr.email}</label>
                <input
                  id="loginEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tr.emailPlaceholder}
                  required
                  autoComplete={isSignin ? "email" : "username"}
                />
              </div>

              <div className="form-group">
                <label htmlFor="loginPassword">{tr.password}</label>
                <input
                  id="loginPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    isSignin ? tr.passwordPlaceholder : tr.choosePassword
                  }
                  required
                  minLength={6}
                  autoComplete={isSignin ? "current-password" : "new-password"}
                />
              </div>

              {isSignup && (
                <>
                  <div className="form-group">
                    <label htmlFor="locationCountry">{tr.locationQuestion}</label>
                    <select
                      id="locationCountry"
                      value={locationCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="location-select"
                      required
                    >
                      <option value="">{tr.locationSelectCountry}</option>
                      {COUNTRIES.map((code) => {
                        const key = `location${code}` as keyof typeof tr;
                        return (
                          <option key={code} value={code}>
                            {tr[key]}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {locationCountry === "US" && (
                    <div className="form-group">
                      <label htmlFor="locationState">{tr.locationSelectState}</label>
                      <select
                        id="locationState"
                        value={locationState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="location-select"
                        required
                      >
                        <option value="">{tr.locationSelectState}</option>
                        {US_STATES.map((code) => {
                          const key = `location${code}` as keyof typeof tr;
                          return (
                            <option key={code} value={code}>
                              {tr[key]}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  {locationError && (
                    <div className="alert alert-error" style={{ fontSize: "0.85rem", padding: "0.6rem 0.75rem" }}>
                      {locationError}
                    </div>
                  )}

                  <div className="form-group agree-terms-group">
                    <label className="agree-terms-label">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="agree-terms-checkbox"
                      />
                      <span>
                        {tr.agreeToTerms
                          .replace("{privacyPolicy}", tr.privacyPolicy)
                          .replace("{termsOfService}", tr.termsOfService)}
                      </span>
                    </label>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading || (isSignup && (!agreeTerms || !locationCountry || !!locationError))}
                className="btn-primary btn-full"
              >
                {loading
                  ? isSignin
                    ? tr.signingIn
                    : tr.creatingAccount
                  : isSignin
                    ? tr.signInWithEmail
                    : tr.createAccountButton}
              </button>
            </form>

            <p className="login-toggle">
              {isSignin ? (
                <>
                  {tr.dontHaveAccount}{" "}
                  <button onClick={() => switchMode("signup")} className="link-btn" disabled={loading}>
                    {tr.signUp}
                  </button>
                  <br />
                  <span style={{ fontSize: "0.85rem" }}>
                    {tr.forgotPassword}{" "}
                    <button onClick={() => switchMode("forgot")} className="link-btn" disabled={loading}>
                      {tr.sendResetLink}
                    </button>
                  </span>
                </>
              ) : (
                <>
                  {tr.alreadyHaveAccount}{" "}
                  <button onClick={() => switchMode("signin")} className="link-btn" disabled={loading}>
                    {tr.signInLink}
                  </button>
                </>
              )}
            </p>

            <div className="login-divider">
              <span>{tr.or}</span>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn-google btn-full"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" className="google-icon">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? tr.pleaseWait : tr.continueWithGoogle}
            </button>

            <p className="login-legal">
              <Link to="/privacy">{tr.privacyPolicy}</Link>
              {" · "}
              <Link to="/terms">{tr.termsOfService}</Link>
            </p>
          </>
        )}
      </div>

      <div className="card login-oss-card">
        <p className="login-oss-heading">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style={{ verticalAlign: "middle", marginRight: "6px" }}>
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          {tr.openSource}
        </p>
        <p className="login-oss-links">
          <a href="https://github.com/beefy/stir_webui" target="_blank" rel="noopener noreferrer">Web UI</a>
          {" · "}
          <a href="https://github.com/beefy/stir_auth" target="_blank" rel="noopener noreferrer">Auth</a>
          {" · "}
          <a href="https://github.com/beefy/stir_webserver" target="_blank" rel="noopener noreferrer">Server</a>
        </p>
      </div>
    </div>
  );
}
