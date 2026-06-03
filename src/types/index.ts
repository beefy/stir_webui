export interface Message {
  message_id: string;
  send_user_id: string;
  receive_user_id: string;
  message: string;
  sent_timestamp: string;
  seen_timestamp: string | null;
  reaction_type: string | null;
  reported: boolean;
}

export interface MessageHistoryResponse {
  messages: Message[];
}

export interface BlockedUserEntry {
  blocked_user_id: string;
  messages: Message[];
}

export interface BlockListResponse {
  blocked_users: BlockedUserEntry[];
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
