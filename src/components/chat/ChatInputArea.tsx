import { useState, useRef } from 'react';
import { Send, Mic, MicOff, Paperclip, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useCallback } from 'react';

interface ChatInputAreaProps {
  onSend: (message: string, files?: File[]) => void;
  isLoading?: boolean;
}

export function ChatInputArea({ onSend, isLoading = false }: ChatInputAreaProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    <div className="border-t border-border bg-card/80 backdrop-blur-xl p-3 sm:p-4">
      {isListening && (
        <div className="mb-3 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20 flex items-center gap-3">
          <div className="relative">
            <div className="w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
            <div className="absolute inset-0 w-2.5 h-2.5 bg-destructive rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-sm text-primary font-medium">Listening...</span>
          {transcript && (
            <span className="text-sm text-muted-foreground truncate">{transcript}</span>
          )}
        </div>
      )}

      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-2 py-1.5 px-3">
              <FileText className="w-3 h-3" />
              <span className="text-xs truncate max-w-[120px]">{file.name}</span>
              <button onClick={() => removeFile(index)} className="ml-1 hover:text-destructive transition-colors">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your architecture requirements..."
            disabled={isLoading}
            className={cn(
              "min-h-[48px] max-h-[200px] resize-none pr-20 text-sm",
              "bg-secondary/50 border-border/50 focus:border-primary/50",
              "placeholder:text-muted-foreground/60"
            )}
            rows={1}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-foreground" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isLoading}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach files</TooltipContent>
              </Tooltip>

              {isSupported && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-7 w-7", 
                        isListening 
                          ? "text-destructive hover:text-destructive bg-destructive/10" 
                          : "text-muted-foreground hover:text-foreground"
                      )} 
                      onClick={toggleListening} 
                      disabled={isLoading}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isListening ? 'Stop listening' : 'Voice input'}</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </div>

        <Button 
          onClick={handleSend} 
          disabled={isLoading || (!message.trim() && files.length === 0)} 
          size="icon"
          className="h-10 w-10"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>

      <input 
        ref={fileInputRef} 
        type="file" 
        multiple 
        onChange={handleFileSelect} 
        className="hidden" 
        accept=".txt,.md,.json,.yaml,.yml,.pdf,.doc,.docx,.csv" 
      />

      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
