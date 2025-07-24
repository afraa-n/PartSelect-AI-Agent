import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  };
  isUser: boolean;
  avatar: ReactNode;
}

export default function MessageBubble({ message, isUser, avatar }: MessageBubbleProps) {
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const formatContent = (content: string) => {
    // Enhanced formatting with clickable links
    let formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Make URLs clickable - handle both bare URLs and [text](url) format
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>');
    
    return formattedContent.split('\n').map((line, index) => (
      <span key={index}>
        <span dangerouslySetInnerHTML={{ __html: line }} />
        {index < formattedContent.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className={cn(
      "flex items-start space-x-3",
      isUser && "justify-end"
    )}>
      {!isUser && (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          {avatar}
        </div>
      )}
      
      <div className={cn(
        "flex-1",
        isUser && "flex justify-end"
      )}>
        <div className={cn(
          "rounded-lg px-4 py-3 max-w-3xl",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-foreground"
        )}>
          <div className="leading-relaxed">
            {formatContent(message.content)}
          </div>
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
          {avatar}
        </div>
      )}
    </div>
  );
}
