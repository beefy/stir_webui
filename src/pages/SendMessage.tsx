import { useState } from "react";
import { login, sendMessage } from "../services/api";

export default function SendMessage() {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!userId.trim()) {
      setStatus({ type: "error", text: "User ID is required." });
      return;
    }
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
      // Ensure user is registered
      await login({ user_id: userId });
      // Send the message
      const res = await sendMessage({
        send_user_id: userId,
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
      <form onSubmit={handleSend} className="card">
        <div className="form-group">
          <label htmlFor="userId">Your User ID</label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="firebase-uid-123"
            required
          />
        </div>

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
