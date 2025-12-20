import { Cloud, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface AppHeaderProps {
  onReset: () => void;
  hasResults: boolean;
  showExport?: boolean;
  exportComponent?: ReactNode;
}

export const AppHeader = ({ onReset, hasResults, showExport, exportComponent }: AppHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={onReset} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
            <Cloud className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold text-foreground">SolsArch</h1>
            <p className="text-xs text-muted-foreground">AI Solutions Architect</p>
          </div>
        </button>

        <div className="flex items-center gap-3">
          {showExport && exportComponent}
          
          {hasResults && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onReset}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              New Design
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
