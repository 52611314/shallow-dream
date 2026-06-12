"use client";

import { useCallback, useRef } from "react";
import { useChatStore } from "@/stores/chat-store";
import { ChatMessage } from "@/types/chat";

// 流式聊天 Hook
export function useChat() {
  const {
    currentSessionId,
    isStreaming,
    setStreaming,
    setTyping,
    addMessage,
    updateLastMessage,
    createSession,
  } = useChatStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      // 获取或创建会话
      let sessionId = currentSessionId;
      if (!sessionId) {
        const newSession = createSession();
        sessionId = newSession.id;
      }

      // 添加用户消息
      addMessage(sessionId, {
        role: "user",
        content: content.trim(),
      });

      // 添加一个占位的 AI 消息（用于流式更新）
      addMessage(sessionId, {
        role: "assistant",
        content: "",
      });

      // 开始流式请求
      setStreaming(true);
      setTyping(true);

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            message: content.trim(),
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("无法读取响应流");
        }

        let accumulatedContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // 假设后端直接返回文本流
          accumulatedContent += chunk;
          updateLastMessage(sessionId, accumulatedContent);
        }

        setTyping(false);
        setStreaming(false);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          console.log("请求已取消");
        } else {
          console.error("发送消息失败:", error);
          updateLastMessage(sessionId, "抱歉，发生了错误，请稍后重试。");
        }
        setTyping(false);
        setStreaming(false);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [currentSessionId, isStreaming, addMessage, updateLastMessage, createSession, setStreaming, setTyping]
  );

  // 停止生成
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setStreaming(false);
      setTyping(false);
    }
  }, [setStreaming, setTyping]);

  // 重新生成最后一条消息
  const regenerate = useCallback(() => {
    // 简化版：获取当前会话的最后一条用户消息，重新发送
    // 完整版需要从 store 中获取
    console.log("重新生成功能待实现");
  }, []);

  return {
    sendMessage,
    stopGeneration,
    regenerate,
    isStreaming,
    isTyping: useChatStore((s) => s.isTyping),
    currentSession: useChatStore((s) => s.getCurrentSession()),
    sessions: useChatStore((s) => s.sessions),
  };
}