import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  X, 
  FileText, 
  Loader2,
  FolderTree,
  AtSign,
  FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { CodeFile } from '@/hooks/useCodebaseContext';

interface EnhancedChatInputProps {
  onSend: (message: string, files?: File[], codeContext?: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  codebaseFiles: CodeFile[];
  selectedCodeFiles: string[];
  hasCodebaseContext: boolean;
  onOpenCodebase: () => void;
  onToggleCodeFile: (path: string) => void;
}

export function EnhancedChatInput({ 
  onSend, 
  isLoading = false, 
  placeholder,
  codebaseFiles,
  selectedCodeFiles,
  hasCodebaseContext,
  onOpenCodebase,
  onToggleCodeFile
}: EnhancedChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    setMessage(prev => prev + transcript);
  }, []);

  const { isListening, isSupported, toggleListening, transcript } = useVoiceInput({
    onFinalTranscript: handleVoiceTranscript,
    continuous: true
  });

  // Filter files for @mention autocomplete
  const filteredFiles = codebaseFiles.filter(file => 
    file.path.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    file.name.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 8);

  // Handle @mention detection
  useEffect(() => {
    const lastAtIndex = message.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === message.length - 1) {
      setShowMentions(true);
      setMentionQuery('');
      setMentionIndex(0);
    } else if (lastAtIndex !== -1) {
      const afterAt = message.slice(lastAtIndex + 1);
      if (!afterAt.includes(' ') && afterAt.length <= 50) {
        setShowMentions(true);
        setMentionQuery(afterAt);
        setMentionIndex(0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  }, [message]);

  const insertMention = (file: CodeFile) => {
    const lastAtIndex = message.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const newMessage = message.slice(0, lastAtIndex) + `@${file.path} `;
      setMessage(newMessage);
      onToggleCodeFile(file.path);
    }
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const handleSend = () => {
    if (!message.trim() && files.length === 0) return;
    onSend(message.trim(), files.length > 0 ? files : undefined);
    setMessage('');
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredFiles.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => Math.min(prev + 1, filteredFiles.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredFiles[mentionIndex]);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
      return;
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
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

        {/* Selected Code Files */}
        {selectedCodeFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FileCode className="w-3 h-3" />
              Context:
            </span>
            {selectedCodeFiles.slice(0, 3).map((path) => (
              <Badge 
                key={path} 
                variant="outline" 
                className="flex items-center gap-1.5 py-1 px-2 bg-primary/5 border-primary/20"
              >
                <span className="text-xs truncate max-w-[100px]">
                  {path.split('/').pop()}
                </span>
                <button 
                  onClick={() => onToggleCodeFile(path)} 
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {selectedCodeFiles.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{selectedCodeFiles.length - 3} more
              </Badge>
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

        {/* Input Container */}
        <div className={cn(
          "relative rounded-2xl border transition-all duration-200",
          isFocused 
            ? "border-primary/50 bg-secondary/30 shadow-lg shadow-primary/5" 
            : "border-border bg-secondary/20 hover:border-border/80"
        )}>
          {/* @Mention Autocomplete */}
          {showMentions && hasCodebaseContext && filteredFiles.length > 0 && (
            <div 
              ref={mentionsRef}
              className="absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50"
            >
              <div className="p-2 border-b border-border bg-secondary/30">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <AtSign className="w-3 h-3" />
                  Reference a file
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredFiles.map((file, index) => (
                  <button
                    key={file.path}
                    onClick={() => insertMention(file)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-left text-sm",
                      "hover:bg-accent transition-colors",
                      index === mentionIndex && "bg-accent"
                    )}
                  >
                    <FileCode className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end gap-2 p-2">
            {/* Left Actions */}
            <div className="flex items-center gap-1 pb-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary",
                        hasCodebaseContext && "text-primary"
                      )}
                      onClick={onOpenCodebase} 
                      disabled={isLoading}
                    >
                      <FolderTree className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {hasCodebaseContext ? 'Manage codebase context' : 'Add codebase context'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
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
              placeholder={placeholder || (hasCodebaseContext 
                ? "Ask about your codebase... Use @filename to reference files"
                : "Describe what you want to build..."
              )}
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
          {hasCodebaseContext 
            ? "Type @ to reference files • SolsArch can analyze your codebase and suggest architectures"
            : "SolsArch can make mistakes. Consider checking important information."
          }
        </p>
      </div>

      <input 
        ref={fileInputRef} 
        type="file" 
        multiple 
        onChange={handleFileSelect} 
        className="hidden" 
        accept=".txt,.md,.json,.yaml,.yml,.pdf,.doc,.docx,.csv,.ts,.tsx,.js,.jsx,.py,.go,.rs,.java"
      />
    </div>
  );
}
