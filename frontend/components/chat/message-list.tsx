"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { MessageBubble } from "./message-bubble";
import { Spinner } from "@/components/ui/spinner";
import { Bot } from "lucide-react";
interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export function MessageList({ messages, isTyping = false }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-5xl">💬</div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
            开始你的创作之旅
          </h3>
          <p className="text-sm text-gray-400">
            输入消息，AI 助手会帮助你写作
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {/* 正在输入指示器 */}
        {isTyping && (
          <div className="flex gap-3 py-4 px-4 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Bot size={18} className="text-gray-600 dark:text-gray-300" />
            </div>
            <div className="space-y-1">
              <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                浅梦助手
              </span>
              <div className="flex gap-1 items-center h-6">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>
    </div>
  );
}