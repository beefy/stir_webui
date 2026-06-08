import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LocaleProvider, useLocale } from "./contexts/LocaleContext";
import { getUnreadCount } from "./services/api";
import { checkLocation } from "./services/locationCheck";
import SendMessage from "./pages/SendMessage";
import MessageHistory from "./pages/MessageHistory";
import BlockHistory from "./pages/BlockHistory";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

function AppContent() {
  const { user, loading, initialized } = useAuth();
  const { translations: tr } = useLocale();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [locationBlocked, setLocationBlocked] = useState<string | null>(null);
  const [locationChecked, setLocationChecked] = useState(false);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch {
      // Silently ignore — the badge just won't show
    }
  }, [user]);

  // Fetch unread count on mount and poll every 30 seconds
  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30_000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // Clear the badge immediately when navigating to Message History
  useEffect(() => {
    if (location.pathname === "/history") {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  // Check user's location on mount (IP blocklisting)
  useEffect(() => {
    checkLocation().then((result) => {
      if (!result.allowed && result.reason) {
        setLocationBlocked(result.reason);
      }
      setLocationChecked(true);
    });
  }, []);

  // Show a blocked page if the user is from a banned location
  if (locationBlocked) {
    return (
      <div className="page" style={{ maxWidth: "500px", margin: "0 auto", padding: "4rem 1rem", textAlign: "center" }}>
        <h1 style={{ color: "var(--error)", marginBottom: "1rem" }}>Access Denied</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.6 }}>
          {locationBlocked}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "1.5rem" }}>
          If you believe this is an error, please contact the service administrator.
        </p>
      </div>
    );
  }

  // Show a loading spinner while Firebase initializes or location is being checked
  if (!initialized || loading || !locationChecked) {
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
          {tr.navSendMessage}
        </NavLink>
        <NavLink to="/history" className="nav-unread-link">
          {tr.navMessageHistory}
          {unreadCount > 0 && (
            <span className="nav-unread-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
          )}
        </NavLink>
        <NavLink to="/blocks">{tr.navBlockHistory}</NavLink>
        <NavLink to="/settings">{tr.navSettings}</NavLink>
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
        <LocaleProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
