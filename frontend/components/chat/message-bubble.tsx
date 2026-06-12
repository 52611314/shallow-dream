"use client";

import { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 py-4 px-4 transition-all",
        isUser ? "bg-transparent" : "bg-gray-50 dark:bg-gray-900/50"
      )}
    >
      {/* 头像 */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-primary-100 dark:bg-primary-900 text-primary-600"
            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
        )}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      {/* 消息内容 */}
      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
            {isUser ? "你" : "浅梦助手"}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(message.createdAt)}
          </span>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
          {isUser ? (
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200">
              {message.content}
            </p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content || "思考中..."}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}