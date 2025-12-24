/**
 * Industry-Specific Context Database
 * Provides rich context for architecture generation based on real-world patterns
 */

export interface IndustryPattern {
    name: string;
    criticalComponents: string[];
    architecturePatterns: string[];
    referenceClients: string[];
    regulatoryRequirements: string[];
    performanceTargets: {
        latency: string;
        throughput?: string;
        availability?: string;
    };
    costOptimization: string[];
    securityPriorities: string[];
    dataPatterns: string[];
    scalingStrategy: string;
}

export const INDUSTRY_PATTERNS: Record<string, IndustryPattern> = {
    'fintech': {
        name: 'Financial Technology',
        criticalComponents: [
            'Fraud Detection Engine',
            'Transaction Processing System',
            'Audit Trail & Logging',
            'Payment Gateway Integration',
            'KYC/AML Verification',
            'Real-time Risk Assessment'
        ],
        architecturePatterns: [
            'Event Sourcing for transaction history',
            'CQRS for read/write separation',
            'Saga Pattern for distributed transactions',
            'Circuit Breakers for third-party APIs',
            'Idempotency for payment operations'
        ],
        referenceClients: [
            'Stripe: Event-driven, multi-region, 99.999% uptime',
            'Square: Microservices on Kubernetes, real-time processing',
            'Robinhood: High-throughput trading, sub-100ms latency',
            'PayPal: Global scale, billions of transactions'
        ],
        regulatoryRequirements: ['PCI-DSS', 'SOC2', 'GDPR', 'SOX', 'AML/KYC'],
        performanceTargets: {
            latency: '<100ms for transactions',
            throughput: '>10,000 TPS',
            availability: '99.99%'
        },
        costOptimization: [
            'Reserved instances for predictable transaction processing',
            'Spot instances for batch fraud analysis',
            'Auto-scaling for peak trading hours',
            'CDN for static assets and documentation',
            'Database read replicas for reporting'
        ],
        securityPriorities: [
            'Encryption at rest (AES-256) and in transit (TLS 1.3)',
            'Tokenization for sensitive payment data',
            'Multi-factor authentication',
            'IP whitelisting for admin access',
            'Regular penetration testing'
        ],
        dataPatterns: [
            'Time-series transaction data',
            'Immutable audit logs',
            'User session data (short-lived)',
            'Fraud detection models',
            'Compliance reports'
        ],
        scalingStrategy: 'Horizontal scaling with database sharding by user ID, event-driven async processing for non-critical operations'
    },

    'healthcare': {
        name: 'Healthcare & Medical',
        criticalComponents: [
            'PHI Encryption & Access Control',
            'Audit Logging (HIPAA compliant)',
            'Patient Data Management',
            'EHR/EMR Integration',
            'Telemedicine Platform',
            'Medical Imaging Storage'
        ],
        architecturePatterns: [
            'Microservices with API Gateway',
            'Zero Trust Security Model',
            'Data encryption at field level',
            'Role-based access control (RBAC)',
            'Immutable audit logs'
        ],
        referenceClients: [
            'Epic: Enterprise EHR, on-premise + cloud hybrid',
            'Cerner: Cloud-based healthcare platform',
            'Athenahealth: SaaS medical records',
            'Teladoc: Telemedicine at scale'
        ],
        regulatoryRequirements: ['HIPAA', 'HITRUST', 'SOC2', 'GDPR', 'FDA (for medical devices)'],
        performanceTargets: {
            latency: '<200ms for patient queries',
            availability: '99.99% (critical systems)'
        },
        costOptimization: [
            'S3 Glacier for long-term medical record storage',
            'Intelligent tiering for imaging data',
            'Reserved instances for core EHR systems',
            'Serverless for appointment scheduling'
        ],
        securityPriorities: [
            'HIPAA-compliant encryption (PHI)',
            'Dedicated tenancy for sensitive workloads',
            'VPN/Private Link for provider access',
            'BAA (Business Associate Agreement) with cloud provider',
            'Regular HIPAA audits'
        ],
        dataPatterns: [
            'Patient health records (long retention)',
            'Medical imaging (DICOM format, large files)',
            'Appointment and scheduling data',
            'Prescription and medication history',
            'Insurance and billing information'
        ],
        scalingStrategy: 'Vertical scaling for databases, horizontal for application tier, CDN for imaging with edge caching'
    },

    'e-commerce': {
        name: 'E-commerce & Retail',
        criticalComponents: [
            'Product Catalog Service',
            'Shopping Cart Management',
            'Payment Processing',
            'Inventory Management',
            'Order Fulfillment System',
            'Search & Recommendation Engine'
        ],
        architecturePatterns: [
            'CQRS for catalog (read-heavy) vs orders (write-heavy)',
            'Event sourcing for order history',
            'Circuit breakers for payment gateways',
            'Inventory reservation pattern',
            'Cache-aside for product catalog'
        ],
        referenceClients: [
            'Amazon: Microservices, global scale, personalization',
            'Shopify: Multi-tenant SaaS, millions of stores',
            'Walmart: Hybrid cloud, omnichannel',
            'Etsy: Marketplace platform, search-heavy'
        ],
        regulatoryRequirements: ['PCI-DSS (for payments)', 'GDPR', 'CCPA', 'Consumer protection laws'],
        performanceTargets: {
            latency: '<200ms for page loads',
            throughput: 'Handle 10x traffic during sales',
            availability: '99.95% (99.99% during peak)'
        },
        costOptimization: [
            'CDN for product images and static content',
            'ElastiCache for product catalog and sessions',
            'Auto-scaling for Black Friday/Cyber Monday',
            'Spot instances for batch processing (analytics)',
            'S3 Intelligent Tiering for product images'
        ],
        securityPriorities: [
            'PCI-DSS compliance (use Stripe/PayPal to reduce scope)',
            'DDoS protection (WAF + Shield)',
            'Bot detection for checkout',
            'Secure session management',
            'Regular security scanning'
        ],
        dataPatterns: [
            'Product catalog (read-heavy, cacheable)',
            'User sessions (short-lived, in-memory)',
            'Order history (write-heavy, time-series)',
            'Clickstream analytics (high volume)',
            'Inventory levels (real-time updates)'
        ],
        scalingStrategy: 'Pre-scale for known traffic spikes, CDN-first architecture, auto-scaling with predictive scaling based on historical patterns'
    },

    'saas': {
        name: 'Software as a Service',
        criticalComponents: [
            'Multi-tenant Database',
            'Authentication & Authorization',
            'API Gateway & Rate Limiting',
            'Webhook Processing',
            'Usage Metering & Billing',
            'Feature Flags System'
        ],
        architecturePatterns: [
            'Multi-tenant architecture (shared schema with tenant_id)',
            'Horizontal pod autoscaling',
            'Feature flags for gradual rollouts',
            'Usage-based billing integration',
            'API versioning strategy'
        ],
        referenceClients: [
            'Salesforce: Multi-tenant CRM, massive scale',
            'Slack: Real-time messaging, WebSocket heavy',
            'Zoom: Video streaming, global distribution',
            'Notion: Collaborative editing, real-time sync'
        ],
        regulatoryRequirements: ['SOC2', 'GDPR', 'ISO 27001', 'Industry-specific (varies)'],
        performanceTargets: {
            latency: '<300ms for API calls',
            availability: '99.9% (99.95% for enterprise tier)'
        },
        costOptimization: [
            'Serverless for variable workloads',
            'Auto-scaling based on tenant activity',
            'Reserved instances for base load',
            'CDN for static assets',
            'Database connection pooling'
        ],
        securityPriorities: [
            'Tenant isolation (data and compute)',
            'OAuth 2.0 / OIDC for authentication',
            'Rate limiting per tenant',
            'Encryption at rest and in transit',
            'Regular penetration testing'
        ],
        dataPatterns: [
            'Time-series metrics per tenant',
            'Audit logs (compliance)',
            'User sessions and preferences',
            'Configuration data',
            'Usage analytics'
        ],
        scalingStrategy: 'Horizontal scaling with tenant-aware load balancing, predictive scaling during business hours, queue-based processing for async tasks'
    },

    'ai-inference': {
        name: 'AI/ML Inference Platform',
        criticalComponents: [
            'Model Registry & Versioning',
            'Inference Server (Triton/TorchServe)',
            'Request Queue & Load Balancer',
            'GPU Pool Management',
            'Model Monitoring & Drift Detection',
            'Feature Store'
        ],
        architecturePatterns: [
            'Model serving with batching',
            'GPU sharing via MIG/MPS',
            'A/B testing for models',
            'Canary deployments',
            'Request queue with priority'
        ],
        referenceClients: [
            'OpenAI: GPT models, global inference',
            'Hugging Face: Model hosting platform',
            'Anthropic: Claude API, high-throughput',
            'Stability AI: Image generation at scale'
        ],
        regulatoryRequirements: ['SOC2', 'Data privacy laws', 'AI ethics guidelines'],
        performanceTargets: {
            latency: '<500ms for inference (varies by model)',
            throughput: '>1000 requests/sec per GPU'
        },
        costOptimization: [
            'Spot instances for GPU nodes (60-70% savings)',
            'GPU-aware autoscaling with Karpenter',
            'Model quantization (INT8/FP16)',
            'Batch inference for non-real-time',
            'Cold start mitigation with warm pools'
        ],
        securityPriorities: [
            'Model IP protection',
            'Input validation and sanitization',
            'Rate limiting per API key',
            'DDoS protection',
            'Audit logging for compliance'
        ],
        dataPatterns: [
            'Model artifacts (S3/GCS)',
            'Inference logs for monitoring',
            'Feature vectors (cached)',
            'Ground truth data for retraining',
            'Performance metrics'
        ],
        scalingStrategy: 'GPU-aware autoscaling based on queue depth, warm pool for cold start mitigation, multi-region for global latency'
    },

    'iot': {
        name: 'Internet of Things',
        criticalComponents: [
            'MQTT Broker / IoT Hub',
            'Device Registry & Management',
            'Time-Series Database',
            'Rules Engine',
            'OTA Update System',
            'Edge Computing Nodes'
        ],
        architecturePatterns: [
            'Device shadow/digital twin',
            'OTA updates with rollback',
            'Edge computing for local processing',
            'Time-series optimization',
            'Command and control pattern'
        ],
        referenceClients: [
            'Tesla: Vehicle telemetry, OTA updates',
            'Ring: Video streaming, edge processing',
            'Nest: Smart home, real-time control',
            'John Deere: Agricultural IoT, fleet management'
        ],
        regulatoryRequirements: ['IoT security standards', 'Data privacy', 'Industry-specific'],
        performanceTargets: {
            latency: '<1s for commands',
            throughput: 'Millions of devices',
            availability: '99.9%'
        },
        costOptimization: [
            'Edge processing to reduce cloud data transfer',
            'Time-series database with data retention policies',
            'Spot instances for batch analytics',
            'Intelligent tiering for telemetry data',
            'Connection pooling for MQTT'
        ],
        securityPriorities: [
            'Device authentication (X.509 certificates)',
            'Encrypted communication (TLS)',
            'Secure boot and firmware signing',
            'Network segmentation',
            'Regular security updates'
        ],
        dataPatterns: [
            'Telemetry streams (high volume)',
            'Device metadata and state',
            'Commands and responses',
            'Firmware binaries',
            'Historical analytics'
        ],
        scalingStrategy: 'Connection-based scaling for brokers, throughput-based for stream processing, edge computing to reduce cloud load'
    },

    'gaming': {
        name: 'Gaming & Interactive Entertainment',
        criticalComponents: [
            'Game Server Fleet',
            'Matchmaking Service',
            'Leaderboard System',
            'Asset CDN',
            'Player Profile Service',
            'Anti-cheat System'
        ],
        architecturePatterns: [
            'Lobby and matchmaking queues',
            'State synchronization',
            'Session affinity',
            'Leaderboard with Redis sorted sets',
            'Asset versioning and CDN'
        ],
        referenceClients: [
            'Epic Games: Fortnite, global scale',
            'Riot Games: League of Legends, low-latency',
            'Roblox: User-generated content platform',
            'Unity: Game engine and multiplayer services'
        ],
        regulatoryRequirements: ['COPPA (children)', 'GDPR', 'Regional gaming laws'],
        performanceTargets: {
            latency: '<50ms for competitive games',
            throughput: 'Millions of concurrent players',
            availability: '99.95%'
        },
        costOptimization: [
            'Spot instances for game servers (with graceful shutdown)',
            'Regional fleet scaling based on player concurrency',
            'CDN for game assets and patches',
            'Auto-scaling with player-based metrics',
            'Reserved instances for core services'
        ],
        securityPriorities: [
            'DDoS protection (critical for competitive)',
            'Anti-cheat integration',
            'Player data encryption',
            'Secure matchmaking',
            'Bot detection'
        ],
        dataPatterns: [
            'Player profiles and progression',
            'Match history and replays',
            'Real-time game state (in-memory)',
            'Analytics events (high volume)',
            'Leaderboards and rankings'
        ],
        scalingStrategy: 'Regional fleet scaling based on player concurrency, session affinity for game servers, global CDN for assets'
    }
};

