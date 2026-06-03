import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { sendMessage, getKarmaCount } from "../services/api";

export default function SendMessage() {
  const { user } = useAuth();
  const { translations: tr } = useLocale();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [karma, setKarma] = useState<number | null>(null);

  // Fetch karma count on mount — non-blocking, errors are silently ignored
  useEffect(() => {
    let cancelled = false;
    getKarmaCount()
      .then((data) => {
        if (!cancelled) setKarma(data.karma);
      })
      .catch(() => {
        // Silently ignore — karma just won't show
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!message.trim()) {
      setStatus({ type: "error", text: tr.messageRequired });
      return;
    }
    if (message.length > 255) {
      setStatus({ type: "error", text: tr.messageTooLong });
      return;
    }

    setLoading(true);
    try {
      const res = await sendMessage({
        message_content: message,
      });
      setStatus({ type: "success", text: res.detail || tr.messageSent });
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
      <h1>{tr.sendMessageTitle}</h1>
      <p className="login-subtitle" style={{ textAlign: "left", marginBottom: "1rem" }}>
        {tr.signedInAs.replace("{email}", user?.email ?? user?.uid ?? "")}
      </p>

      {karma !== null && (
        <div className="karma-display">
          {tr.karma.replace("{value}", "")}
          <span className={`karma-value ${karma > 0 ? "positive" : karma < 0 ? "negative" : ""}`}>
            {karma > 0 ? `+${karma}` : karma}
          </span>
        </div>
      )}

      <form onSubmit={handleSend} className="card">
        <div className="form-group">
          <label htmlFor="message">{tr.messageLabel}</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={tr.messagePlaceholder}
            maxLength={255}
            rows={4}
            required
          />
          <span className="char-count">{message.length}/255</span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? tr.sending : tr.sendButton}
        </button>
      </form>

      {status && (
        <div className={`alert alert-${status.type}`}>{status.text}</div>
      )}
    </div>
  );
}
