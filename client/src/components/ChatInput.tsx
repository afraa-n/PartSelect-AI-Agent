import { useState, useRef, useEffect } from "react";
import { Send, AlertCircle, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  error: string | null;
}

const quickActions = [
  "What parts do you have for Whirlpool refrigerators?",
  "My dishwasher won't drain, what could be wrong?",
  "Check order status 123456",
  "How do I install PS11752778?",
  "Is PS11756692 compatible with WDT780SAEM1?"
];

export default function ChatInput({ onSendMessage, isLoading, error }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const lastResultIndex = useRef(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    // Stop voice recording if active when sending
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    onSendMessage(message.trim());
    setMessage("");
    lastResultIndex.current = 0;
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsVoiceSupported(true);
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event: any) => {
        let newTranscript = '';
        
        // Only process new results to avoid duplication
        for (let i = lastResultIndex.current; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            newTranscript += event.results[i][0].transcript + ' ';
            lastResultIndex.current = i + 1;
          }
        }
        
        if (newTranscript.trim()) {
          setMessage(prev => prev ? `${prev}${newTranscript}` : newTranscript.trim());
        }
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      lastResultIndex.current = 0;
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Voice recognition error:', error);
      }
    }
  };

  return (
    <footer className="bg-card border-t border-border p-4 lg:p-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Error Message Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about refrigerator or dishwasher parts..."
              className="resize-none min-h-[48px] pr-16"
              rows={1}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {message.length}/500
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isVoiceSupported && (
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={`h-[48px] ${isListening ? 'animate-pulse' : ''} [&_svg]:text-white`}
                title={isListening ? "Click to stop recording" : "Click to start voice input"}
              >
                {isListening ? <Square className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4 text-white" />}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="h-[48px] px-6"
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="hidden lg:inline ml-2">
                {isLoading ? 'Sending...' : 'Send'}
              </span>
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickAction(action)}
              disabled={isLoading}
              className="text-sm"
            >
              {action}
            </Button>
          ))}
        </div>

        {/* Professional Scope */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          <span>Specialized support for refrigerator and dishwasher parts, installation, and troubleshooting.</span>
        </div>
      </form>
    </footer>
  );
}

// TypeScript declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
