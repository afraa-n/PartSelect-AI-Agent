import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatRequest, ChatResponse, ProductCard } from "@shared/schema";
import { getLoadingMessage } from "@/lib/loadingMessages";

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  productCards?: ProductCard[];
  timestamp: number;
  loadingMessage?: string;
}

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState<string>("");

  const chatMutation = useMutation({
    mutationFn: async (message: string): Promise<ChatResponse> => {
      const request: ChatRequest = { message, conversationId };
      const response = await apiRequest('POST', '/api/chat', request);
      return await response.json();
    },
    onMutate: (message: string) => {
      // Set context-specific loading message
      const loadingMsg = getLoadingMessage(message);
      setCurrentLoadingMessage(loadingMsg);
      
      // Optimistically add user message
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMessage]);
    },
    onSuccess: (response: ChatResponse) => {
      // Clear loading message
      setCurrentLoadingMessage("");
      
      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.text,
        productCards: response.productCards,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      // Clear loading message and remove the optimistically added user message on error
      setCurrentLoadingMessage("");
      setMessages(prev => prev.slice(0, -1));
    },
  });

  const sendMessage = useCallback((message: string) => {
    chatMutation.mutate(message);
  }, [chatMutation]);

  return {
    messages,
    sendMessage,
    isLoading: chatMutation.isPending,
    loadingMessage: currentLoadingMessage,
    error: chatMutation.error?.message || null,
  };
}
