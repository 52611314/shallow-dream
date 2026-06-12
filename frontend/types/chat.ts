// 消息角色
export type MessageRole = "user" | "assistant";

// 单条消息
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
  references?: DocumentReference[];  // 检索到的文档引用（如后续添加RAG）
}

// 文档引用（备用）
export interface DocumentReference {
  documentId: string;
  title: string;
  snippet: string;
}

// 会话
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// 发送消息的请求体
export interface SendMessageRequest {
  session_id?: string;
  message: string;
}

// 后端流式响应的数据块
export interface StreamChunk {
  type: "content" | "reference" | "error" | "done";
  content?: string;
  references?: DocumentReference[];
  error?: string;
}