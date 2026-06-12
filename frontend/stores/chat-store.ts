import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatSession, ChatMessage } from "@/types/chat";
import { generateId } from "@/lib/utils";

interface ChatState {
  // 状态
  sessions: ChatSession[];
  currentSessionId: string | null;
  isStreaming: boolean;
  isTyping: boolean;

  // 操作
  createSession: (title?: string) => ChatSession;
  setCurrentSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;
  addMessage: (sessionId: string, message: Omit<ChatMessage, "id" | "createdAt">) => void;
  updateLastMessage: (sessionId: string, content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setTyping: (typing: boolean) => void;
  getCurrentSession: () => ChatSession | undefined;
  clearCurrentSessionMessages: () => void;
}

// 生成会话标题（使用首条消息的前30字符）
const generateSessionTitle = (firstMessage: string): string => {
  const title = firstMessage.slice(0, 30);
  return title.length < firstMessage.length ? title + "..." : title;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // 初始状态
      sessions: [],
      currentSessionId: null,
      isStreaming: false,
      isTyping: false,

      // 创建新会话
      createSession: (title = "新对话") => {
        const newSession: ChatSession = {
          id: generateId(),
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        }));
        return newSession;
      },

      // 切换当前会话
      setCurrentSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },

      // 删除会话
      deleteSession: (sessionId) => {
        const { sessions, currentSessionId } = get();
        const newSessions = sessions.filter((s) => s.id !== sessionId);
        let newCurrentId = currentSessionId;
        
        // 如果删除的是当前会话，切换到第一个会话或设为 null
        if (currentSessionId === sessionId) {
          newCurrentId = newSessions[0]?.id || null;
        }
        
        set({
          sessions: newSessions,
          currentSessionId: newCurrentId,
        });
      },

      // 重命名会话
      renameSession: (sessionId, title) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, title, updatedAt: new Date() }
              : s
          ),
        }));
      },

      // 添加消息
      addMessage: (sessionId, message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
          createdAt: new Date(),
        };
        
        set((state) => {
          const newSessions = state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            
            const newMessages = [...s.messages, newMessage];
            // 如果是第一条用户消息，自动生成会话标题
            let newTitle = s.title;
            if (s.messages.length === 0 && message.role === "user") {
              newTitle = generateSessionTitle(message.content);
            }
            
            return {
              ...s,
              title: newTitle,
              messages: newMessages,
              updatedAt: new Date(),
            };
          });
          
          return { sessions: newSessions };
        });
      },

      // 更新最后一条消息（用于流式输出）
      updateLastMessage: (sessionId, content) => {
        set((state) => {
          const newSessions = state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const messages = [...s.messages];
            if (messages.length === 0) return s;
            
            const lastMsg = messages[messages.length - 1];
            messages[messages.length - 1] = {
              ...lastMsg,
              content,
            };
            
            return { ...s, messages, updatedAt: new Date() };
          });
          return { sessions: newSessions };
        });
      },

      // 设置流式输出状态
      setStreaming: (streaming) => set({ isStreaming: streaming }),
      
      // 设置 AI 正在输入状态
      setTyping: (typing) => set({ isTyping: typing }),

      // 获取当前会话
      getCurrentSession: () => {
        const { sessions, currentSessionId } = get();
        return sessions.find((s) => s.id === currentSessionId);
      },

      // 清空当前会话消息
      clearCurrentSessionMessages: () => {
        const { currentSessionId } = get();
        if (!currentSessionId) return;
        
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === currentSessionId
              ? { ...s, messages: [], updatedAt: new Date() }
              : s
          ),
        }));
      },
    }),
    {
      name: "chat-storage",  // localStorage key
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);