import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Mode = "signin" | "signup" | "forgot";

export default function Login() {
  const { login, signup, loginWithGoogleSso, resetPassword, loading, error, clearError } =
    useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const switchMode = (newMode: Mode) => {
    clearError();
    setResetSent(false);
    setMode(newMode);
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

  return (
    <div className="page login-page">
      <h1 className="login-hero">Message A Stranger Today</h1>
      <div className="card login-card">
        {isForgot ? (
          <>
            <h1>Reset Password</h1>
            <p className="login-subtitle">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            {resetSent ? (
              <>
                <div className="alert alert-success">
                  Password reset email sent! Check your inbox (and spam folder) for the link.
                </div>
                <button
                  onClick={() => switchMode("signin")}
                  className="btn-primary btn-full"
                >
                  Back to Sign In
                </button>
              </>
            ) : (
              <form onSubmit={handleEmailSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="resetEmail">Email</label>
                  <input
                    id="resetEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary btn-full"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}

            {!resetSent && (
              <p className="login-toggle">
                <button onClick={() => switchMode("signin")} className="link-btn" disabled={loading}>
                  Back to Sign In
                </button>
              </p>
            )}
          </>
        ) : (
          <>
            <h1>{isSignin ? "Sign In" : "Create Account"}</h1>
            <p className="login-subtitle">
              {isSignin
                ? "Sign in to access the messaging dashboard."
                : "Create an account to get started."}
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleEmailSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="loginEmail">Email</label>
                <input
                  id="loginEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete={isSignin ? "email" : "username"}
                />
              </div>

              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <input
                  id="loginPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    isSignin ? "Enter your password" : "Choose a password (6+ characters)"
                  }
                  required
                  minLength={6}
                  autoComplete={isSignin ? "current-password" : "new-password"}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary btn-full"
              >
                {loading
                  ? isSignin
                    ? "Signing in..."
                    : "Creating account..."
                  : isSignin
                    ? "Sign In with Email"
                    : "Create Account"}
              </button>
            </form>

            <p className="login-toggle">
              {isSignin ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => switchMode("signup")} className="link-btn" disabled={loading}>
                    Sign up
                  </button>
                  <br />
                  <span style={{ fontSize: "0.85rem" }}>
                    Forgot password?{" "}
                    <button onClick={() => switchMode("forgot")} className="link-btn" disabled={loading}>
                      Send reset link
                    </button>
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => switchMode("signin")} className="link-btn" disabled={loading}>
                    Sign in
                  </button>
                </>
              )}
            </p>

            <div className="login-divider">
              <span>or</span>
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
              {loading ? "Please wait..." : "Continue with Google"}
            </button>

            <p className="login-legal">
              <Link to="/privacy">Privacy Policy</Link>
              {" · "}
              <Link to="/terms">Terms of Service</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
