export * from "./chat";
// 通用类型
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// 消息类型
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

// 会话类型
export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// 灵感类型
export interface Idea {
  id: string;
  sessionId: string;
  content: string;
  createdAt: Date;
}

// UI 状态类型
export interface UIState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark" | "system";
  isLoading: boolean;
}