import { useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import { useChat } from "@/hooks/useChat";

export default function ChatPage() {
  const [conversationId] = useState(() => `conv_${Date.now()}`);
  const { messages, sendMessage, isLoading, error, loadingMessage } = useChat(conversationId);

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto bg-background">
      <ChatHeader />
      <ChatMessages messages={messages} isLoading={isLoading} loadingMessage={loadingMessage} />
      <ChatInput 
        onSendMessage={sendMessage} 
        isLoading={isLoading} 
        error={error}
      />
    </div>
  );
}
