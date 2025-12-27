import { supabase } from '@/integrations/supabase/client';

export interface SKU {
    id: string;
    provider_id: string;
    category_id: string;
    name: string;
    display_name: string;
    description: string | null;
    region: string;
    vcpu: number | null;
    memory_gb: number | null;
    storage_gb: number | null;
    gpu_type: string | null;
    gpu_count: number | null;
    gpu_memory_gb: number | null;
    tflops: number | null;
    price_per_hour: number;
    price_per_month: number | null;
    currency: string;
    specs: Record<string, unknown>;
    is_active: boolean;
}

export interface Provider {
    id: string;
    name: string;
    display_name: string;
    logo_url: string | null;
    regions: string[];
    is_active: boolean;
}

export interface ServiceCategory {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
}

export interface SKUFilters {
    provider?: string;
    category?: string;
    region?: string;
    minVcpu?: number;
    maxVcpu?: number;
    minMemory?: number;
    maxMemory?: number;
    minPrice?: number;
    maxPrice?: number;
    hasGpu?: boolean;
    gpuType?: string;
    searchQuery?: string;
}

/**
 * Get all cloud providers
 */
export async function getProviders(): Promise<Provider[]> {
    const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('is_active', true)
        .order('display_name');

    if (error) {
        console.error('Error fetching providers:', error);
        return [];
    }

    return (data || []) as unknown as Provider[];
}

/**
 * Get all service categories
 */
export async function getServiceCategories(): Promise<ServiceCategory[]> {
    const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('display_name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return (data || []) as unknown as ServiceCategory[];
}

/**
 * Search and filter SKUs
 */
export async function searchSKUs(filters: SKUFilters): Promise<SKU[]> {
    let query = supabase
        .from('skus')
        .select('*')
        .eq('is_active', true);

    // Apply filters
    if (filters.provider) {
        query = query.eq('provider_id', filters.provider);
    }

    if (filters.category) {
        query = query.eq('category_id', filters.category);
    }

    if (filters.region) {
        query = query.eq('region', filters.region);
    }

    if (filters.minVcpu !== undefined) {
        query = query.gte('vcpu', filters.minVcpu);
    }

    if (filters.maxVcpu !== undefined) {
        query = query.lte('vcpu', filters.maxVcpu);
    }

    if (filters.minMemory !== undefined) {
        query = query.gte('memory_gb', filters.minMemory);
    }

    if (filters.maxMemory !== undefined) {
        query = query.lte('memory_gb', filters.maxMemory);
    }

    if (filters.minPrice !== undefined) {
        query = query.gte('price_per_hour', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
        query = query.lte('price_per_hour', filters.maxPrice);
    }

    if (filters.hasGpu) {
        query = query.not('gpu_type', 'is', null);
    }

    if (filters.gpuType) {
        query = query.ilike('gpu_type', `%${filters.gpuType}%`);
    }

    if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,display_name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    // Order by price
    query = query.order('price_per_hour', { ascending: true });

    const { data, error } = await query;

    if (error) {
        console.error('Error searching SKUs:', error);
        return [];
    }

    return (data || []) as unknown as SKU[];
}

/**
 * Get SKUs by category name
 */
export async function getSKUsByCategory(categoryName: string, providerName?: string): Promise<SKU[]> {
    // First get category ID
    const { data: categories } = await supabase
        .from('service_categories')
        .select('id')
        .eq('name', categoryName)
        .single();

    if (!categories) return [];

    let query = supabase
        .from('skus')
        .select('*')
        .eq('category_id', categories.id)
        .eq('is_active', true);

    if (providerName) {
        const { data: provider } = await supabase
            .from('providers')
            .select('id')
            .eq('name', providerName)
            .single();

        if (provider) {
            query = query.eq('provider_id', provider.id);
        }
    }

    const { data, error } = await query.order('price_per_hour');

    if (error) {
        console.error('Error fetching SKUs by category:', error);
        return [];
    }

    return (data || []) as unknown as SKU[];
}

/**
 * Get a single SKU by ID
 */
export async function getSKU(id: string): Promise<SKU | null> {
    const { data, error } = await supabase
        .from('skus')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching SKU:', error);
        return null;
    }

    return data as unknown as SKU;
}

/**
 * Compare multiple SKUs side-by-side
 */
export async function compareSKUs(skuIds: string[]): Promise<SKU[]> {
    const { data, error } = await supabase
        .from('skus')
        .select('*')
        .in('id', skuIds);

    if (error) {
        console.error('Error comparing SKUs:', error);
        return [];
    }

    return (data || []) as unknown as SKU[];
}

/**
 * Get recommended SKUs based on requirements
 */
export async function getRecommendedSKUs(
    category: string,
    minVcpu: number,
    minMemory: number,
    budget?: number
): Promise<{ provider: string; sku: SKU }[]> {
    const recommendations: { provider: string; sku: SKU }[] = [];

    const providers = await getProviders();

    for (const provider of providers) {
        const skus = await searchSKUs({
            provider: provider.id,
            category,
            minVcpu,
            minMemory,
            maxPrice: budget ? budget / 730 : undefined // Convert monthly to hourly
        });

        if (skus.length > 0) {
            // Get the cheapest option that meets requirements
            recommendations.push({
                provider: provider.name,
                sku: skus[0]
            });
        }
    }

    return recommendations.sort((a, b) => a.sku.price_per_hour - b.sku.price_per_hour);
}

/**
 * Get GPU SKUs with TFLOPS comparison
 */
export async function getGPUSKUs(providerName?: string): Promise<SKU[]> {
    let query = supabase
        .from('skus')
        .select('*')
        .not('gpu_type', 'is', null)
        .eq('is_active', true);

    if (providerName) {
        const { data: provider } = await supabase
            .from('providers')
            .select('id')
            .eq('name', providerName)
            .single();

        if (provider) {
            query = query.eq('provider_id', provider.id);
        }
    }

    const { data, error } = await query.order('tflops', { ascending: false });

    if (error) {
        console.error('Error fetching GPU SKUs:', error);
        return [];
    }

    return (data || []) as unknown as SKU[];
}

/**
 * Calculate cost per TFLOP for GPU comparison
 */
export function calculateCostPerTflop(sku: SKU): number | null {
    if (!sku.tflops || sku.tflops === 0) return null;
    return sku.price_per_hour / sku.tflops;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, period: 'hour' | 'month' = 'hour'): string {
    return `$${amount.toFixed(period === 'hour' ? 4 : 2)}/${period === 'hour' ? 'hr' : 'mo'}`;
}
