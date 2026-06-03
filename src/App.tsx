import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import SendMessage from "./pages/SendMessage";
import MessageHistory from "./pages/MessageHistory";
import BlockHistory from "./pages/BlockHistory";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

function AppContent() {
  const { user, loading, initialized } = useAuth();
  const { resolved, setTheme } = useTheme();

  // Show a loading spinner while Firebase initializes
  if (!initialized || loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, show the login page (or legal pages)
  if (!user) {
    return (
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Authenticated — show the main app
  return (
    <>
      <nav className="navbar">
        <NavLink to="/" end>
          Send Message
        </NavLink>
        <NavLink to="/history">Message History</NavLink>
        <NavLink to="/blocks">Block History</NavLink>
        <NavLink to="/settings">Settings</NavLink>
        <button
          className="navbar-theme-btn"
          onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
          title={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle theme"
        >
          {resolved === "dark" ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zM5.05 5.05a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm13.9 0a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM12 7a5 5 0 100 10 5 5 0 000-10zm-9 4a1 1 0 100 2h1a1 1 0 100-2H3zm16 0a1 1 0 100 2h1a1 1 0 100-2h-1zm-9.95 5.536a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm8.486 0a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM12 19a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zM5.05 5.05a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm13.9 0a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM12 7a5 5 0 100 10 5 5 0 000-10zm-9 4a1 1 0 100 2h1a1 1 0 100-2H3zm16 0a1 1 0 100 2h1a1 1 0 100-2h-1zm-9.95 5.536a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm8.486 0a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM12 19a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
            </svg>
          )}
        </button>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<SendMessage />} />
          <Route path="/history" element={<MessageHistory />} />
          <Route path="/blocks" element={<BlockHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
