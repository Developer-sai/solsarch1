import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Cpu, Loader2 } from 'lucide-react';

interface GPUSku {
  id: string;
  name: string;
  display_name: string;
  gpu_type: string | null;
  gpu_count: number | null;
  gpu_memory_gb: number | null;
  tflops: number | null;
  price_per_hour: number;
  price_per_month: number | null;
  region: string;
  provider_id: string;
}

interface Provider {
  id: string;
  name: string;
  display_name: string;
}

export const GPUDashboard = () => {
  const [gpuSkus, setGpuSkus] = useState<GPUSku[]>([]);
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch providers
        const { data: providersData } = await supabase
          .from('providers')
          .select('*');
        
        const providersMap: Record<string, Provider> = {};
        providersData?.forEach(p => {
          providersMap[p.id] = p;
        });
        setProviders(providersMap);

        // Fetch GPU SKUs
        const { data: skusData } = await supabase
          .from('skus')
          .select('*')
          .not('gpu_type', 'is', null)
          .order('price_per_hour', { ascending: true });

        setGpuSkus(skusData || []);
      } catch (error) {
        console.error('Error fetching GPU data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate price-performance metrics
  const gpuMetrics = gpuSkus.map(gpu => {
    const monthlyHours = 730;
    const monthlyPrice = gpu.price_per_month || gpu.price_per_hour * monthlyHours;
    const costPerTflop = gpu.tflops ? monthlyPrice / gpu.tflops : null;
    const costPerGBVram = gpu.gpu_memory_gb ? monthlyPrice / gpu.gpu_memory_gb : null;

    return {
      ...gpu,
      monthlyPrice,
      costPerTflop,
      costPerGBVram,
      provider: providers[gpu.provider_id],
    };
  });

  const bestValue = gpuMetrics.reduce((best, current) => {
    if (!current.costPerTflop) return best;
    if (!best || !best.costPerTflop) return current;
    return current.costPerTflop < best.costPerTflop ? current : best;
  }, null as typeof gpuMetrics[0] | null);

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          GPU Price-Performance Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent>
        {gpuMetrics.length > 0 ? (
          <>
            {/* Best Value Highlight */}
            {bestValue && (
              <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary">Best Value</Badge>
                  <span className="text-sm text-muted-foreground">
                    Lowest cost per TFLOP
                  </span>
                </div>
                <p className="text-foreground">
                  <strong>{bestValue.display_name}</strong> on {bestValue.provider?.display_name} at{' '}
                  <span className="text-primary font-semibold">
                    ${bestValue.costPerTflop?.toFixed(2)}/TFLOP/month
                  </span>
                </p>
              </div>
            )}

            {/* GPU Comparison Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-foreground">GPU</TableHead>
                    <TableHead className="text-foreground">Provider</TableHead>
                    <TableHead className="text-foreground text-right">VRAM</TableHead>
                    <TableHead className="text-foreground text-right">TFLOPS</TableHead>
                    <TableHead className="text-foreground text-right">$/Hour</TableHead>
                    <TableHead className="text-foreground text-right">$/Month</TableHead>
                    <TableHead className="text-foreground text-right">$/TFLOP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gpuMetrics.map((gpu) => (
                    <TableRow key={gpu.id}>
                      <TableCell className="font-medium text-foreground">
                        <div>
                          <p>{gpu.gpu_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {gpu.gpu_count}x GPU
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {gpu.provider?.display_name || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {gpu.gpu_memory_gb} GB
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {gpu.tflops || '-'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ${gpu.price_per_hour.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-foreground font-medium">
                        ${gpu.monthlyPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {gpu.costPerTflop ? (
                          <span className={gpu.id === bestValue?.id ? 'text-primary font-semibold' : 'text-muted-foreground'}>
                            ${gpu.costPerTflop.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Cpu className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No GPU pricing data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
