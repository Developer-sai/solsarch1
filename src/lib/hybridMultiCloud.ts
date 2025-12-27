/**
 * Hybrid Multi-Cloud Architecture Service
 * 
 * Supports architectures that span multiple cloud providers:
 * - AWS S3 for images
 * - Azure SQL for relational data
 * - Google Maps API
 * - OCI for compute
 * - Any combination
 */

import { CloudProvider } from './externalAPIs';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export type ServiceType =
    | 'compute'
    | 'database'
    | 'storage'
    | 'cache'
    | 'cdn'
    | 'queue'
    | 'serverless'
    | 'container'
    | 'gpu'
    | 'api'
    | 'maps'
    | 'auth'
    | 'analytics'
    | 'ml'
    | 'monitoring';

export interface MultiCloudService {
    id: string;
    name: string;
    type: ServiceType;
    provider: CloudProvider | 'third-party';
    service: string; // e.g., 's3', 'azure-sql', 'google-maps'
    region?: string;
    config: Record<string, unknown>;
    monthlyCost: number;
    connections: string[]; // IDs of connected services
}

export interface HybridArchitecture {
    id: string;
    name: string;
    description: string;
    services: MultiCloudService[];
    totalMonthlyCost: number;
    providers: (CloudProvider | 'third-party')[];
    dataFlows: DataFlow[];
    compliance: string[];
    createdAt: string;
}

export interface DataFlow {
    from: string; // service ID
    to: string; // service ID
    type: 'sync' | 'async' | 'streaming';
    protocol: string;
    dataType: string;
    encryptionRequired: boolean;
}

// =====================================================
// SERVICE CATALOG BY PROVIDER
// =====================================================

