import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge,
  Plus,
  Copy,
  Trash2,
  Star,
  StarOff,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  Shield,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArchitectureBranch {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  parentId: string | null;
  isMain: boolean;
  isFavorite: boolean;
  variant: 'cost-optimized' | 'balanced' | 'performance' | 'security-first';
  stats: {
    monthlyCost: number;
    securityScore: number;
    components: number;
  };
  changes: string[];
}

const INITIAL_BRANCHES: ArchitectureBranch[] = [
  {
    id: 'main',
    name: 'Main Architecture',
    description: 'Original balanced architecture with standard configuration',
    createdAt: new Date(Date.now() - 86400000 * 3),
    parentId: null,
    isMain: true,
    isFavorite: true,
    variant: 'balanced',
    stats: { monthlyCost: 4200, securityScore: 85, components: 12 },
    changes: []
  },
  {
    id: 'cost-opt',
    name: 'Cost Optimized',
    description: 'Reduced costs with spot instances and reserved capacity',
    createdAt: new Date(Date.now() - 86400000 * 2),
    parentId: 'main',
    isMain: false,
    isFavorite: false,
    variant: 'cost-optimized',
    stats: { monthlyCost: 2800, securityScore: 82, components: 10 },
    changes: ['Switched to spot instances', 'Added reserved capacity', 'Consolidated databases']
  },
  {
    id: 'security',
    name: 'Security Hardened',
    description: 'Enhanced security with WAF, private subnets, and encryption',
    createdAt: new Date(Date.now() - 86400000),
    parentId: 'main',
    isMain: false,
    isFavorite: true,
    variant: 'security-first',
    stats: { monthlyCost: 5100, securityScore: 98, components: 15 },
    changes: ['Added WAF', 'Moved to private subnets', 'Enabled encryption at rest', 'Added audit logging']
  },
  {
    id: 'perf',
    name: 'Performance Tuned',
    description: 'Optimized for high throughput with caching and CDN',
    createdAt: new Date(),
    parentId: 'main',
    isMain: false,
    isFavorite: false,
    variant: 'performance',
    stats: { monthlyCost: 6200, securityScore: 85, components: 18 },
    changes: ['Added Redis caching', 'Configured CDN', 'Upgraded instance types', 'Added read replicas']
  },
];

const VARIANT_STYLES = {
  'cost-optimized': { color: 'text-green-400', bg: 'bg-green-500/10', icon: DollarSign },
  'balanced': { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Zap },
  'performance': { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Zap },
  'security-first': { color: 'text-red-400', bg: 'bg-red-500/10', icon: Shield },
};

interface ArchitectureBranchingProps {
  onSelectBranch?: (branch: ArchitectureBranch) => void;
  onCreateBranch?: (parentId: string, name: string) => void;
}

