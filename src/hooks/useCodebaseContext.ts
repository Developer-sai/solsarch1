import { useState, useCallback } from 'react';

export interface CodeFile {
  path: string;
  name: string;
  content: string;
  language: string;
  size: number;
}

export interface RepoInfo {
  name: string;
  owner: string;
  description?: string;
  defaultBranch: string;
  url: string;
  source: 'github' | 'upload' | 'url';
}

export interface CodebaseContext {
  repo: RepoInfo | null;
  files: CodeFile[];
  selectedFiles: string[];
  isLoading: boolean;
  error: string | null;
}

const LANGUAGE_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  kt: 'kotlin',
  swift: 'swift',
  cs: 'csharp',
  cpp: 'cpp',
  c: 'c',
  h: 'c',
  hpp: 'cpp',
  md: 'markdown',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  sql: 'sql',
  html: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',
  vue: 'vue',
  svelte: 'svelte',
  php: 'php',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  dockerfile: 'dockerfile',
  makefile: 'makefile',
  tf: 'terraform',
  prisma: 'prisma',
};

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const name = filename.toLowerCase();
  
  if (name === 'dockerfile') return 'dockerfile';
  if (name === 'makefile') return 'makefile';
  if (name.endsWith('.d.ts')) return 'typescript';
  
  return LANGUAGE_MAP[ext] || 'text';
}