export const PROVIDER_SERVICES: Record<CloudProvider | 'third-party', Record<ServiceType, string[]>> = {
    aws: {
        compute: ['EC2', 'Lambda', 'ECS', 'EKS', 'Fargate', 'Lightsail'],
        database: ['RDS', 'Aurora', 'DynamoDB', 'DocumentDB', 'Redshift', 'ElastiCache'],
        storage: ['S3', 'EBS', 'EFS', 'Glacier', 'FSx'],
        cache: ['ElastiCache Redis', 'ElastiCache Memcached', 'DAX'],
        cdn: ['CloudFront'],
        queue: ['SQS', 'SNS', 'EventBridge', 'Kinesis'],
        serverless: ['Lambda', 'API Gateway', 'Step Functions'],
        container: ['ECS', 'EKS', 'Fargate', 'ECR'],
        gpu: ['P4d', 'P3', 'G5', 'G4dn', 'Inf1', 'Trn1'],
        api: ['API Gateway', 'AppSync'],
        maps: [],
        auth: ['Cognito', 'IAM'],
        analytics: ['Athena', 'EMR', 'Glue', 'QuickSight'],
        ml: ['SageMaker', 'Rekognition', 'Comprehend', 'Bedrock'],
        monitoring: ['CloudWatch', 'X-Ray']
    },
    azure: {
        compute: ['Virtual Machines', 'App Service', 'Functions', 'AKS', 'Container Instances'],
        database: ['Azure SQL', 'Cosmos DB', 'PostgreSQL', 'MySQL', 'Synapse'],
        storage: ['Blob Storage', 'File Storage', 'Data Lake', 'Disk Storage'],
        cache: ['Azure Cache for Redis'],
        cdn: ['Azure CDN', 'Front Door'],
        queue: ['Service Bus', 'Event Grid', 'Event Hubs', 'Queue Storage'],
        serverless: ['Functions', 'Logic Apps', 'Durable Functions'],
        container: ['AKS', 'Container Instances', 'Container Registry'],
        gpu: ['NC-series', 'ND-series', 'NV-series'],
        api: ['API Management', 'API Apps'],
        maps: ['Azure Maps'],
        auth: ['Azure AD', 'Azure AD B2C'],
        analytics: ['Synapse', 'Data Factory', 'Stream Analytics', 'Power BI'],
        ml: ['Azure ML', 'Cognitive Services', 'OpenAI Service'],
        monitoring: ['Azure Monitor', 'Application Insights', 'Log Analytics']
    },
    gcp: {
        compute: ['Compute Engine', 'Cloud Run', 'GKE', 'App Engine', 'Cloud Functions'],
        database: ['Cloud SQL', 'Cloud Spanner', 'Firestore', 'Bigtable', 'BigQuery'],
        storage: ['Cloud Storage', 'Persistent Disk', 'Filestore'],
        cache: ['Memorystore'],
        cdn: ['Cloud CDN', 'Media CDN'],
        queue: ['Pub/Sub', 'Cloud Tasks', 'Workflows'],
        serverless: ['Cloud Functions', 'Cloud Run'],
        container: ['GKE', 'Cloud Run', 'Artifact Registry'],
        gpu: ['A100', 'V100', 'T4', 'L4'],
        api: ['API Gateway', 'Apigee'],
        maps: ['Google Maps Platform', 'Places API', 'Routes API', 'Maps Embed API'],
        auth: ['Identity Platform', 'Firebase Auth'],
        analytics: ['BigQuery', 'Dataflow', 'Composer', 'Looker'],
        ml: ['Vertex AI', 'AutoML', 'Vision AI', 'Natural Language'],
        monitoring: ['Cloud Monitoring', 'Cloud Logging', 'Cloud Trace']
    },
    oci: {
        compute: ['Compute', 'Container Engine', 'Functions'],
        database: ['Autonomous Database', 'MySQL', 'PostgreSQL', 'NoSQL'],
        storage: ['Object Storage', 'Block Volume', 'File Storage'],
        cache: ['Cache with Redis'],
        cdn: ['CDN'],
        queue: ['Streaming', 'Queue'],
        serverless: ['Functions'],
        container: ['Container Engine', 'Container Instances'],
        gpu: ['GPU.A10', 'GPU.A100', 'BM.GPU4.8'],
        api: ['API Gateway'],
        maps: [],
        auth: ['Identity', 'IAM'],
        analytics: ['Analytics Cloud', 'Data Flow', 'Data Science'],
        ml: ['Data Science', 'AI Services'],
        monitoring: ['Monitoring', 'Logging', 'APM']
    },
    'third-party': {
        compute: [],
        database: ['MongoDB Atlas', 'PlanetScale', 'Supabase', 'Neon', 'CockroachDB'],
        storage: ['Cloudflare R2', 'Backblaze B2'],
        cache: ['Upstash', 'Redis Cloud'],
        cdn: ['Cloudflare', 'Fastly', 'Akamai'],
        queue: ['Kafka (Confluent)', 'RabbitMQ Cloud'],
        serverless: ['Vercel', 'Netlify', 'Cloudflare Workers'],
        container: ['Render', 'Railway', 'Fly.io'],
        gpu: ['Lambda Labs', 'CoreWeave', 'RunPod'],
        api: ['Kong', 'Postman'],
        maps: ['Google Maps', 'Mapbox', 'HERE Maps', 'OpenStreetMap'],
        auth: ['Auth0', 'Clerk', 'Firebase', 'Supabase Auth'],
        analytics: ['Mixpanel', 'Amplitude', 'Snowflake'],
        ml: ['Hugging Face', 'Replicate', 'OpenAI'],
        monitoring: ['Datadog', 'New Relic', 'Grafana Cloud', 'Sentry']
    }
};

// =====================================================
// HYBRID ARCHITECTURE BUILDER
// =====================================================

export class HybridArchitectureBuilder {
    private services: MultiCloudService[] = [];
    private dataFlows: DataFlow[] = [];
    private compliance: string[] = [];

    constructor(private name: string, private description: string) { }

    /**
     * Add a service from any provider
     */
    addService(
        name: string,
        type: ServiceType,
        provider: CloudProvider | 'third-party',
        service: string,
        config: Record<string, unknown> = {},
        monthlyCost: number = 0,
        region?: string
    ): string {
        const id = `${provider}-${type}-${Date.now()}`;
        this.services.push({
            id,
            name,
            type,
            provider,
            service,
            region,
            config,
            monthlyCost,
            connections: []
        });
        return id;
    }

    /**
     * Connect two services
     */
    connect(
        fromId: string,
        toId: string,
        type: 'sync' | 'async' | 'streaming' = 'sync',
        protocol: string = 'HTTPS',
        dataType: string = 'JSON',
        encryptionRequired: boolean = true
    ): void {
        const fromService = this.services.find(s => s.id === fromId);
        const toService = this.services.find(s => s.id === toId);

        if (!fromService || !toService) {
            throw new Error('Service not found');
        }

        fromService.connections.push(toId);

        this.dataFlows.push({
            from: fromId,
            to: toId,
            type,
            protocol,
            dataType,
            encryptionRequired
        });
    }

