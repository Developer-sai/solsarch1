import { useState, useRef } from 'react';
import { 
  FolderTree, 
  File, 
  FileCode, 
  FileJson, 
  FileText,
  ChevronRight,
  ChevronDown,
  X,
  Upload,
  Github,
  Link,
  Check,
  Loader2,
  Search,
  FolderOpen,
  RefreshCw,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { CodeFile, RepoInfo } from '@/hooks/useCodebaseContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CodebasePanelProps {
  repo: RepoInfo | null;
  files: CodeFile[];
  selectedFiles: string[];
  isLoading: boolean;
  error: string | null;
  onFetchRepo: (url: string) => void;
  onUploadFiles: (files: File[]) => void;
  onToggleFile: (path: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onClear: () => void;
  onClose: () => void;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  typescript: <FileCode className="w-4 h-4 text-blue-400" />,
  javascript: <FileCode className="w-4 h-4 text-yellow-400" />,
  python: <FileCode className="w-4 h-4 text-green-400" />,
  json: <FileJson className="w-4 h-4 text-orange-400" />,
  markdown: <FileText className="w-4 h-4 text-muted-foreground" />,
  default: <File className="w-4 h-4 text-muted-foreground" />,
};

function getFileIcon(language: string) {
  return FILE_ICONS[language] || FILE_ICONS.default;
}

interface FileTreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: FileTreeNode[];
  file?: CodeFile;
}

function buildFileTree(files: CodeFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  
  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join('/');
      
      let node = current.find(n => n.name === part);
      
      if (!node) {
        node = {
          name: part,
          path,
          isFolder: !isLast,
          children: [],
          file: isLast ? file : undefined,
        };
        current.push(node);
      }
      
      if (!isLast) {
        current = node.children;
      }
    }
  }
  
  // Sort: folders first, then alphabetically
  const sortNodes = (nodes: FileTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(n => sortNodes(n.children));
  };
  
  sortNodes(root);
  return root;
}

interface FileTreeItemProps {
  node: FileTreeNode;
  depth: number;
  selectedFiles: string[];
  onToggle: (path: string) => void;
  searchQuery: string;
}

function FileTreeItem({ node, depth, selectedFiles, onToggle, searchQuery }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  
  const matchesSearch = searchQuery 
    ? node.name.toLowerCase().includes(searchQuery.toLowerCase())
    : true;
  
  const hasMatchingChildren = node.children.some(child => 
    child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    child.children.length > 0
  );
  
  if (searchQuery && !matchesSearch && !hasMatchingChildren && !node.isFolder) {
    return null;
  }
  
  if (node.isFolder) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left",
            "hover:bg-accent/50 rounded-md transition-colors",
            "text-muted-foreground hover:text-foreground"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          )}
          <FolderOpen className="w-4 h-4 flex-shrink-0 text-blue-400" />
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen && (
          <div>
            {node.children.map(child => (
              <FileTreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedFiles={selectedFiles}
                onToggle={onToggle}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  const isSelected = selectedFiles.includes(node.path);
  
  return (
    <button
      onClick={() => onToggle(node.path)}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left",
        "hover:bg-accent/50 rounded-md transition-colors group",
        isSelected && "bg-primary/10 text-primary"
      )}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <Checkbox
        checked={isSelected}
        className="w-4 h-4 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={() => onToggle(node.path)}
      />
      {getFileIcon(node.file?.language || 'default')}
      <span className="truncate flex-1">{node.name}</span>
      {node.file && (
        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">
          {(node.file.size / 1024).toFixed(1)}KB
        </span>
      )}
    </button>
  );
}

export function CodebasePanel({
  repo,
  files,
  selectedFiles,
  isLoading,
  error,
  onFetchRepo,
  onUploadFiles,
  onToggleFile,
  onSelectAll,
  onClearSelection,
  onClear,
  onClose,
}: CodebasePanelProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const fileTree = buildFileTree(files);
  
  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onFetchRepo(repoUrl.trim());
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onUploadFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">Codebase Context</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      {!repo && !isLoading ? (
        <div className="flex-1 p-4">
          <Tabs defaultValue="github" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="github" className="gap-2">
                <Github className="w-4 h-4" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="github" className="space-y-4">
              <div className="text-center space-y-2 py-4">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Link className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="font-medium">Analyze GitHub Repository</h4>
                <p className="text-sm text-muted-foreground">
                  Paste a public GitHub URL to analyze the codebase
                </p>
              </div>
              
              <form onSubmit={handleSubmitUrl} className="space-y-3">
                <Input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="bg-secondary/30"
                />
                <Button type="submit" className="w-full gap-2" disabled={!repoUrl.trim()}>
                  <Github className="w-4 h-4" />
                  Fetch Repository
                </Button>
              </form>
              
              <div className="text-xs text-muted-foreground text-center">
                Supports public repositories only
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="text-center space-y-2 py-4">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="font-medium">Upload Files</h4>
                <p className="text-sm text-muted-foreground">
                  Upload code files or project folders for analysis
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full gap-2 border-dashed h-20"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Click to upload</div>
                  <div className="text-xs text-muted-foreground">
                    .ts, .js, .py, .json, .md, etc.
                  </div>
                </div>
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".ts,.tsx,.js,.jsx,.py,.rb,.go,.rs,.java,.kt,.swift,.cs,.cpp,.c,.h,.md,.json,.yaml,.yml,.toml,.sql,.html,.css,.scss,.vue,.svelte,.php,.sh,.dockerfile,.tf,.prisma,.graphql,.proto"
              />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Fetching repository...</p>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="p-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-destructive mx-auto" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={onClear}>
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {/* Repository Info */}
          {repo && !isLoading && !error && (
            <>
              <div className="p-3 border-b border-border bg-secondary/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {repo.source === 'github' && <Github className="w-4 h-4 flex-shrink-0" />}
                      {repo.source === 'upload' && <Upload className="w-4 h-4 flex-shrink-0" />}
                      <span className="font-medium text-sm truncate">{repo.name}</span>
                    </div>
                    {repo.owner !== 'local' && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {repo.owner}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {repo.url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => window.open(repo.url, '_blank')}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={onClear}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {files.length} files
                  </Badge>
                  {selectedFiles.length > 0 && (
                    <Badge variant="default" className="text-xs">
                      {selectedFiles.length} selected
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Search & Actions */}
              <div className="p-2 border-b border-border space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter files..."
                    className="pl-8 h-8 bg-secondary/30"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSelectAll}
                    className="h-7 text-xs flex-1"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearSelection}
                    className="h-7 text-xs flex-1"
                    disabled={selectedFiles.length === 0}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
              
              {/* File Tree */}
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {fileTree.map(node => (
                    <FileTreeItem
                      key={node.path}
                      node={node}
                      depth={0}
                      selectedFiles={selectedFiles}
                      onToggle={onToggleFile}
                      searchQuery={searchQuery}
                    />
                  ))}
                </div>
              </ScrollArea>
              
              {/* Selected Files Hint */}
              {selectedFiles.length > 0 && (
                <div className="p-3 border-t border-border bg-primary/5">
                  <p className="text-xs text-center text-muted-foreground">
                    <span className="text-primary font-medium">{selectedFiles.length} files</span> will be included as context when you send a message
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
