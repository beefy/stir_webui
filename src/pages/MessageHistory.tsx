import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMessageHistory, reactToMessage, reportMessage, blockUser } from "../services/api";
import { formatTime } from "../utils/formatTime";
import type { Message, Pagination } from "../types";

const PAGE_SIZE = 20;

export default function MessageHistory() {
  const { user } = useAuth();
  const userId = user?.uid ?? "";
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchHistory = useCallback(async (p: number) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    setActionMsg(null);
    try {
      const data = await getMessageHistory(p, PAGE_SIZE);
      setMessages(data.messages);
      setPagination(data.pagination);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch message history";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory(page);
  }, [fetchHistory, page]);

  const handleReact = async (messageId: string, currentReaction: string | null, target: "up" | "down") => {
    setActionMsg(null);
    const next = currentReaction === target ? null : target;

    try {
      await reactToMessage({ message_id: messageId, reaction_content: next });
      setMessages((prev) =>
        prev.map((m) =>
          m.message_id === messageId ? { ...m, reaction_type: next } : m
        )
      );
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
    try {
      const res = await blockUser({ message_id: messageId });
      setActionMsg({ type: "success", text: res.detail });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to block user";
      setActionMsg({ type: "error", text: msg });
    }
  };

  const isOwnMessage = (msg: Message) => msg.send_user_id === userId;

  const totalPages = pagination?.total_pages ?? 0;

  return (
    <div className="page">
      <h1>Message History</h1>
      <p className="login-subtitle" style={{ textAlign: "left", marginBottom: "1rem" }}>
        Signed in as: {user?.email ?? userId}
      </p>

      {actionMsg && (
        <div className={`alert alert-${actionMsg.type}`}>{actionMsg.text}</div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading && <p className="loading-text">Loading messages...</p>}

      {!loading && !error && messages.length === 0 && page === 1 && (
        <p className="empty-text">No messages found.</p>
      )}

      {!loading && !error && messages.length === 0 && page > 1 && (
        <p className="empty-text">No more messages.</p>
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
                  {formatTime(msg.sent_timestamp)}
                </span>
              </div>

              <p className="message-content">{msg.message}</p>

              {msg.seen_timestamp && (
                <div className="message-meta">
                  <span className="meta-item seen-badge">
                    ✓ Seen {formatTime(msg.seen_timestamp)}
                  </span>
                </div>
              )}

              {!isOwnMessage(msg) && (
                <div className="message-actions">
                  <div className="vote-group">
                    <button
                      className={`vote-btn up ${msg.reaction_type === "up" ? "active" : ""}`}
                      onClick={() => handleReact(msg.message_id, msg.reaction_type, "up")}
                      title="Upvote"
                      aria-label="Upvote"
                    >
                      ▲
                    </button>
                    <button
                      className={`vote-btn down ${msg.reaction_type === "down" ? "active" : ""}`}
                      onClick={() => handleReact(msg.message_id, msg.reaction_type, "down")}
                      title="Downvote"
                      aria-label="Downvote"
                    >
                      ▼
                    </button>
                  </div>

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
                  {msg.reaction_type && (
                    <span className="meta-item">
                      Recipient reacted: {msg.reaction_type === "up" ? "👍" : "👎"}
                    </span>
                  )}
                  {msg.reported && (
                    <span className="meta-item reported">Message was reported</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