    /**
     * Add compliance requirement
     */
    addCompliance(standard: string): void {
        if (!this.compliance.includes(standard)) {
            this.compliance.push(standard);
        }
    }

    /**
     * Build the architecture
     */
    build(): HybridArchitecture {
        const providers = [...new Set(this.services.map(s => s.provider))];
        const totalCost = this.services.reduce((sum, s) => sum + s.monthlyCost, 0);

        return {
            id: `arch-${Date.now()}`,
            name: this.name,
            description: this.description,
            services: this.services,
            totalMonthlyCost: totalCost,
            providers,
            dataFlows: this.dataFlows,
            compliance: this.compliance,
            createdAt: new Date().toISOString()
        };
    }
}

// =====================================================
// PRE-BUILT HYBRID PATTERNS
// =====================================================

export const HYBRID_PATTERNS = {
    /**
     * Pattern: AWS S3 + Azure SQL + Google Maps
     */
    ecommerceHybrid: (): HybridArchitecture => {
        const builder = new HybridArchitectureBuilder(
            'E-commerce Hybrid',
            'AWS for images, Azure for data, Google Maps for location'
        );

        // AWS S3 for images
        const s3 = builder.addService(
            'Product Images',
            'storage',
            'aws',
            'S3',
            { bucket: 'product-images', publicRead: true },
            50,
            'us-east-1'
        );

        // AWS CloudFront for image CDN
        const cloudfront = builder.addService(
            'Image CDN',
            'cdn',
            'aws',
            'CloudFront',
            { origin: 's3://product-images' },
            30,
            'global'
        );

        // Azure SQL for relational data
        const azureSql = builder.addService(
            'Order Database',
            'database',
            'azure',
            'Azure SQL',
            { tier: 'Standard', dtu: 50 },
            150,
            'eastus'
        );

        // Azure App Service for API
        const appService = builder.addService(
            'API Server',
            'compute',
            'azure',
            'App Service',
            { plan: 'P1v3' },
            100,
            'eastus'
        );

        // Google Maps for location
        const maps = builder.addService(
            'Location Services',
            'maps',
            'gcp',
            'Google Maps Platform',
            { apis: ['Maps JavaScript', 'Places', 'Geocoding'] },
            75
        );

        // Third-party auth
        const auth = builder.addService(
            'Authentication',
            'auth',
            'third-party',
            'Auth0',
            { plan: 'Developer Pro' },
            40
        );

        // Connect services
        builder.connect(appService, s3, 'async', 'AWS SDK', 'Binary');
        builder.connect(appService, azureSql, 'sync', 'TCP', 'SQL');
        builder.connect(appService, maps, 'sync', 'HTTPS', 'JSON');
        builder.connect(appService, auth, 'sync', 'HTTPS', 'JWT');
        builder.connect(cloudfront, s3, 'sync', 'S3', 'Binary');

        builder.addCompliance('PCI-DSS');
        builder.addCompliance('GDPR');

        return builder.build();
    },

    /**
     * Pattern: Multi-cloud ML Pipeline
     */
    mlPipelineHybrid: (): HybridArchitecture => {
        const builder = new HybridArchitectureBuilder(
            'ML Pipeline Hybrid',
            'GCP for training, AWS for inference, OCI for storage'
        );

        // GCP for training (cheaper GPUs)
        const training = builder.addService(
            'Model Training',
            'gpu',
            'gcp',
            'A2-highgpu-4g',
            { gpuCount: 4, framework: 'PyTorch' },
            5000,
            'us-central1'
        );

        // OCI for data lake (cheapest storage)
        const dataLake = builder.addService(
            'Training Data',
            'storage',
            'oci',
            'Object Storage',
            { tier: 'Standard' },
            100,
            'us-ashburn-1'
        );

        // AWS for inference (best ecosystem)
        const inference = builder.addService(
            'Model Serving',
            'ml',
            'aws',
            'SageMaker',
            { endpoint: 'real-time' },
            800,
            'us-east-1'
        );

        // Hugging Face for model registry
        const registry = builder.addService(
            'Model Registry',
            'ml',
            'third-party',
            'Hugging Face',
            { plan: 'Pro' },
            50
        );

        builder.connect(training, dataLake, 'streaming', 'HTTPS', 'Parquet');
        builder.connect(training, registry, 'async', 'HTTPS', 'Model Files');
        builder.connect(inference, registry, 'sync', 'HTTPS', 'Model Files');

        return builder.build();
    },

    /**
     * Pattern: Global SaaS with regional data
     */
    globalSaasHybrid: (): HybridArchitecture => {
        const builder = new HybridArchitectureBuilder(
            'Global SaaS',
            'Multi-region with data residency compliance'
        );

        // US region - AWS
        const usCompute = builder.addService(
            'US API',
            'compute',
            'aws',
            'ECS Fargate',
            {},
            200,
            'us-east-1'
        );

        const usDb = builder.addService(
            'US Database',
            'database',
            'aws',
            'Aurora PostgreSQL',
            { multiAz: true },
            400,
            'us-east-1'
        );

        // EU region - Azure (for GDPR)
        const euCompute = builder.addService(
            'EU API',
            'compute',
            'azure',
            'Container Apps',
            {},
            180,
            'westeurope'
        );

        const euDb = builder.addService(
            'EU Database',
            'database',
            'azure',
            'Azure SQL',
            { tier: 'Business Critical' },
            500,
            'westeurope'
        );

        // Asia - GCP
        const asiaCompute = builder.addService(
            'Asia API',
            'compute',
            'gcp',
            'Cloud Run',
            {},
            150,
            'asia-southeast1'
        );

        const asiaDb = builder.addService(
            'Asia Database',
            'database',
            'gcp',
            'Cloud SQL',
            { tier: 'db-custom-4-16384' },
            350,
            'asia-southeast1'
        );

        // Global CDN
        const cdn = builder.addService(
            'Global CDN',
            'cdn',
            'third-party',
            'Cloudflare',
            { plan: 'Business' },
            200,
            'global'
        );

        builder.connect(cdn, usCompute, 'sync', 'HTTPS', 'JSON');
        builder.connect(cdn, euCompute, 'sync', 'HTTPS', 'JSON');
        builder.connect(cdn, asiaCompute, 'sync', 'HTTPS', 'JSON');
        builder.connect(usCompute, usDb, 'sync', 'TCP', 'SQL');
        builder.connect(euCompute, euDb, 'sync', 'TCP', 'SQL');
        builder.connect(asiaCompute, asiaDb, 'sync', 'TCP', 'SQL');

        builder.addCompliance('GDPR');
        builder.addCompliance('SOC 2');

        return builder.build();
    }
};

