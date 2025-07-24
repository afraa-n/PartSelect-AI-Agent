import { useEffect, useRef } from "react";
import { Bot, User, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ProductCard from "./ProductCard";
import { Message } from "@/hooks/useChat";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  loadingMessage?: string;
}

export default function ChatMessages({ messages, isLoading, loadingMessage }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const welcomeMessage: Message = {
    role: 'assistant' as const,
    content: "Welcome to PartSelect. I'm here to assist you with **refrigerator and dishwasher parts**, including compatibility verification, installation guidance, troubleshooting support, and order inquiries. How may I help you today?",
    timestamp: Date.now(),
    productCards: undefined,
  };

  const allMessages = messages.length === 0 ? [welcomeMessage] : messages;

  return (
    <main className="flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-6 space-y-6">
        {allMessages.map((message, index) => (
          <div key={index}>
            <MessageBubble
              message={message}
              isUser={message.role === 'user'}
              avatar={message.role === 'user' ? 
                <User className="text-muted-foreground text-sm" /> : 
                <Bot className="text-primary-foreground text-sm" />
              }
            />
            
            {/* Render product cards if present */}
            {message.productCards && message.productCards.length > 0 && (
              <div className="flex items-start space-x-3 mt-3">
                <div className="w-8 h-8 flex-shrink-0"></div>
                <div className="flex-1 space-y-3">
                  {message.productCards.map((product, cardIndex) => (
                    <ProductCard key={cardIndex} product={product} />
                  ))}
                </div>
              </div>
            )}

          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-primary-foreground text-sm" />
            </div>
            <div className="flex-1">
              <div className="bg-muted rounded-lg px-4 py-3 max-w-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-muted-foreground text-sm">{loadingMessage || "Analyzing your request..."}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </main>
  );
}