export const COMPLIANCE_REQUIREMENTS: Record<string, {
    name: string;
    requirements: string[];
    architectureImpact: string[];
    validationCriteria: string[];
}> = {
    'pci-dss': {
        name: 'Payment Card Industry Data Security Standard',
        requirements: [
            'Cardholder data protection',
            'Network segmentation',
            'Vulnerability management',
            'Access restriction',
            'Regular security testing'
        ],
        architectureImpact: [
            'Tokenization service (reduce PCI scope)',
            'WAF with PCI ruleset',
            'Private subnets for cardholder data',
            'HSM for key management',
            'Quarterly vulnerability scans'
        ],
        validationCriteria: [
            'No storage of CVV/PIN',
            'Encryption of cardholder data at rest',
            'Secure transmission (TLS 1.2+)',
            'Access logs for all cardholder data access',
            'Regular penetration testing'
        ]
    },
    'hipaa': {
        name: 'Health Insurance Portability and Accountability Act',
        requirements: [
            'PHI encryption',
            'Audit trails',
            'Access controls',
            'BAA with providers',
            'Breach notification'
        ],
        architectureImpact: [
            'Dedicated tenancy options',
            'Field-level encryption for PHI',
            'VPN/Private Link for provider access',
            'HIPAA-eligible services only',
            'Immutable audit logs'
        ],
        validationCriteria: [
            'BAA signed with cloud provider',
            'Encryption at rest (AES-256)',
            'Encryption in transit (TLS 1.2+)',
            'Audit logs retained for 6 years',
            'Access controls with MFA'
        ]
    },
    'gdpr': {
        name: 'General Data Protection Regulation',
        requirements: [
            'Data residency in EU',
            'Right to erasure',
            'Consent management',
            'Data portability',
            'Breach notification (72 hours)'
        ],
        architectureImpact: [
            'EU-only regions for PII',
            'Soft delete with purge jobs',
            'Consent service',
            'Export API endpoints',
            'Data classification and tagging'
        ],
        validationCriteria: [
            'PII stored in EU regions only',
            'Consent recorded and auditable',
            'Data export in machine-readable format',
            'Deletion within 30 days of request',
            'Breach detection and notification system'
        ]
    },
    'soc2': {
        name: 'Service Organization Control 2',
        requirements: [
            'Audit logging',
            'Access controls',
            'Encryption at rest/transit',
            'Incident response',
            'Change management'
        ],
        architectureImpact: [
            'Centralized logging with immutable storage',
            'IAM with MFA',
            'KMS integration',
            'Monitoring dashboards',
            'Infrastructure as Code'
        ],
        validationCriteria: [
            'All access logged and monitored',
            'Encryption for data at rest and in transit',
            'Incident response plan documented',
            'Change management process',
            'Regular security audits'
        ]
    }
};

