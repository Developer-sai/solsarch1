import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    History,
    Save,
    GitCompare,
    RotateCcw,
    Trash2,
    Clock,
    Plus,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { ArchitectureResult } from '@/types/architecture';
import { useToast } from '@/hooks/use-toast';
import {
    ArchitectureVersion,
    getVersionHistory,
    saveArchitectureVersion,
    compareVersions,
    deleteVersion,
    type VersionDiff
} from '@/lib/versionService';

interface VersionHistoryPanelProps {
    architectureId?: string;
    result: ArchitectureResult;
    selectedVariant: number;
    onRestore?: (version: ArchitectureVersion) => void;
}

export function VersionHistoryPanel({
    architectureId,
    result,
    selectedVariant,
    onRestore
}: VersionHistoryPanelProps) {
    const { toast } = useToast();
    const [versions, setVersions] = useState<ArchitectureVersion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newVersionName, setNewVersionName] = useState('');
    const [changeSummary, setChangeSummary] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [selectedVersions, setSelectedVersions] = useState<[string | null, string | null]>([null, null]);
    const [diff, setDiff] = useState<VersionDiff | null>(null);
    const [showDiffDialog, setShowDiffDialog] = useState(false);

    // Load version history
    useEffect(() => {
        if (architectureId) {
            loadVersions();
        }
    }, [architectureId]);

    const loadVersions = async () => {
        if (!architectureId) return;

        setIsLoading(true);
        try {
            const history = await getVersionHistory(architectureId);
            setVersions(history);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load version history',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveVersion = async () => {
        if (!architectureId || !newVersionName.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a version name',
                variant: 'destructive'
            });
            return;
        }

        setIsSaving(true);
        try {
            const version = await saveArchitectureVersion(
                architectureId,
                result,
                selectedVariant,
                newVersionName.trim(),
                changeSummary.trim() || undefined
            );

            if (version) {
                setVersions(prev => [version, ...prev]);
                setNewVersionName('');
                setChangeSummary('');
                setShowSaveDialog(false);

                toast({
                    title: 'Version Saved',
                    description: `Version "${version.name}" created successfully`
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to save version',
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCompare = () => {
        const [v1Id, v2Id] = selectedVersions;
        if (!v1Id || !v2Id) {
            toast({
                title: 'Select Versions',
                description: 'Please select two versions to compare',
                variant: 'destructive'
            });
            return;
        }

        const v1 = versions.find(v => v.id === v1Id);
        const v2 = versions.find(v => v.id === v2Id);

        if (v1 && v2) {
            const versionDiff = compareVersions(v1, v2);
            setDiff(versionDiff);
            setShowDiffDialog(true);
        }
    };

    const handleRestore = (version: ArchitectureVersion) => {
        if (onRestore) {
            onRestore(version);
            toast({
                title: 'Version Restored',
                description: `Restored to "${version.name}"`
            });
        }
    };

    const handleDelete = async (versionId: string) => {
        const success = await deleteVersion(versionId);
        if (success) {
            setVersions(prev => prev.filter(v => v.id !== versionId));
            toast({
                title: 'Version Deleted',
                description: 'Version has been removed'
            });
        } else {
            toast({
                title: 'Error',
                description: 'Failed to delete version',
                variant: 'destructive'
            });
        }
    };

    const toggleVersionSelection = (versionId: string) => {
        setSelectedVersions(prev => {
            if (prev[0] === versionId) {
                return [prev[1], null];
            } else if (prev[1] === versionId) {
                return [prev[0], null];
            } else if (!prev[0]) {
                return [versionId, prev[1]];
            } else if (!prev[1]) {
                return [prev[0], versionId];
            } else {
                return [versionId, prev[0]];
            }
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!architectureId) {
        return (
            <Card className="border-border bg-card/50">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Version History
                    </CardTitle>
                    <CardDescription>
                        Save this architecture to enable version tracking
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Version control is available after saving your architecture to a project.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border bg-card/50">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            Version History
                        </CardTitle>
                        <CardDescription>
                            Track changes and restore previous versions
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedVersions[0] && selectedVersions[1] && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={handleCompare}
                            >
                                <GitCompare className="w-3 h-3" />
                                Compare
                            </Button>
                        )}
                        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-1">
                                    <Plus className="w-3 h-3" />
                                    Save Version
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Save New Version</DialogTitle>
                                    <DialogDescription>
                                        Create a snapshot of the current architecture state
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="version-name">Version Name</Label>
                                        <Input
                                            id="version-name"
                                            placeholder="e.g., v1.0 - Initial design"
                                            value={newVersionName}
                                            onChange={(e) => setNewVersionName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="change-summary">Change Summary (Optional)</Label>
                                        <Input
                                            id="change-summary"
                                            placeholder="Brief description of changes..."
                                            value={changeSummary}
                                            onChange={(e) => setChangeSummary(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSaveVersion} disabled={isSaving}>
                                        {isSaving ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Save Version
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : versions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No versions saved yet</p>
                        <p className="text-sm">Save a version to start tracking changes</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                            {versions.map((version, index) => (
                                <div
                                    key={version.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${selectedVersions.includes(version.id)
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-muted-foreground'
                                        }`}
                                    onClick={() => toggleVersionSelection(version.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{version.name}</span>
                                                {index === 0 && (
                                                    <Badge variant="secondary" className="text-xs">Latest</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(version.created_at)}
                                            </div>
                                            {version.change_summary && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {version.change_summary}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRestore(version);
                                            }}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Version</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete "{version.name}"? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive text-destructive-foreground"
                                                        onClick={() => handleDelete(version.id)}
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}

                {/* Diff Dialog */}
                <Dialog open={showDiffDialog} onOpenChange={setShowDiffDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Version Comparison</DialogTitle>
                            <DialogDescription>
                                {diff?.summary}
                            </DialogDescription>
                        </DialogHeader>
                        {diff && (
                            <div className="space-y-4 py-4">
                                {diff.added.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-success mb-2">Added</h4>
                                        <ul className="space-y-1">
                                            {diff.added.map((item, i) => (
                                                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Plus className="w-3 h-3 text-success" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {diff.removed.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-destructive mb-2">Removed</h4>
                                        <ul className="space-y-1">
                                            {diff.removed.map((item, i) => (
                                                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Trash2 className="w-3 h-3 text-destructive" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {diff.modified.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-warning mb-2">Modified</h4>
                                        <ul className="space-y-1">
                                            {diff.modified.map((item, i) => (
                                                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <ChevronRight className="w-3 h-3 text-warning" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0 && (
                                    <p className="text-center text-muted-foreground py-4">
                                        No significant differences found
                                    </p>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={() => setShowDiffDialog(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
