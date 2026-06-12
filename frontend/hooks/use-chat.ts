"use client";

import { useCallback, useRef } from "react";
import { useChatStore } from "@/stores/chat-store";

// 流式聊天 Hook（SSE 版本）
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
        let buffer = ""; // 缓冲区，处理不完整的 SSE 行

        // 解析 SSE 事件流
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          buffer += text;

          // 按行分割 SSE 数据
          const lines = buffer.split("\n");
          // 最后一部分可能是不完整的行，保留在缓冲区
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6); // 去掉 "data: " 前缀

              if (data === "[DONE]") {
                // 流结束标记，忽略
                continue;
              }

              // 恢复转义的换行符
              const decoded = data.replace(/\\n/g, "\n");
              accumulatedContent += decoded;
              updateLastMessage(sessionId, accumulatedContent);
            }
          }
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