export function ArchitectureBranching({ onSelectBranch, onCreateBranch }: ArchitectureBranchingProps) {
  const [branches, setBranches] = useState<ArchitectureBranch[]>(INITIAL_BRANCHES);
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [isCreating, setIsCreating] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareBranches, setCompareBranches] = useState<string[]>([]);

  const handleSelectBranch = (branch: ArchitectureBranch) => {
    if (compareMode) {
      setCompareBranches(prev => {
        if (prev.includes(branch.id)) {
          return prev.filter(id => id !== branch.id);
        }
        if (prev.length < 2) {
          return [...prev, branch.id];
        }
        return [prev[1], branch.id];
      });
    } else {
      setSelectedBranch(branch.id);
      onSelectBranch?.(branch);
    }
  };

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) return;

    const parent = branches.find(b => b.id === selectedBranch);
    if (!parent) return;

    const newBranch: ArchitectureBranch = {
      id: `branch-${Date.now()}`,
      name: newBranchName.trim(),
      description: `Branched from ${parent.name}`,
      createdAt: new Date(),
      parentId: parent.id,
      isMain: false,
      isFavorite: false,
      variant: parent.variant,
      stats: { ...parent.stats },
      changes: []
    };

    setBranches(prev => [...prev, newBranch]);
    setNewBranchName('');
    setIsCreating(false);
    setSelectedBranch(newBranch.id);
    onCreateBranch?.(parent.id, newBranchName);
  };

  const toggleFavorite = (branchId: string) => {
    setBranches(prev => prev.map(b => 
      b.id === branchId ? { ...b, isFavorite: !b.isFavorite } : b
    ));
  };

  const deleteBranch = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch || branch.isMain) return;
    setBranches(prev => prev.filter(b => b.id !== branchId));
    if (selectedBranch === branchId) {
      setSelectedBranch('main');
    }
  };

  const duplicateBranch = (branch: ArchitectureBranch) => {
    const newBranch: ArchitectureBranch = {
      ...branch,
      id: `branch-${Date.now()}`,
      name: `${branch.name} (Copy)`,
      createdAt: new Date(),
      isMain: false,
    };
    setBranches(prev => [...prev, newBranch]);
  };

  const mainBranch = branches.find(b => b.isMain);
  const childBranches = branches.filter(b => !b.isMain);
  const currentBranch = branches.find(b => b.id === selectedBranch);

  const getComparisonData = () => {
    if (compareBranches.length !== 2) return null;
    const [b1, b2] = compareBranches.map(id => branches.find(b => b.id === id)!);
    return { b1, b2 };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold">Architecture Branching</h3>
            <p className="text-xs text-muted-foreground">Explore multiple variants</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareBranches([]);
            }}
            className="gap-2"
          >
            <GitMerge className="w-4 h-4" />
            Compare
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Branch
          </Button>
        </div>
      </div>

      {/* Branch Tree Visualization */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            {/* Main Branch */}
            {mainBranch && (
              <div className="relative">
                <BranchCard
                  branch={mainBranch}
                  isSelected={selectedBranch === mainBranch.id || compareBranches.includes(mainBranch.id)}
                  isCompareMode={compareMode}
                  onSelect={() => handleSelectBranch(mainBranch)}
                  onToggleFavorite={() => toggleFavorite(mainBranch.id)}
                  onDuplicate={() => duplicateBranch(mainBranch)}
                />
                
                {/* Connection Line */}
                {childBranches.length > 0 && (
                  <div className="absolute left-6 top-full w-0.5 h-4 bg-border" />
                )}
              </div>
            )}

            {/* Child Branches */}
            {childBranches.length > 0 && (
              <div className="mt-4 ml-6 border-l-2 border-border pl-4 space-y-3">
                {childBranches.map((branch, index) => (
                  <div key={branch.id} className="relative">
                    {/* Horizontal connector */}
                    <div className="absolute -left-4 top-6 w-4 h-0.5 bg-border" />
                    
                    <BranchCard
                      branch={branch}
                      isSelected={selectedBranch === branch.id || compareBranches.includes(branch.id)}
                      isCompareMode={compareMode}
                      onSelect={() => handleSelectBranch(branch)}
                      onToggleFavorite={() => toggleFavorite(branch.id)}
                      onDelete={() => deleteBranch(branch.id)}
                      onDuplicate={() => duplicateBranch(branch)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create New Branch */}
      {isCreating && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Input
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="Enter branch name..."
                className="flex-1 bg-background"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateBranch();
                  if (e.key === 'Escape') setIsCreating(false);
                }}
              />
              <Button onClick={handleCreateBranch} disabled={!newBranchName.trim()}>
                <Check className="w-4 h-4" />
              </Button>
              <Button variant="ghost" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Creating branch from: <span className="text-foreground">{currentBranch?.name}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Comparison View */}
      {compareMode && compareBranches.length === 2 && (
        <ComparisonCard comparison={getComparisonData()!} />
      )}

      {/* Selected Branch Details */}
      {!compareMode && currentBranch && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <GitCommit className="w-4 h-4" />
              {currentBranch.name} Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="text-xs text-muted-foreground">Monthly Cost</div>
                <div className="text-lg font-semibold">${currentBranch.stats.monthlyCost.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="text-xs text-muted-foreground">Security Score</div>
                <div className="text-lg font-semibold">{currentBranch.stats.securityScore}/100</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="text-xs text-muted-foreground">Components</div>
                <div className="text-lg font-semibold">{currentBranch.stats.components}</div>
              </div>
            </div>

            {currentBranch.changes.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">Changes from parent:</div>
                <div className="space-y-1">
                  {currentBranch.changes.map((change, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <ChevronRight className="w-3 h-3 text-primary" />
                      {change}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface BranchCardProps {
  branch: ArchitectureBranch;
  isSelected: boolean;
  isCompareMode: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onDelete?: () => void;
  onDuplicate: () => void;
}

function BranchCard({ 
  branch, 
  isSelected, 
  isCompareMode,
  onSelect, 
  onToggleFavorite, 
  onDelete, 
  onDuplicate 
}: BranchCardProps) {
  const style = VARIANT_STYLES[branch.variant];
  const Icon = style.icon;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all group",
        isSelected 
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" 
          : "border-border bg-card hover:border-primary/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md", style.bg)}>
              <Icon className={cn("w-3.5 h-3.5", style.color)} />
            </div>
            <span className="font-medium text-sm truncate">{branch.name}</span>
            {branch.isMain && (
              <Badge variant="secondary" className="text-[10px] py-0">main</Badge>
            )}
            {branch.isFavorite && (
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">{branch.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              ${branch.stats.monthlyCost.toLocaleString()}/mo
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {branch.stats.securityScore}/100
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(branch.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          >
            {branch.isFavorite ? (
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            ) : (
              <StarOff className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          {onDelete && !branch.isMain && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ComparisonCard({ comparison }: { comparison: { b1: ArchitectureBranch; b2: ArchitectureBranch } }) {
  const { b1, b2 } = comparison;
  const costDiff = b2.stats.monthlyCost - b1.stats.monthlyCost;
  const securityDiff = b2.stats.securityScore - b1.stats.securityScore;

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitMerge className="w-4 h-4" />
          Comparing: {b1.name} vs {b2.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div>
              <div className="text-xs text-muted-foreground">Monthly Cost</div>
              <div className="font-medium">${b1.stats.monthlyCost.toLocaleString()}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="text-right">
              <div className="text-xs text-muted-foreground">&nbsp;</div>
              <div className="font-medium">${b2.stats.monthlyCost.toLocaleString()}</div>
            </div>
            <Badge className={cn(
              "ml-2",
              costDiff > 0 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
            )}>
              {costDiff > 0 ? '+' : ''}{costDiff.toLocaleString()}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div>
              <div className="text-xs text-muted-foreground">Security Score</div>
              <div className="font-medium">{b1.stats.securityScore}/100</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="text-right">
              <div className="text-xs text-muted-foreground">&nbsp;</div>
              <div className="font-medium">{b2.stats.securityScore}/100</div>
            </div>
            <Badge className={cn(
              "ml-2",
              securityDiff >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            )}>
              {securityDiff > 0 ? '+' : ''}{securityDiff}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div>
              <div className="text-xs text-muted-foreground">Components</div>
              <div className="font-medium">{b1.stats.components}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="text-right">
              <div className="text-xs text-muted-foreground">&nbsp;</div>
              <div className="font-medium">{b2.stats.components}</div>
            </div>
            <Badge variant="secondary" className="ml-2">
              {b2.stats.components - b1.stats.components > 0 ? '+' : ''}
              {b2.stats.components - b1.stats.components}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
