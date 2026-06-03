import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { getBlockList, unblockUser } from "../services/api";
import { formatTime } from "../utils/formatTime";
import type { BlockedUserEntry, Pagination } from "../types";

const PAGE_SIZE = 20;

export default function BlockHistory() {
  const { user } = useAuth();
  const { translations: tr } = useLocale();
  const userId = user?.uid ?? "";
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchBlocks = useCallback(async (p: number) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    setActionMsg(null);
    try {
      const data = await getBlockList(p, PAGE_SIZE);
      setBlockedUsers(data.blocked_users);
      setPagination(data.pagination);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch block history";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBlocks(page);
  }, [fetchBlocks, page]);

  const handleUnblock = async (blockedUserId: string) => {
    setActionMsg(null);
    try {
      const res = await unblockUser({ blocked_user_id: blockedUserId });
      setActionMsg({ type: "success", text: res.detail });
      // Remove the entry from the list
      setBlockedUsers((prev) =>
        prev.filter((b) => b.blocked_user_id !== blockedUserId)
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to unblock user";
      setActionMsg({ type: "error", text: msg });
    }
  };

  const totalPages = pagination?.total_pages ?? 0;

  return (
    <div className="page">
      <h1>{tr.blockHistoryTitle}</h1>

      {actionMsg && (
        <div className={`alert alert-${actionMsg.type}`}>{actionMsg.text}</div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading && <p className="loading-text">{tr.loading}</p>}

      {!loading && !error && blockedUsers.length === 0 && page === 1 && (
        <p className="empty-text">{tr.noBlockedUsers}</p>
      )}

      {!loading && !error && blockedUsers.length === 0 && page > 1 && (
        <p className="empty-text">{tr.noMoreBlocked}</p>
      )}

      {blockedUsers.length > 0 && (
        <div className="block-list">
          {blockedUsers.map((entry) => (
            <div key={entry.blocked_user_id} className="card block-entry">
              <div className="block-entry-header">
                <strong>{tr.blockedUser}</strong>{" "}
                <code>{entry.blocked_user_id}</code>
                <button
                  className="btn-sm btn-unblock"
                  onClick={() => handleUnblock(entry.blocked_user_id)}
                >
                  {tr.unblock}
                </button>
              </div>

              <p className="blocked-msg-count">
                {entry.messages.length === 1
                  ? tr.messageCount.replace("{count}", String(entry.messages.length))
                  : tr.messageCountPlural.replace("{count}", String(entry.messages.length))}
              </p>

              {entry.messages.length > 0 && (
                <div className="blocked-messages message-list">
                  {entry.messages.map((msg) => (
                    <div key={msg.message_id} className="message-card">
                      <div className="message-header">
                        <span className="message-direction">
                          {msg.send_user_id === userId
                            ? tr.youArrowBlocked
                            : tr.blockedArrowYou}
                        </span>
                        <span className="message-timestamp">
                          {formatTime(msg.sent_timestamp)}
                        </span>
                      </div>
                      <p className="message-content">{msg.message}</p>
                      <div className="message-meta">
                        {msg.reaction_type && (
                          <span className="meta-item">
                            {tr.reaction.replace(
                              "{emoji}",
                              msg.reaction_type === "up" ? "👍" : "👎"
                            )}
                          </span>
                        )}
                        {msg.reported && (
                          <span className="meta-item reported">{tr.reported}</span>
                        )}
                      </div>
                    </div>
                  ))}
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
