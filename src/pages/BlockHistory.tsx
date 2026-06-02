import { useState, useEffect, useCallback } from "react";
import { getBlockList, unblockUser } from "../services/api";
import type { BlockedUserEntry } from "../types";

export default function BlockHistory() {
  const [userId, setUserId] = useState("");
  const [submittedUserId, setSubmittedUserId] = useState("");
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchBlockList = useCallback(async () => {
    if (!submittedUserId.trim()) return;
    setLoading(true);
    setError(null);
    setActionMsg(null);
    try {
      const data = await getBlockList(submittedUserId);
      setBlockedUsers(data.blocked_users);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch block list";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [submittedUserId]);

  useEffect(() => {
    fetchBlockList();
  }, [fetchBlockList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedUserId(userId);
  };

  const handleUnblock = async (blockedUserId: string) => {
    setActionMsg(null);
    try {
      const res = await unblockUser({
        blocked_by_user_id: submittedUserId,
        blocked_user_id: blockedUserId,
      });
      setActionMsg({ type: "success", text: res.detail });
      // Remove from local state
      setBlockedUsers((prev) =>
        prev.filter((b) => b.blocked_user_id !== blockedUserId)
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to unblock user";
      setActionMsg({ type: "error", text: msg });
    }
  };

  return (
    <div className="page">
      <h1>Block History</h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label htmlFor="blockUserId">Your User ID</label>
          <input
            id="blockUserId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="firebase-uid-123"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Load Block List"}
        </button>
      </form>

      {actionMsg && (
        <div className={`alert alert-${actionMsg.type}`}>{actionMsg.text}</div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading && <p className="loading-text">Loading block list...</p>}

      {!loading && !error && submittedUserId && blockedUsers.length === 0 && (
        <p className="empty-text">No blocked users.</p>
      )}

      {blockedUsers.length > 0 && (
        <div className="block-list">
          {blockedUsers.map((entry) => (
            <div key={entry.blocked_user_id} className="card block-entry">
              <div className="block-entry-header">
                <strong>Blocked User:</strong> {entry.blocked_user_id}
                <button
                  className="btn-sm btn-unblock"
                  onClick={() => handleUnblock(entry.blocked_user_id)}
                >
                  Unblock
                </button>
              </div>

              {entry.messages.length > 0 && (
                <div className="blocked-messages">
                  <p className="blocked-msg-count">
                    Messages from this user ({entry.messages.length}):
                  </p>
                  {entry.messages.map((msg) => (
                    <div key={msg.message_id} className="message-card received">
                      <div className="message-header">
                        <span className="message-timestamp">
                          {new Date(msg.sent_timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="message-content">{msg.message}</p>
                      <div className="message-meta">
                        {msg.reaction_type && (
                          <span className="meta-item">
                            Reaction: {msg.reaction_type === "up" ? "👍" : "👎"}
                          </span>
                        )}
                        {msg.reported && (
                          <span className="meta-item reported">Reported</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {entry.messages.length === 0 && (
                <p className="empty-text">No messages from this user.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
