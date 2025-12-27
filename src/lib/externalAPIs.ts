/**
 * External API Provider Framework
 * Abstraction layer for integrating web search, cloud pricing, and resource APIs
 * 
 * Supported API Categories:
 * - Web Search (Tavily, Serper, Brave, Google)
 * - Cloud Pricing (AWS, Azure, GCP, OCI)
 * - Cloud Resources (AWS, Azure, GCP, OCI)
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export type WebSearchProvider = 'tavily' | 'serper' | 'brave' | 'google' | 'custom';
export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'oci';
export type APICategory = 'web_search' | 'pricing' | 'resources';

export interface APIConfig {
    provider: string;
    apiKey: string;
    baseUrl?: string;
    region?: string;
    additionalConfig?: Record<string, unknown>;
}

export interface ExternalAPISettings {
    webSearch?: {
        provider: WebSearchProvider;
        apiKey: string;
        baseUrl?: string;
    };
    cloudAPIs?: {
        aws?: {
            accessKeyId: string;
            secretAccessKey: string;
            region: string;
        };
        azure?: {
            tenantId: string;
            clientId: string;
            clientSecret: string;
            subscriptionId: string;
        };
        gcp?: {
            projectId: string;
            serviceAccountKey: string; // JSON string
        };
        oci?: {
            tenancyOcid: string;
            userOcid: string;
            fingerprint: string;
            privateKey: string;
            region: string;
        };
    };
}

// =====================================================
// WEB SEARCH PROVIDERS
// =====================================================

export interface WebSearchResult {
    title: string;
    url: string;
    snippet: string;
    content?: string;
}

export interface WebSearchResponse {
    query: string;
    results: WebSearchResult[];
    provider: WebSearchProvider;
}

const WEB_SEARCH_ENDPOINTS: Record<WebSearchProvider, string> = {
    tavily: 'https://api.tavily.com/search',
    serper: 'https://google.serper.dev/search',
    brave: 'https://api.search.brave.com/res/v1/web/search',
    google: 'https://www.googleapis.com/customsearch/v1',
    custom: ''
};

/**
 * Tavily Search
 */
async function searchTavily(query: string, apiKey: string): Promise<WebSearchResult[]> {
    const response = await fetch(WEB_SEARCH_ENDPOINTS.tavily, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            api_key: apiKey,
            query,
            search_depth: 'advanced',
            include_answer: false,
            max_results: 10
        })
    });

    if (!response.ok) throw new Error(`Tavily API error: ${response.status}`);

    const data = await response.json();
    return data.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.content?.substring(0, 200) || '',
        content: r.content
    }));
}

/**
 * Serper (Google Search API)
 */
async function searchSerper(query: string, apiKey: string): Promise<WebSearchResult[]> {
    const response = await fetch(WEB_SEARCH_ENDPOINTS.serper, {
        method: 'POST',
        headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: query, num: 10 })
    });

    if (!response.ok) throw new Error(`Serper API error: ${response.status}`);

    const data = await response.json();
    return (data.organic || []).map((r: any) => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet || ''
    }));
}

/**
 * Brave Search
 */
async function searchBrave(query: string, apiKey: string): Promise<WebSearchResult[]> {
    const url = `${WEB_SEARCH_ENDPOINTS.brave}?q=${encodeURIComponent(query)}&count=10`;
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            'X-Subscription-Token': apiKey
        }
    });

    if (!response.ok) throw new Error(`Brave API error: ${response.status}`);

    const data = await response.json();
    return (data.web?.results || []).map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.description || ''
    }));
}

/**
 * Universal Web Search Function
 */