// =====================================================
// COST AGGREGATOR FOR HYBRID ARCHITECTURES
// =====================================================

export interface HybridCostBreakdown {
    byProvider: Record<string, number>;
    byServiceType: Record<string, number>;
    byRegion: Record<string, number>;
    total: number;
    transferCosts: number;
}

export function calculateHybridCosts(arch: HybridArchitecture): HybridCostBreakdown {
    const byProvider: Record<string, number> = {};
    const byServiceType: Record<string, number> = {};
    const byRegion: Record<string, number> = {};

    for (const service of arch.services) {
        // By provider
        byProvider[service.provider] = (byProvider[service.provider] || 0) + service.monthlyCost;

        // By service type
        byServiceType[service.type] = (byServiceType[service.type] || 0) + service.monthlyCost;

        // By region
        const region = service.region || 'global';
        byRegion[region] = (byRegion[region] || 0) + service.monthlyCost;
    }

    // Estimate cross-cloud transfer costs (simplified)
    const crossCloudFlows = arch.dataFlows.filter(flow => {
        const from = arch.services.find(s => s.id === flow.from);
        const to = arch.services.find(s => s.id === flow.to);
        return from && to && from.provider !== to.provider;
    });

    // Rough estimate: $0.02/GB, assume 100GB/month per flow
    const transferCosts = crossCloudFlows.length * 100 * 0.02;

    return {
        byProvider,
        byServiceType,
        byRegion,
        total: arch.totalMonthlyCost + transferCosts,
        transferCosts
    };
}

// =====================================================
// MERMAID DIAGRAM GENERATOR FOR HYBRID
// =====================================================