export function useCodebaseContext() {
  const [context, setContext] = useState<CodebaseContext>({
    repo: null,
    files: [],
    selectedFiles: [],
    isLoading: false,
    error: null,
  });

  const parseGitHubUrl = (url: string): { owner: string; repo: string; branch?: string } | null => {
    try {
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes('github.com')) return null;
      
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts.length < 2) return null;
      
      const [owner, repo] = parts;
      let branch: string | undefined;
      
      if (parts[2] === 'tree' && parts[3]) {
        branch = parts[3];
      }
      
      return { owner, repo: repo.replace('.git', ''), branch };
    } catch {
      return null;
    }
  };

  const fetchGitHubRepo = useCallback(async (url: string) => {
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setContext(prev => ({ ...prev, error: 'Invalid GitHub URL' }));
      return;
    }

    setContext(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch repo info
      const repoRes = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);
      if (!repoRes.ok) throw new Error('Repository not found or is private');
      const repoData = await repoRes.json();

      const branch = parsed.branch || repoData.default_branch;

      // Fetch file tree
      const treeRes = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${branch}?recursive=1`
      );
      if (!treeRes.ok) throw new Error('Failed to fetch repository tree');
      const treeData = await treeRes.json();

      // Filter to only code files (skip large files, binaries, etc.)
      const codeExtensions = new Set([
        'ts', 'tsx', 'js', 'jsx', 'py', 'rb', 'go', 'rs', 'java', 'kt', 'swift',
        'cs', 'cpp', 'c', 'h', 'hpp', 'md', 'json', 'yaml', 'yml', 'toml', 'sql',
        'html', 'css', 'scss', 'less', 'vue', 'svelte', 'php', 'sh', 'bash',
        'dockerfile', 'makefile', 'tf', 'prisma', 'graphql', 'proto'
      ]);

      const codeFiles = treeData.tree
        .filter((item: any) => {
          if (item.type !== 'blob') return false;
          if (item.size > 100000) return false; // Skip files > 100KB
          
          const path = item.path.toLowerCase();
          if (path.includes('node_modules/')) return false;
          if (path.includes('vendor/')) return false;
          if (path.includes('.git/')) return false;
          if (path.includes('dist/')) return false;
          if (path.includes('build/')) return false;
          if (path.includes('.next/')) return false;
          if (path.endsWith('.lock')) return false;
          if (path.endsWith('.min.js')) return false;
          if (path.endsWith('.min.css')) return false;
          
          const ext = item.path.split('.').pop()?.toLowerCase() || '';
          const name = item.path.split('/').pop()?.toLowerCase() || '';
          
          return codeExtensions.has(ext) || 
                 name === 'dockerfile' || 
                 name === 'makefile' ||
                 name.startsWith('.');
        })
        .slice(0, 200); // Limit to 200 files

      // Fetch content for top files (README, main config files)
      const importantFiles = ['readme.md', 'package.json', 'requirements.txt', 'cargo.toml', 'go.mod', 'pyproject.toml'];
      const files: CodeFile[] = [];

      for (const file of codeFiles) {
        const fileName = file.path.split('/').pop()?.toLowerCase() || '';
        const isImportant = importantFiles.includes(fileName) || file.path.split('/').length <= 2;
        
        if (isImportant && files.length < 20) {
          try {
            const contentRes = await fetch(
              `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${file.path}?ref=${branch}`
            );
            if (contentRes.ok) {
              const contentData = await contentRes.json();
              if (contentData.encoding === 'base64') {
                files.push({
                  path: file.path,
                  name: file.path.split('/').pop() || file.path,
                  content: atob(contentData.content),
                  language: getLanguage(file.path),
                  size: file.size,
                });
              }
            }
          } catch {
            // Skip files that fail to fetch
          }
        } else {
          files.push({
            path: file.path,
            name: file.path.split('/').pop() || file.path,
            content: '', // Content fetched on demand
            language: getLanguage(file.path),
            size: file.size,
          });
        }
      }

      setContext({
        repo: {
          name: repoData.name,
          owner: repoData.owner.login,
          description: repoData.description,
          defaultBranch: branch,
          url: repoData.html_url,
          source: 'github',
        },
        files,
        selectedFiles: [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setContext(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch repository',
      }));
    }
  }, []);

  const addFilesFromUpload = useCallback(async (uploadedFiles: File[]) => {
    setContext(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const files: CodeFile[] = [];
      
      for (const file of uploadedFiles) {
        try {
          const content = await file.text();
          files.push({
            path: file.name,
            name: file.name,
            content,
            language: getLanguage(file.name),
            size: file.size,
          });
        } catch {
          // Skip files that fail to read
        }
      }

      setContext(prev => ({
        repo: prev.repo || {
          name: 'Uploaded Files',
          owner: 'local',
          description: 'Files uploaded for analysis',
          defaultBranch: 'main',
          url: '',
          source: 'upload',
        },
        files: [...prev.files, ...files],
        selectedFiles: prev.selectedFiles,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setContext(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to process uploaded files',
      }));
    }
  }, []);

  const fetchFileContent = useCallback(async (filePath: string): Promise<string> => {
    const file = context.files.find(f => f.path === filePath);
    if (!file) return '';
    if (file.content) return file.content;
    
    if (!context.repo || context.repo.source !== 'github') return '';

    try {
      const contentRes = await fetch(
        `https://api.github.com/repos/${context.repo.owner}/${context.repo.name}/contents/${filePath}?ref=${context.repo.defaultBranch}`
      );
      if (!contentRes.ok) return '';
      
      const contentData = await contentRes.json();
      if (contentData.encoding === 'base64') {
        const content = atob(contentData.content);
        
        // Update the file in context
        setContext(prev => ({
          ...prev,
          files: prev.files.map(f => 
            f.path === filePath ? { ...f, content } : f
          ),
        }));
        
        return content;
      }
    } catch {
      return '';
    }
    
    return '';
  }, [context.repo, context.files]);

  const toggleFileSelection = useCallback((filePath: string) => {
    setContext(prev => ({
      ...prev,
      selectedFiles: prev.selectedFiles.includes(filePath)
        ? prev.selectedFiles.filter(p => p !== filePath)
        : [...prev.selectedFiles, filePath],
    }));
  }, []);

  const selectAllFiles = useCallback(() => {
    setContext(prev => ({
      ...prev,
      selectedFiles: prev.files.map(f => f.path),
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setContext(prev => ({
      ...prev,
      selectedFiles: [],
    }));
  }, []);

  const clearContext = useCallback(() => {
    setContext({
      repo: null,
      files: [],
      selectedFiles: [],
      isLoading: false,
      error: null,
    });
  }, []);

  const getSelectedFilesContent = useCallback(async (): Promise<string> => {
    const contents: string[] = [];
    
    for (const filePath of context.selectedFiles) {
      let content = context.files.find(f => f.path === filePath)?.content;
      if (!content) {
        content = await fetchFileContent(filePath);
      }
      if (content) {
        contents.push(`--- File: ${filePath} ---\n${content}\n--- End of ${filePath} ---`);
      }
    }
    
    return contents.join('\n\n');
  }, [context.selectedFiles, context.files, fetchFileContent]);

  return {
    context,
    fetchGitHubRepo,
    addFilesFromUpload,
    fetchFileContent,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    clearContext,
    getSelectedFilesContent,
  };
}
