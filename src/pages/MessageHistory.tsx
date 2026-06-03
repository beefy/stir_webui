import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { getMessageHistory, reactToMessage, reportMessage, blockUser } from "../services/api";
import { formatTime } from "../utils/formatTime";
import type { Message, Pagination } from "../types";

const PAGE_SIZE = 20;

export default function MessageHistory() {
  const { user } = useAuth();
  const { translations: tr } = useLocale();
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
      setActionMsg({ type: "success", text: tr.messageReportedSuccess });
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
      <h1>{tr.messageHistoryTitle}</h1>
      <p className="login-subtitle" style={{ textAlign: "left", marginBottom: "1rem" }}>
        {tr.signedInAs.replace("{email}", user?.email ?? userId)}
      </p>

      {actionMsg && (
        <div className={`alert alert-${actionMsg.type}`}>{actionMsg.text}</div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading && <p className="loading-text">{tr.loading}</p>}

      {!loading && !error && messages.length === 0 && page === 1 && (
        <p className="empty-text">{tr.noMessages}</p>
      )}

      {!loading && !error && messages.length === 0 && page > 1 && (
        <p className="empty-text">{tr.noMoreMessages}</p>
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
                  {isOwnMessage(msg) ? tr.youArrow : tr.anonArrow}
                </span>
                <span className="message-timestamp">
                  {formatTime(msg.sent_timestamp)}
                </span>
              </div>

              <p className="message-content">{msg.message}</p>

              {msg.seen_timestamp && (
                <div className="message-meta">
                  <span className="meta-item seen-badge">
                    {tr.seen.replace("{time}", formatTime(msg.seen_timestamp))}
                  </span>
                </div>
              )}

              {!isOwnMessage(msg) && (
                <div className="message-actions">
                  <div className="vote-group">
                    <button
                      className={`vote-btn up ${msg.reaction_type === "up" ? "active" : ""}`}
                      onClick={() => handleReact(msg.message_id, msg.reaction_type, "up")}
                      title={tr.upvote}
                      aria-label={tr.upvote}
                    >
                      ▲
                    </button>
                    <button
                      className={`vote-btn down ${msg.reaction_type === "down" ? "active" : ""}`}
                      onClick={() => handleReact(msg.message_id, msg.reaction_type, "down")}
                      title={tr.downvote}
                      aria-label={tr.downvote}
                    >
                      ▼
                    </button>
                  </div>

                  <button
                    className="btn-sm btn-report"
                    onClick={() => handleReport(msg.message_id)}
                    disabled={msg.reported}
                    title={msg.reported ? tr.alreadyReported : tr.blockSender}
                  >
                    {msg.reported ? tr.reported : tr.report}
                  </button>
                  <button
                    className="btn-sm btn-block"
                    onClick={() => handleBlock(msg.message_id)}
                    title={tr.blockSender}
                  >
                    {tr.block}
                  </button>
                </div>
              )}

              {isOwnMessage(msg) && (
                <div className="message-actions">
                  {msg.reaction_type && (
                    <span className="meta-item">
                      {tr.recipientReacted.replace(
                        "{reaction}",
                        msg.reaction_type === "up" ? "👍" : "👎"
                      )}
                    </span>
                  )}
                  {msg.reported && (
                    <span className="meta-item reported">{tr.messageReported}</span>
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
            {tr.prevPage}
          </button>
          <span className="pagination-info">
            {tr.pageOf.replace("{page}", String(page)).replace("{total}", String(totalPages))}
          </span>
          <button
            className="btn-sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            {tr.nextPage}
          </button>
        </div>
      )}
    </div>
  );
}
