import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
    Search,
    Filter,
    Cpu,
    Database,
    HardDrive,
    Zap,
    Server,
    Cloud,
    DollarSign,
    MemoryStick,
    Loader2,
    ArrowUpDown,
    Check,
    X
} from 'lucide-react';
import {
    SKU,
    Provider,
    ServiceCategory,
    SKUFilters,
    getProviders,
    getServiceCategories,
    searchSKUs,
    formatPrice,
    calculateCostPerTflop
} from '@/lib/skuService';

interface SKUBrowserProps {
    onSelectSKU?: (sku: SKU) => void;
    selectedSKUs?: string[];
    showCompareMode?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    compute: <Cpu className="w-4 h-4" />,
    database: <Database className="w-4 h-4" />,
    storage: <HardDrive className="w-4 h-4" />,
    cache: <Zap className="w-4 h-4" />,
    gpu: <Server className="w-4 h-4" />,
    container: <Cloud className="w-4 h-4" />,
    serverless: <Cloud className="w-4 h-4" />,
    networking: <Cloud className="w-4 h-4" />,
    queue: <Server className="w-4 h-4" />,
    analytics: <Database className="w-4 h-4" />
};

const PROVIDER_COLORS: Record<string, string> = {
    aws: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    azure: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    gcp: 'bg-red-500/10 text-red-500 border-red-500/20',
    oci: 'bg-red-700/10 text-red-700 border-red-700/20'
};