export const REFERENCE_ARCHITECTURES = {
    'three-tier-web-app': {
        name: 'Three-Tier Web Application',
        description: 'Classic web application with presentation, application, and data tiers',
        useCases: ['E-commerce', 'SaaS', 'Content Management', 'Corporate websites'],
        components: [
            'CDN (CloudFront/Azure CDN/Cloud CDN)',
            'Load Balancer (ALB/Azure LB/Cloud Load Balancing)',
            'Web Tier (EC2/VMs/Compute Engine)',
            'Application Tier (ECS/AKS/GKE)',
            'Database Tier (RDS/Azure SQL/Cloud SQL)',
            'Cache Layer (ElastiCache/Azure Cache/Memorystore)'
        ],
        scalability: 'Horizontal scaling at each tier, auto-scaling groups',
        complexity: 'Low to Medium',
        estimatedCost: '$500-5000/month depending on scale'
    },
    'microservices-kubernetes': {
        name: 'Microservices on Kubernetes',
        description: 'Container-based microservices architecture with service mesh',
        useCases: ['Large-scale SaaS', 'API platforms', 'Multi-tenant applications'],
        components: [
            'Kubernetes Cluster (EKS/AKS/GKE)',
            'Service Mesh (Istio/Linkerd)',
            'API Gateway (Kong/Ambassador)',
            'Message Queue (SQS/Service Bus/Pub/Sub)',
            'Database per Service',
            'Observability Stack (Prometheus/Grafana)'
        ],
        scalability: 'Highly scalable, horizontal pod autoscaling',
        complexity: 'High',
        estimatedCost: '$2000-20000/month depending on scale'
    },
    'serverless-event-driven': {
        name: 'Serverless Event-Driven Architecture',
        description: 'Fully serverless architecture with event-driven patterns',
        useCases: ['APIs', 'Data processing', 'Webhooks', 'Scheduled jobs'],
        components: [
            'API Gateway',
            'Lambda Functions/Azure Functions/Cloud Functions',
            'Event Bus (EventBridge/Event Grid/Eventarc)',
            'Serverless Database (DynamoDB/Cosmos DB/Firestore)',
            'Object Storage (S3/Blob Storage/Cloud Storage)'
        ],
        scalability: 'Automatic, pay-per-use',
        complexity: 'Medium',
        estimatedCost: '$100-2000/month depending on usage'
    }
};
