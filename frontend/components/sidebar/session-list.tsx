"use client";

import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Plus, Trash2, MoreHorizontal } from "lucide-react";
import { useState } from "react";

export function SessionList() {
  const {
    sessions,
    currentSessionId,
    createSession,
    setCurrentSession,
    deleteSession,
  } = useChatStore();

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleNewSession = () => {
    createSession();
  };

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 新建对话按钮 */}
      <div className="p-3">
        <Button
          onClick={handleNewSession}
          color="primary"
          className="w-full justify-start gap-2"
          startContent={<Plus size={16} />}
        >
          新建对话
        </Button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <p className="text-xs text-gray-400 px-2 py-2">最近对话</p>
        
        {sessions.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400">
            暂无对话
          </div>
        )}

        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all",
              currentSessionId === session.id
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            onClick={() => setCurrentSession(session.id)}
            onMouseEnter={() => setHoveredId(session.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <MessageSquare size={16} className="flex-shrink-0 opacity-60" />
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {session.title}
              </div>
              <div className="text-xs text-gray-400">
                {formatDate(session.updatedAt)}
              </div>
            </div>

            <button
              onClick={(e) => handleDelete(e, session.id)}
              className={cn(
                "p-1 rounded-md transition-all",
                hoveredId === session.id
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100",
                "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              )}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* 底部信息 */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-400 text-center">
          ✨ {sessions.length} 个对话
        </div>
      </div>
    </div>
  );
}