export async function webSearch(
    query: string,
    config: { provider: WebSearchProvider; apiKey: string; baseUrl?: string }
): Promise<WebSearchResponse> {
    let results: WebSearchResult[] = [];

    switch (config.provider) {
        case 'tavily':
            results = await searchTavily(query, config.apiKey);
            break;
        case 'serper':
            results = await searchSerper(query, config.apiKey);
            break;
        case 'brave':
            results = await searchBrave(query, config.apiKey);
            break;
        case 'custom':
            // For custom endpoints, make a generic POST request
            if (config.baseUrl) {
                const response = await fetch(config.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.apiKey}`
                    },
                    body: JSON.stringify({ query })
                });
                const data = await response.json();
                results = data.results || [];
            }
            break;
        default:
            throw new Error(`Unsupported web search provider: ${config.provider}`);
    }

    return { query, results, provider: config.provider };
}

// =====================================================
// CLOUD PRICING APIs
// =====================================================

export interface PricingInfo {
    sku: string;
    service: string;
    description: string;
    pricePerUnit: number;
    unit: string;
    currency: string;
    region: string;
    effectiveDate?: string;
}

export interface PricingResponse {
    provider: CloudProvider;
    region: string;
    prices: PricingInfo[];
    lastUpdated: string;
}

/**
 * AWS Pricing API
 * Uses AWS Price List API
 */
export async function getAWSPricing(
    serviceCode: string,
    region: string,
    credentials: { accessKeyId: string; secretAccessKey: string }
): Promise<PricingInfo[]> {
    // AWS Pricing API endpoint (us-east-1 only)
    const endpoint = 'https://pricing.us-east-1.amazonaws.com';

    // Note: In production, use AWS SDK or signed requests
    // This is a simplified example
    console.log('AWS Pricing API called for:', serviceCode, region);

    // Return placeholder - implement with AWS SDK
    return [];
}

/**
 * Azure Retail Prices API (Public, no auth required for retail prices)
 */
export async function getAzurePricing(
    serviceName: string,
    region: string
): Promise<PricingInfo[]> {
    const url = `https://prices.azure.com/api/retail/prices?$filter=serviceName eq '${serviceName}' and armRegionName eq '${region}'`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Azure Pricing API error: ${response.status}`);

    const data = await response.json();
    return (data.Items || []).map((item: any) => ({
        sku: item.skuName,
        service: item.serviceName,
        description: item.productName,
        pricePerUnit: item.retailPrice,
        unit: item.unitOfMeasure,
        currency: item.currencyCode,
        region: item.armRegionName,
        effectiveDate: item.effectiveStartDate
    }));
}

/**
 * GCP Cloud Billing Catalog API
 */
export async function getGCPPricing(
    serviceName: string,
    credentials: { projectId: string; accessToken: string }
): Promise<PricingInfo[]> {
    const url = `https://cloudbilling.googleapis.com/v1/services/${serviceName}/skus`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${credentials.accessToken}`
        }
    });

    if (!response.ok) throw new Error(`GCP Pricing API error: ${response.status}`);

    const data = await response.json();
    return (data.skus || []).map((sku: any) => ({
        sku: sku.skuId,
        service: serviceName,
        description: sku.description,
        pricePerUnit: sku.pricingInfo?.[0]?.pricingExpression?.tieredRates?.[0]?.unitPrice?.units || 0,
        unit: sku.pricingInfo?.[0]?.pricingExpression?.usageUnit || '',
        currency: 'USD',
        region: sku.serviceRegions?.[0] || 'global'
    }));
}

/**
 * Universal Cloud Pricing Function
 */
export async function getCloudPricing(
    provider: CloudProvider,
    serviceName: string,
    region: string,
    config?: Record<string, any>
): Promise<PricingResponse> {
    let prices: PricingInfo[] = [];

    switch (provider) {
        case 'azure':
            // Azure retail prices are public
            prices = await getAzurePricing(serviceName, region);
            break;
        case 'aws':
        case 'gcp':
        case 'oci':
            // These require credentials - placeholder for now
            console.log(`${provider} pricing API requires credentials`);
            prices = [];
            break;
    }

    return {
        provider,
        region,
        prices,
        lastUpdated: new Date().toISOString()
    };
}

// =====================================================
// CLOUD RESOURCES APIs
// =====================================================

export interface CloudResource {
    id: string;
    name: string;
    type: string;
    region: string;
    status: string;
    tags?: Record<string, string>;
    metadata?: Record<string, unknown>;
}

export interface ResourcesResponse {
    provider: CloudProvider;
    resources: CloudResource[];
    nextToken?: string;
}

/**
 * Base interface for cloud resource operations
 */
export interface CloudResourceClient {
    listResources(resourceType: string, region?: string): Promise<CloudResource[]>;
    getResource(resourceId: string): Promise<CloudResource | null>;
    listRegions(): Promise<string[]>;
}

/**
 * AWS Resource Client (stub)
 */
export class AWSResourceClient implements CloudResourceClient {
    constructor(private credentials: { accessKeyId: string; secretAccessKey: string; region: string }) { }

    async listResources(resourceType: string, region?: string): Promise<CloudResource[]> {
        // Implement with AWS SDK
        console.log('AWS listResources called:', resourceType, region);
        return [];
    }

    async getResource(resourceId: string): Promise<CloudResource | null> {
        console.log('AWS getResource called:', resourceId);
        return null;
    }

    async listRegions(): Promise<string[]> {
        return ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1', 'ap-southeast-1'];
    }
}

/**
 * Azure Resource Client (stub)
 */
export class AzureResourceClient implements CloudResourceClient {
    constructor(private credentials: { tenantId: string; clientId: string; clientSecret: string; subscriptionId: string }) { }

    async listResources(resourceType: string, region?: string): Promise<CloudResource[]> {
        console.log('Azure listResources called:', resourceType, region);
        return [];
    }

    async getResource(resourceId: string): Promise<CloudResource | null> {
        console.log('Azure getResource called:', resourceId);
        return null;
    }

    async listRegions(): Promise<string[]> {
        return ['eastus', 'westus2', 'westeurope', 'centralindia', 'southeastasia'];
    }
}

/**
 * GCP Resource Client (stub)
 */
export class GCPResourceClient implements CloudResourceClient {
    constructor(private credentials: { projectId: string; serviceAccountKey: string }) { }

    async listResources(resourceType: string, region?: string): Promise<CloudResource[]> {
        console.log('GCP listResources called:', resourceType, region);
        return [];
    }

    async getResource(resourceId: string): Promise<CloudResource | null> {
        console.log('GCP getResource called:', resourceId);
        return null;
    }

    async listRegions(): Promise<string[]> {
        return ['us-central1', 'us-west1', 'europe-west1', 'asia-south1', 'asia-southeast1'];
    }
}

/**
 * OCI Resource Client (stub)
 */
export class OCIResourceClient implements CloudResourceClient {
    constructor(private credentials: { tenancyOcid: string; userOcid: string; fingerprint: string; privateKey: string; region: string }) { }

    async listResources(resourceType: string, region?: string): Promise<CloudResource[]> {
        console.log('OCI listResources called:', resourceType, region);
        return [];
    }

    async getResource(resourceId: string): Promise<CloudResource | null> {
        console.log('OCI getResource called:', resourceId);
        return null;
    }

    async listRegions(): Promise<string[]> {
        return ['us-ashburn-1', 'us-phoenix-1', 'eu-frankfurt-1', 'ap-mumbai-1', 'ap-singapore-1'];
    }
}

/**
 * Create cloud resource client based on provider
 */
export function createCloudResourceClient(
    provider: CloudProvider,
    credentials: Record<string, string>
): CloudResourceClient {
    switch (provider) {
        case 'aws':
            return new AWSResourceClient(credentials as any);
        case 'azure':
            return new AzureResourceClient(credentials as any);
        case 'gcp':
            return new GCPResourceClient(credentials as any);
        case 'oci':
            return new OCIResourceClient(credentials as any);
        default:
            throw new Error(`Unsupported cloud provider: ${provider}`);
    }
}

// =====================================================
// UNIFIED API MANAGER
// =====================================================

export class ExternalAPIManager {
    private settings: ExternalAPISettings;

    constructor(settings: ExternalAPISettings) {
        this.settings = settings;
    }

    /**
     * Check if a specific API is configured
     */
    isConfigured(category: APICategory, provider?: string): boolean {
        switch (category) {
            case 'web_search':
                return !!this.settings.webSearch?.apiKey;
            case 'pricing':
            case 'resources':
                if (provider) {
                    return !!this.settings.cloudAPIs?.[provider as CloudProvider];
                }
                return Object.keys(this.settings.cloudAPIs || {}).length > 0;
            default:
                return false;
        }
    }

    /**
     * Perform web search
     */
    async search(query: string): Promise<WebSearchResponse> {
        if (!this.settings.webSearch) {
            throw new Error('Web search not configured');
        }
        return webSearch(query, this.settings.webSearch);
    }

    /**
     * Get pricing for a cloud service
     */
    async getPricing(provider: CloudProvider, serviceName: string, region: string): Promise<PricingResponse> {
        return getCloudPricing(provider, serviceName, region, this.settings.cloudAPIs?.[provider]);
    }

    /**
     * Get cloud resource client
     */
    getResourceClient(provider: CloudProvider): CloudResourceClient | null {
        const credentials = this.settings.cloudAPIs?.[provider];
        if (!credentials) return null;
        return createCloudResourceClient(provider, credentials as any);
    }

    /**
     * List all configured providers
     */
    getConfiguredProviders(): CloudProvider[] {
        return Object.keys(this.settings.cloudAPIs || {}) as CloudProvider[];
    }
}

// =====================================================
// PROVIDER INFO FOR UI
// =====================================================

export const WEB_SEARCH_PROVIDERS = {
    tavily: {
        name: 'Tavily',
        description: 'AI-optimized search API',
        signupUrl: 'https://tavily.com'
    },
    serper: {
        name: 'Serper',
        description: 'Google Search API',
        signupUrl: 'https://serper.dev'
    },
    brave: {
        name: 'Brave Search',
        description: 'Privacy-focused search',
        signupUrl: 'https://brave.com/search/api'
    },
    google: {
        name: 'Google Custom Search',
        description: 'Official Google API',
        signupUrl: 'https://developers.google.com/custom-search'
    },
    custom: {
        name: 'Custom Endpoint',
        description: 'Your own search API',
        signupUrl: ''
    }
};

export const CLOUD_PROVIDER_INFO = {
    aws: {
        name: 'Amazon Web Services',
        pricingApiDocs: 'https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html',
        resourceApiDocs: 'https://docs.aws.amazon.com/sdk-for-javascript/'
    },
    azure: {
        name: 'Microsoft Azure',
        pricingApiDocs: 'https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices',
        resourceApiDocs: 'https://learn.microsoft.com/en-us/javascript/api/overview/azure'
    },
    gcp: {
        name: 'Google Cloud Platform',
        pricingApiDocs: 'https://cloud.google.com/billing/docs/how-to/get-prices',
        resourceApiDocs: 'https://cloud.google.com/nodejs/docs/reference'
    },
    oci: {
        name: 'Oracle Cloud Infrastructure',
        pricingApiDocs: 'https://docs.oracle.com/en-us/iaas/Content/GSG/Concepts/pricing.htm',
        resourceApiDocs: 'https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdks.htm'
    }
};