export function SKUBrowser({ onSelectSKU, selectedSKUs = [], showCompareMode = false }: SKUBrowserProps) {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [skus, setSKUs] = useState<SKU[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProvider, setSelectedProvider] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'price' | 'vcpu' | 'memory'>('price');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Advanced filters
    const [filters, setFilters] = useState<SKUFilters>({});
    const [compareList, setCompareList] = useState<string[]>([]);

    // Load initial data
    useEffect(() => {
        loadInitialData();
    }, []);

    // Load SKUs when filters change
    useEffect(() => {
        loadSKUs();
    }, [selectedProvider, selectedCategory, searchQuery, filters]);

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const [providersData, categoriesData] = await Promise.all([
                getProviders(),
                getServiceCategories()
            ]);
            setProviders(providersData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSKUs = async () => {
        setIsLoading(true);
        try {
            const searchFilters: SKUFilters = {
                ...filters,
                provider: selectedProvider !== 'all' ? selectedProvider : undefined,
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                searchQuery: searchQuery || undefined
            };

            const data = await searchSKUs(searchFilters);
            setSKUs(data);
        } catch (error) {
            console.error('Error loading SKUs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Sort SKUs
    const sortedSKUs = useMemo(() => {
        return [...skus].sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'price':
                    comparison = a.price_per_hour - b.price_per_hour;
                    break;
                case 'vcpu':
                    comparison = (a.vcpu || 0) - (b.vcpu || 0);
                    break;
                case 'memory':
                    comparison = (a.memory_gb || 0) - (b.memory_gb || 0);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [skus, sortBy, sortOrder]);

    const toggleCompare = (skuId: string) => {
        setCompareList(prev =>
            prev.includes(skuId)
                ? prev.filter(id => id !== skuId)
                : [...prev, skuId].slice(0, 4) // Max 4 items
        );
    };

    const getProviderName = (providerId: string) => {
        return providers.find(p => p.id === providerId)?.name || 'unknown';
    };

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.display_name || 'Unknown';
    };

    const toggleSort = (field: 'price' | 'vcpu' | 'memory') => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    if (isLoading && providers.length === 0) {
        return (
            <Card className="border-border bg-card/50">
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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
                            <DollarSign className="w-5 h-5 text-primary" />
                            Cloud SKU Browser
                        </CardTitle>
                        <CardDescription>
                            Compare pricing across {providers.length} cloud providers
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {compareList.length > 0 && (
                            <Badge variant="secondary">
                                {compareList.length} selected for comparison
                            </Badge>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4 mr-1" />
                            Filters
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Provider Tabs */}
                <Tabs value={selectedProvider} onValueChange={setSelectedProvider}>
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="all">All</TabsTrigger>
                        {providers.map(provider => (
                            <TabsTrigger key={provider.id} value={provider.id}>
                                {provider.display_name.split(' ')[0]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {/* Search and Category Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search SKUs (e.g., t3.medium, V100, postgres)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                    <div className="flex items-center gap-2">
                                        {CATEGORY_ICONS[category.name] || <Cloud className="w-4 h-4" />}
                                        {category.display_name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <Card className="border-dashed">
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Min vCPU</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.minVcpu || ''}
                                        onChange={(e) => setFilters(prev => ({ ...prev, minVcpu: e.target.value ? parseInt(e.target.value) : undefined }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Min Memory (GB)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.minMemory || ''}
                                        onChange={(e) => setFilters(prev => ({ ...prev, minMemory: e.target.value ? parseInt(e.target.value) : undefined }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Price ($/hr)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="No limit"
                                        value={filters.maxPrice || ''}
                                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>GPU Only</Label>
                                    <div className="flex items-center h-10">
                                        <Checkbox
                                            checked={filters.hasGpu || false}
                                            onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasGpu: checked as boolean }))}
                                        />
                                        <span className="ml-2 text-sm">Show GPU instances only</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Results Table */}
                <div className="border rounded-lg">
                    <ScrollArea className="h-[400px]">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                    {showCompareMode && <TableHead className="w-12">Compare</TableHead>}
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => toggleSort('vcpu')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <Cpu className="w-3 h-3" />
                                            vCPU
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => toggleSort('memory')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <MemoryStick className="w-3 h-3" />
                                            Memory
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead>GPU</TableHead>
                                    <TableHead
                                        className="cursor-pointer text-right"
                                        onClick={() => toggleSort('price')}
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            Price/Hr
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Price/Mo</TableHead>
                                    {onSelectSKU && <TableHead className="w-20">Action</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : sortedSKUs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                            No SKUs found matching your criteria
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedSKUs.map(sku => {
                                        const providerName = getProviderName(sku.provider_id);
                                        const isSelected = selectedSKUs.includes(sku.id);
                                        const isInCompare = compareList.includes(sku.id);

                                        return (
                                            <TableRow
                                                key={sku.id}
                                                className={isSelected ? 'bg-primary/5' : ''}
                                            >
                                                {showCompareMode && (
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={isInCompare}
                                                            onCheckedChange={() => toggleCompare(sku.id)}
                                                        />
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <div className="font-medium">{sku.display_name}</div>
                                                    <div className="text-xs text-muted-foreground">{sku.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={PROVIDER_COLORS[providerName] || ''}
                                                    >
                                                        {providerName.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        {CATEGORY_ICONS[categories.find(c => c.id === sku.category_id)?.name || ''] || <Cloud className="w-3 h-3" />}
                                                        <span className="text-sm">{getCategoryName(sku.category_id)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{sku.vcpu || '-'}</TableCell>
                                                <TableCell>{sku.memory_gb ? `${sku.memory_gb} GB` : '-'}</TableCell>
                                                <TableCell>
                                                    {sku.gpu_type ? (
                                                        <div>
                                                            <div className="text-sm">{sku.gpu_count}x {sku.gpu_type}</div>
                                                            {sku.tflops && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {sku.tflops} TFLOPS
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    ${sku.price_per_hour.toFixed(4)}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {sku.price_per_month ? `$${sku.price_per_month.toFixed(2)}` : '-'}
                                                </TableCell>
                                                {onSelectSKU && (
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            variant={isSelected ? 'default' : 'outline'}
                                                            onClick={() => onSelectSKU(sku)}
                                                        >
                                                            {isSelected ? <Check className="w-4 h-4" /> : 'Select'}
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Showing {sortedSKUs.length} SKUs</span>
                    <span>Prices are for {selectedProvider !== 'all' ? providers.find(p => p.id === selectedProvider)?.regions[0] : 'primary regions'}</span>
                </div>
            </CardContent>
        </Card>
    );
}
