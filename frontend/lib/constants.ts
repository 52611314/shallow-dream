// 常量定义
export const APP_NAME = "浅梦写作助手";
export const APP_NAME_EN = "Shallow Dream";

// API 路由
export const API_ROUTES = {
  CHAT: "/api/chat",
  IDEAS: "/api/ideas",
  SESSIONS: "/api/sessions",
} as const;

// 消息类型
export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
} as const;

// 本地存储 key
export const STORAGE_KEYS = {
  THEME: "shallow-dream-theme",
  SESSIONS: "shallow-dream-sessions",
} as const;