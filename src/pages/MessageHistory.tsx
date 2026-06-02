import { useState, useEffect, useCallback } from "react";
import { getMessageHistory, reactToMessage, reportMessage, blockUser } from "../services/api";
import type { Message } from "../types";

export default function MessageHistory() {
  const [userId, setUserId] = useState("");
  const [submittedUserId, setSubmittedUserId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!submittedUserId.trim()) return;
    setLoading(true);
    setError(null);
    setActionMsg(null);
    try {
      const data = await getMessageHistory(submittedUserId);
      setMessages(data.messages);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch message history";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [submittedUserId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedUserId(userId);
  };

  const handleReact = async (messageId: string, currentReaction: string | null) => {
    setActionMsg(null);
    // Cycle: null -> up -> down -> null
    let next: string | null;
    if (currentReaction === null) next = "up";
    else if (currentReaction === "up") next = "down";
    else next = null;

    try {
      await reactToMessage({ message_id: messageId, reaction_content: next });
      setMessages((prev) =>
        prev.map((m) =>
          m.message_id === messageId ? { ...m, reaction_type: next } : m
        )
      );
      setActionMsg({
        type: "success",
        text: next === null ? "Reaction cleared" : `Reacted ${next}`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to react";
      setActionMsg({ type: "error", text: msg });
    }
  };

  const handleReport = async (messageId: string) => {
    setActionMsg(null);
    try {
      await reportMessage({ message_id: messageId });
      setMessages((prev) =>
        prev.map((m) =>
          m.message_id === messageId ? { ...m, reported: true } : m
        )
      );
      setActionMsg({ type: "success", text: "Message reported" });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to report";
      setActionMsg({ type: "error", text: msg });
    }
  };

  const handleBlock = async (messageId: string) => {
    setActionMsg(null);
    if (!submittedUserId.trim()) return;
    try {
      const res = await blockUser({
        blocked_by_user_id: submittedUserId,
        message_id: messageId,
      });
      setActionMsg({ type: "success", text: res.detail });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to block user";
      setActionMsg({ type: "error", text: msg });
    }
  };

  const isOwnMessage = (msg: Message) => msg.send_user_id === submittedUserId;

  return (
    <div className="page">
      <h1>Message History</h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label htmlFor="historyUserId">Your User ID</label>
          <input
            id="historyUserId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="firebase-uid-123"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Load History"}
        </button>
      </form>

      {actionMsg && (
        <div className={`alert alert-${actionMsg.type}`}>{actionMsg.text}</div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading && <p className="loading-text">Loading messages...</p>}

      {!loading && !error && submittedUserId && messages.length === 0 && (
        <p className="empty-text">No messages found.</p>
      )}

      {messages.length > 0 && (
        <div className="message-list">
          {messages.map((msg) => (
            <div
              key={msg.message_id}
              className={`message-card ${isOwnMessage(msg) ? "sent" : "received"}`}
            >
              <div className="message-header">
                <span className="message-direction">
                  {isOwnMessage(msg) ? "You → Anon" : "Anon → You"}
                </span>
                <span className="message-timestamp">
                  {new Date(msg.sent_timestamp).toLocaleString()}
                </span>
              </div>

              <p className="message-content">{msg.message}</p>

              <div className="message-meta">
                {msg.seen_timestamp && (
                  <span className="meta-item">
                    Seen: {new Date(msg.seen_timestamp).toLocaleString()}
                  </span>
                )}
                {msg.reaction_type && (
                  <span className="meta-item">
                    Reaction: {msg.reaction_type === "up" ? "👍" : "👎"}
                  </span>
                )}
                {msg.reported && (
                  <span className="meta-item reported">Reported</span>
                )}
              </div>

              {!isOwnMessage(msg) && (
                <div className="message-actions">
                  <button
                    className="btn-sm"
                    onClick={() => handleReact(msg.message_id, msg.reaction_type)}
                    title={`React (current: ${msg.reaction_type ?? "none"})`}
                  >
                    {msg.reaction_type === "up"
                      ? "👍"
                      : msg.reaction_type === "down"
                        ? "👎"
                        : "React"}
                  </button>
                  <button
                    className="btn-sm btn-report"
                    onClick={() => handleReport(msg.message_id)}
                    disabled={msg.reported}
                    title={msg.reported ? "Already reported" : "Report message"}
                  >
                    {msg.reported ? "Reported" : "Report"}
                  </button>
                  <button
                    className="btn-sm btn-block"
                    onClick={() => handleBlock(msg.message_id)}
                    title="Block sender"
                  >
                    Block
                  </button>
                </div>
              )}

              {isOwnMessage(msg) && (
                <div className="message-actions">
                  <span className="meta-item">
                    {msg.reaction_type
                      ? `Recipient reacted: ${msg.reaction_type === "up" ? "👍" : "👎"}`
                      : "No reaction yet"}
                  </span>
                  <span className="meta-item">
                    {msg.reported ? "Message was reported" : "Not reported"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
