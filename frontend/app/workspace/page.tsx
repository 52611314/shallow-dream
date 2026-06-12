"use client";

import { MainLayout } from "@/components/layouts/main-layout";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { useChat } from "@/hooks/use-chat";
import { useChatStore } from "@/stores/chat-store";

export default function WorkspacePage() {
  const { sendMessage, stopGeneration, isStreaming, isTyping } = useChat();
  const currentSession = useChatStore((s) => s.getCurrentSession());
  const messages = currentSession?.messages || [];

  return (
    <MainLayout sidebar={<Sidebar />}>
      <div className="flex-1 flex flex-col h-full">
        <MessageList messages={messages} isTyping={isTyping && isStreaming} />
        <ChatInput
          onSend={sendMessage}
          onStop={stopGeneration}
          isStreaming={isStreaming}
        />
      </div>
    </MainLayout>
  );
}