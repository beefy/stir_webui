import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { sendMessage } from "../services/api";

export default function SendMessage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!message.trim()) {
      setStatus({ type: "error", text: "Message content is required." });
      return;
    }
    if (message.length > 255) {
      setStatus({
        type: "error",
        text: "Message must be 255 characters or fewer.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await sendMessage({
        message_content: message,
      });
      setStatus({ type: "success", text: res.detail });
      setMessage("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send message";
      setStatus({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Send a Message</h1>
      <p className="login-subtitle" style={{ textAlign: "left", marginBottom: "1rem" }}>
        Signed in as: {user?.email ?? user?.uid}
      </p>
      <form onSubmit={handleSend} className="card">
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            maxLength={255}
            rows={4}
            required
          />
          <span className="char-count">{message.length}/255</span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>

      {status && (
        <div className={`alert alert-${status.type}`}>{status.text}</div>
      )}
    </div>
  );
}
