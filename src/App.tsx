import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import SendMessage from "./pages/SendMessage";
import MessageHistory from "./pages/MessageHistory";
import BlockHistory from "./pages/BlockHistory";
import Login from "./pages/Login";
import Settings from "./pages/Settings";

function AppContent() {
  const { user, loading, initialized } = useAuth();

  // Show a loading spinner while Firebase initializes
  if (!initialized || loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, show the login page
  if (!user) {
    return (
      <Routes>
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
        <span className="navbar-user">
          {user.email ?? user.uid}
        </span>
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
