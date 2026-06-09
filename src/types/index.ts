export interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface Message {
  message_id: string;
  send_user_id: string;
  receive_user_id: string | null;
  message: string;
  sent_timestamp: string;
  seen_timestamp: string | null;
  reaction_type: string | null;
  reported: boolean;
}

export interface MessageHistoryResponse {
  messages: Message[];
  pagination: Pagination;
}

export interface BlockedUserEntry {
  blocked_user_id: string;
  messages: Message[];
}

export interface BlockListResponse {
  blocked_users: BlockedUserEntry[];
  pagination: Pagination;
}

export interface ApiResponse {
  success: boolean;
  detail: string;
}

export interface SendMessageRequest {
  message_content: string;
}

export interface ReactToMessageRequest {
  message_id: string;
  reaction_content: string | null;
}

export interface ReportMessageRequest {
  message_id: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface KarmaResponse {
  karma: number;
}

export interface ViewAccountResponse {
  firebase: Record<string, unknown>;
  user: Record<string, unknown> | null;
  messages: Record<string, unknown>[];
  blocked_by_me: Record<string, unknown>[];
  blocked_me: Record<string, unknown>[];
  [key: string]: unknown;
}
