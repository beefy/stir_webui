import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import SendMessage from "./pages/SendMessage";
import MessageHistory from "./pages/MessageHistory";
import BlockHistory from "./pages/BlockHistory";

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <NavLink to="/" end>
          Send Message
        </NavLink>
        <NavLink to="/history">Message History</NavLink>
        <NavLink to="/blocks">Block History</NavLink>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<SendMessage />} />
          <Route path="/history" element={<MessageHistory />} />
          <Route path="/blocks" element={<BlockHistory />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
