import { apiClient } from "@/lib/api-client";
import { SendMessageRequest } from "@/types/chat";

// 发送消息（非流式，备用）
export async function sendMessage(req: SendMessageRequest) {
  const response = await apiClient.post("/api/chat", req);
  return response;
}

// 获取会话列表
export async function getSessions() {
  const response = await apiClient.get("/api/sessions");
  return response;
}

// 获取单个会话详情
export async function getSession(sessionId: string) {
  const response = await apiClient.get(`/api/sessions/${sessionId}`);
  return response;
}

// 删除会话
export async function deleteSession(sessionId: string) {
  const response = await apiClient.delete(`/api/sessions/${sessionId}`);
  return response;
}

// 重命名会话
export async function renameSession(sessionId: string, title: string) {
  const response = await apiClient.patch(`/api/sessions/${sessionId}`, { title });
  return response;
}