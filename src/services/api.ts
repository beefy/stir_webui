import { getAuth } from "firebase/auth";
import type {
  ApiResponse,
  BlockListResponse,
  MessageHistoryResponse,
  ReactToMessageRequest,
  ReportMessageRequest,
  SendMessageRequest,
  UnreadCountResponse,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function getFirebaseToken(): Promise<string> {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error("Not authenticated");
  }
  const token = await auth.currentUser.getIdToken();
  return token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getFirebaseToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...options,
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.detail ?? `Request failed with status ${res.status}`);
  }

  return body as T;
}

/** Register the Firebase user ID with the backend (POST /login). */
export function loginBackend() {
  return request<ApiResponse>("/login", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

/** Delete the user's data from the backend (POST /delete_account). */
export function deleteAccountBackend() {
  return request<ApiResponse>("/delete_account", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function sendMessage(data: SendMessageRequest) {
  return request<ApiResponse>("/send_message", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMessageHistory() {
  return request<MessageHistoryResponse>("/message_history");
}

export function blockUser(data: { message_id: string }) {
  return request<ApiResponse>("/block_user", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function unblockUser(data: { blocked_user_id: string }) {
  return request<ApiResponse>("/unblock_user", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getBlockList() {
  return request<BlockListResponse>("/block_list", {
    method: "POST",
    body: JSON.stringify({}),
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

/** Get the number of unread messages for the authenticated user (GET /unread_messages). */
export function getUnreadCount() {
  return request<UnreadCountResponse>("/unread_messages");
}