export function generateHybridDiagram(arch: HybridArchitecture): string {
    const lines: string[] = ['graph TB'];

    // Group services by provider
    const byProvider: Record<string, MultiCloudService[]> = {};
    for (const service of arch.services) {
        if (!byProvider[service.provider]) {
            byProvider[service.provider] = [];
        }
        byProvider[service.provider].push(service);
    }

    // Create subgraphs for each provider
    for (const [provider, services] of Object.entries(byProvider)) {
        const providerName = provider.toUpperCase();
        lines.push(`  subgraph ${providerName}["☁️ ${providerName}"]`);

        for (const service of services) {
            const nodeId = service.id.replace(/[^a-zA-Z0-9]/g, '_');
            const cost = service.monthlyCost > 0 ? ` $${service.monthlyCost}/mo` : '';
            lines.push(`    ${nodeId}["${service.name}<br/>${service.service}${cost}"]`);
        }

        lines.push('  end');
    }

    // Add connections
    for (const flow of arch.dataFlows) {
        const fromId = flow.from.replace(/[^a-zA-Z0-9]/g, '_');
        const toId = flow.to.replace(/[^a-zA-Z0-9]/g, '_');
        const arrow = flow.type === 'async' ? '-..->' : '-->';
        lines.push(`  ${fromId} ${arrow}|${flow.protocol}| ${toId}`);
    }

    return lines.join('\n');
}

// =====================================================
// IaC GENERATOR FOR HYBRID (TERRAFORM)
// =====================================================

export function generateHybridTerraform(arch: HybridArchitecture): string {
    const lines: string[] = [
        '# Hybrid Multi-Cloud Architecture',
        `# ${arch.name}`,
        `# Generated: ${new Date().toISOString()}`,
        '',
        '# ============================================',
        '# PROVIDER CONFIGURATIONS',
        '# ============================================',
        ''
    ];

    // Add providers
    const providers = [...new Set(arch.services.map(s => s.provider))];

    if (providers.includes('aws')) {
        lines.push(`provider "aws" {`);
        lines.push(`  region = var.aws_region`);
        lines.push(`}`);
        lines.push('');
    }

    if (providers.includes('azure')) {
        lines.push(`provider "azurerm" {`);
        lines.push(`  features {}`);
        lines.push(`}`);
        lines.push('');
    }

    if (providers.includes('gcp')) {
        lines.push(`provider "google" {`);
        lines.push(`  project = var.gcp_project`);
        lines.push(`  region  = var.gcp_region`);
        lines.push(`}`);
        lines.push('');
    }

    if (providers.includes('oci')) {
        lines.push(`provider "oci" {`);
        lines.push(`  region = var.oci_region`);
        lines.push(`}`);
        lines.push('');
    }

    lines.push('# ============================================');
    lines.push('# VARIABLES');
    lines.push('# ============================================');
    lines.push('');
    lines.push('variable "aws_region" { default = "us-east-1" }');
    lines.push('variable "gcp_project" { default = "my-project" }');
    lines.push('variable "gcp_region" { default = "us-central1" }');
    lines.push('variable "oci_region" { default = "us-ashburn-1" }');
    lines.push('');

    lines.push('# ============================================');
    lines.push('# RESOURCES');
    lines.push('# ============================================');
    lines.push('');

    // Add placeholder resources for each service
    for (const service of arch.services) {
        lines.push(`# ${service.name} (${service.provider})`);
        lines.push(`# Service: ${service.service}`);
        lines.push(`# Cost: $${service.monthlyCost}/month`);
        lines.push(`# TODO: Add resource configuration`);
        lines.push('');
    }

    return lines.join('\n');
}

// =====================================================
// VALIDATION
// =====================================================

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export function validateHybridArchitecture(arch: HybridArchitecture): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for disconnected services
    const connectedIds = new Set<string>();
    for (const flow of arch.dataFlows) {
        connectedIds.add(flow.from);
        connectedIds.add(flow.to);
    }

    for (const service of arch.services) {
        if (!connectedIds.has(service.id) && arch.services.length > 1) {
            warnings.push(`Service "${service.name}" is not connected to any other service`);
        }
    }

    // Check for cross-cloud data flows without encryption
    for (const flow of arch.dataFlows) {
        const from = arch.services.find(s => s.id === flow.from);
        const to = arch.services.find(s => s.id === flow.to);

        if (from && to && from.provider !== to.provider && !flow.encryptionRequired) {
            errors.push(`Cross-cloud data flow from "${from.name}" to "${to.name}" should be encrypted`);
        }
    }

    // Check compliance requirements
    if (arch.compliance.includes('GDPR')) {
        const euServices = arch.services.filter(s =>
            s.region?.includes('europe') || s.region?.includes('eu-')
        );
        if (euServices.length === 0) {
            warnings.push('GDPR compliance specified but no EU region services found');
        }
    }

    // Check for missing regions
    for (const service of arch.services) {
        if (!service.region && service.type !== 'cdn') {
            warnings.push(`Service "${service.name}" has no region specified`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
