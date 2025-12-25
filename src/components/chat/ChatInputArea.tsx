import { useState, useRef, useCallback } from 'react';
import { Send, Mic, MicOff, Paperclip, X, FileText, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface ChatInputAreaProps {
  onSend: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInputArea({ onSend, isLoading = false, placeholder }: ChatInputAreaProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    setMessage(prev => prev + transcript);
  }, []);

  const { isListening, isSupported, toggleListening, transcript } = useVoiceInput({
    onFinalTranscript: handleVoiceTranscript,
    continuous: true
  });

  const handleSend = () => {
    if (!message.trim() && files.length === 0) return;
    onSend(message.trim(), files.length > 0 ? files : undefined);
    setMessage('');
    setFiles([]);
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-3xl mx-auto">
        {/* Voice Recording Indicator */}
        {isListening && (
          <div className="mb-3 px-4 py-2 bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2.5 h-2.5 bg-destructive rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-sm text-destructive font-medium">Recording...</span>
            {transcript && (
              <span className="text-sm text-muted-foreground truncate flex-1">{transcript}</span>
            )}
          </div>
        )}

        {/* File Attachments */}
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center gap-2 py-1.5 px-3 bg-secondary/80"
              >
                <FileText className="w-3 h-3" />
                <span className="text-xs truncate max-w-[120px]">{file.name}</span>
                <button 
                  onClick={() => removeFile(index)} 
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* ChatGPT-style Input Container */}
        <div className={cn(
          "relative rounded-2xl border transition-all duration-200",
          isFocused 
            ? "border-primary/50 bg-secondary/30 shadow-lg shadow-primary/5" 
            : "border-border bg-secondary/20 hover:border-border/80"
        )}>
          <div className="flex items-end gap-2 p-2">
            {/* Left Actions */}
            <div className="flex items-center gap-1 pb-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isLoading}
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach files</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder || "Message SolsArch..."}
              disabled={isLoading}
              rows={1}
              className={cn(
                "flex-1 resize-none bg-transparent border-0 outline-none text-sm py-2 px-1",
                "placeholder:text-muted-foreground/60 min-h-[40px] max-h-[200px]"
              )}
            />

            {/* Right Actions */}
            <div className="flex items-center gap-1 pb-1">
              {isSupported && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "h-8 w-8 rounded-lg", 
                          isListening 
                            ? "text-destructive hover:text-destructive bg-destructive/10" 
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )} 
                        onClick={toggleListening} 
                        disabled={isLoading}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isListening ? 'Stop recording' : 'Voice input'}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Send Button */}
              <Button 
                onClick={handleSend} 
                disabled={isLoading || (!message.trim() && files.length === 0)} 
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg transition-all",
                  message.trim() || files.length > 0
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          SolsArch can make mistakes. Consider checking important information.
        </p>
      </div>

      <input 
        ref={fileInputRef} 
        type="file" 
        multiple 
        onChange={handleFileSelect} 
        className="hidden" 
        accept=".txt,.md,.json,.yaml,.yml,.pdf,.doc,.docx,.csv" 
      />
    </div>
  );
}