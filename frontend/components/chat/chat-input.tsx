"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send, Square, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || isStreaming || disabled) return;
    onSend(input.trim());
    setInput("");
    // 重置 textarea 高度
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    if (onStop) onStop();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // 自动调整高度
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="输入消息... (Shift+Enter 换行，Enter 发送)"
              disabled={disabled || isStreaming}
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              style={{ minHeight: "44px", maxHeight: "200px" }}
            />
          </div>

          {isStreaming ? (
            <Button
              onClick={handleStop}
              variant="flat"
              color="danger"
              className="rounded-full"
              isIconOnly
            >
              <Square size={18} />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              color="primary"
              className="rounded-full"
              isIconOnly
              disabled={!input.trim() || disabled}
            >
              <Send size={18} />
            </Button>
          )}
        </div>

        {/* 提示文字 */}
        <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-400">
          <Sparkles size={12} />
          <span>AI 助手可以根据你的需求生成文本</span>
        </div>
      </div>
    </div>
  );
}