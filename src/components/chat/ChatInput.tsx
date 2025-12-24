import React, { useState, useRef, useCallback } from 'react';
import { Send, Mic, MicOff, Paperclip, X, FileText, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  onGenerate?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  canGenerate?: boolean;
}

export const ChatInput = ({ 
  onSend, 
  onGenerate,
  isLoading = false, 
  placeholder = "Describe your architecture requirements...",
  canGenerate = false
}: ChatInputProps) => {
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

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const fileItems = items.filter(item => item.kind === 'file');
    
    for (const item of fileItems) {
      const file = item.getAsFile();
      if (file) {
        setFiles(prev => [...prev, file]);
      }
    }
  };

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-xl">
      {isListening && (
        <div className="px-4 sm:px-6 py-3 bg-primary/10 border-b border-primary/20 flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-destructive rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-sm text-primary font-medium">Listening...</span>
          {transcript && (
            <span className="text-sm text-muted-foreground truncate">{transcript}</span>
          )}
        </div>
      )}

      {files.length > 0 && (
        <div className="px-4 sm:px-6 py-3 border-b border-border flex flex-wrap gap-2">
          {files.map((file, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-2 py-1.5 px-3">
              <FileText className="w-3 h-3" />
              <span className="text-xs truncate max-w-[120px] sm:max-w-[150px]">{file.name}</span>
              <button onClick={() => removeFile(index)} className="ml-1 hover:text-destructive transition-colors">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={placeholder}
              disabled={isLoading}
              className={cn(
                "min-h-[60px] max-h-[200px] resize-none pr-20 sm:pr-24 bg-secondary/50 text-sm sm:text-base",
                "border-border/50 focus:border-primary/50",
                "placeholder:text-muted-foreground/60"
              )}
              rows={1}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach files</TooltipContent>
                </Tooltip>

                {isSupported && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className={cn("h-7 w-7 sm:h-8 sm:w-8", isListening ? "text-destructive hover:text-destructive bg-destructive/10" : "text-muted-foreground hover:text-foreground")} onClick={toggleListening} disabled={isLoading}>
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isListening ? 'Stop listening' : 'Voice input'}</TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end sm:justify-start">
            {canGenerate && (
              <Button onClick={onGenerate} disabled={isLoading} variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span className="hidden sm:inline">Generate</span>
              </Button>
            )}
            
            <Button onClick={handleSend} disabled={isLoading || (!message.trim() && files.length === 0)} size="sm" className="gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept=".txt,.md,.json,.yaml,.yml,.pdf,.doc,.docx,.csv" />

        <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 text-center hidden sm:block">
          Press Enter to send, Shift+Enter for new line. Attach files or use voice.
        </p>
      </div>
    </div>
  );
};
