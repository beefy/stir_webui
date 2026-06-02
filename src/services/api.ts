import type {
  ApiResponse,
  BlockListResponse,
  BlockUserRequest,
  LoginRequest,
  MessageHistoryResponse,
  ReactToMessageRequest,
  ReportMessageRequest,
  SendMessageRequest,
  UnblockUserRequest,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.detail ?? `Request failed with status ${res.status}`);
  }

  return body as T;
}

export function login(data: LoginRequest) {
  return request<ApiResponse>("/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function sendMessage(data: SendMessageRequest) {
  return request<ApiResponse>("/send_message", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMessageHistory(userId: string) {
  return request<MessageHistoryResponse>(
    `/message_history?user_id=${encodeURIComponent(userId)}`
  );
}

export function blockUser(data: BlockUserRequest) {
  return request<ApiResponse>("/block_user", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function unblockUser(data: UnblockUserRequest) {
  return request<ApiResponse>("/unblock_user", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getBlockList(blockedByUserId: string) {
  return request<BlockListResponse>("/block_list", {
    method: "POST",
    body: JSON.stringify({ blocked_by_user_id: blockedByUserId }),
  });
}

export function reactToMessage(data: ReactToMessageRequest) {
  return request<ApiResponse>("/react_to_message", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function reportMessage(data: ReportMessageRequest) {
  return request<ApiResponse>("/report_message", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
