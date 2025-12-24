/**
 * Advanced Prompt Engineering System
 * Implements industry best practices for LLM prompting with context engineering
 */

import { Requirements } from '@/types/architecture';
import { INDUSTRY_PATTERNS, COMPLIANCE_REQUIREMENTS, REFERENCE_ARCHITECTURES } from './industryPatterns';

export interface PromptContext {
    industry: any;
    scale: any;
    compliance: any[];
    cost: any;
    performance: any;
    references: any[];
    bestPractices: string[];
}

export class PromptEngineer {
    /**
     * Generate optimized prompt with advanced techniques
     */
    static generateEnhancedPrompt(requirements: Requirements): string {
        const context = this.buildContext(requirements);
        const systemPrompt = this.getSystemPrompt();
        const fewShotExamples = this.getFewShotExamples(requirements.appType);
        const chainOfThought = this.getChainOfThoughtPrompt();
        const validation = this.getValidationCriteria();

        return this.assemblePrompt({
            system: systemPrompt,
            context,
            examples: fewShotExamples,
            requirements,
            chainOfThought,
            validation
        });
    }

    /**
     * Build comprehensive context for architecture generation
     */
    private static buildContext(requirements: Requirements): PromptContext {
        const industry = INDUSTRY_PATTERNS[requirements.appType] || INDUSTRY_PATTERNS['saas'];

        return {
            industry,
            scale: this.getScaleContext(requirements),
            compliance: requirements.compliance.map(c => COMPLIANCE_REQUIREMENTS[c]).filter(Boolean),
            cost: this.getCostContext(requirements),
            performance: this.getPerformanceContext(requirements),
            references: this.getReferenceArchitectures(requirements.appType),
            bestPractices: this.getBestPractices(requirements)
        };
    }

    /**
     * System prompt with role definition and expertise
     */
    private static getSystemPrompt(): string {
        return `You are SolsArch AI, a senior cloud solutions architect with exceptional credentials:

## CREDENTIALS & EXPERIENCE
- 15+ years at AWS, Google Cloud, and Microsoft Azure
- AWS Solutions Architect Professional, GCP Professional Cloud Architect
- Designed 500+ production systems for Fortune 500 companies
- Clients include: Netflix, Airbnb, Uber, Stripe, Spotify, DoorDash
- Specialized in: FinTech, HealthTech, E-commerce, AI/ML, Gaming, IoT

## EXPERTISE AREAS
- Multi-cloud architecture (AWS, Azure, GCP, OCI)
- Cost optimization ($100M+ saved for clients)
- Compliance (SOC2, HIPAA, PCI-DSS, GDPR, DPDP, ISO 27001)
- High-scale systems (millions of requests per second)
- GPU clusters for AI/ML workloads
- Zero-downtime migrations
- Well-Architected Framework (all 6 pillars)

## YOUR APPROACH
- **Data-Driven**: Every decision backed by metrics and benchmarks
- **Risk-Aware**: Identify and mitigate risks proactively
- **Cost-Conscious**: Optimize for value, not just lowest price
- **Security-First**: Security by design, not as an afterthought
- **Pragmatic**: Production-ready over perfect
- **Transparent**: Explain reasoning and trade-offs clearly

## QUALITY STANDARDS
- Architectures must be production-ready (not theoretical)
- Cost estimates must be accurate (within 10% of actual)
- Recommendations must be actionable and specific
- Trade-offs must be explicit and justified
- Compliance requirements must be addressed
- Performance targets must be achievable`;
    }

    /**
     * Few-shot learning examples
     */
    private static getFewShotExamples(appType: string): string {
        const examples = {
            'fintech': `
## EXAMPLE: FinTech Payment Platform

**Input**: "Payment processing platform, 500k users, 5000 TPS, PCI-DSS, $15k budget"

**Architecture**:
- **Frontend**: CloudFront + S3 (static), ECS Fargate (API)
- **Payment Processing**: Lambda (serverless, auto-scales)
- **Transaction DB**: Aurora PostgreSQL (ACID compliance)
- **Fraud Detection**: SageMaker (real-time ML inference)
- **Audit Logs**: S3 + Athena (immutable, queryable)
- **Tokenization**: Stripe (reduces PCI scope)

**Reasoning**:
- Serverless Lambda handles variable TPS without over-provisioning
- Aurora provides ACID guarantees for financial transactions
- Stripe tokenization removes PCI burden from infrastructure
- SageMaker enables real-time fraud detection (<100ms)
- Immutable S3 logs satisfy audit requirements

**Cost**: $14,200/month
- Compute: $6,000 (ECS + Lambda)
- Database: $5,500 (Aurora)
- ML: $2,000 (SageMaker)
- Storage: $700 (S3 + backups)

**Compliance**: PCI-DSS Level 1 compliant (via Stripe), SOC2 Type II ready`,

            'e-commerce': `
## EXAMPLE: E-commerce Platform

**Input**: "E-commerce site, 1M users, Black Friday ready, $8k budget"

**Architecture**:
- **CDN**: CloudFront (global, 200+ edge locations)
- **Frontend**: S3 + CloudFront (static site)
- **API**: API Gateway + Lambda (serverless)
- **Product Catalog**: DynamoDB (NoSQL, auto-scales)
- **Search**: OpenSearch (Elasticsearch)
- **Cache**: ElastiCache Redis (product + session)
- **Payments**: Stripe (PCI-DSS compliant)

**Reasoning**:
- Serverless architecture handles 10x traffic spikes automatically
- DynamoDB provides unlimited scalability for catalog
- Redis caching reduces database load by 80%
- CloudFront serves static content from edge (fast global delivery)
- Stripe handles PCI compliance

**Cost**: $7,800/month (base), $25k during Black Friday week
- CDN: $2,000 ($8k peak)
- Compute: $3,000 ($12k peak)
- Database: $1,500 ($3k peak)
- Cache: $800 ($1.5k peak)
- Search: $500 ($1k peak)

**Scalability**: Pre-warm cache, increase Lambda concurrency limits, DynamoDB on-demand mode`
        };

        return examples[appType] || examples['fintech'];
    }

    /**
     * Chain-of-thought reasoning prompt
     */
    private static getChainOfThoughtPrompt(): string {
        return `
## REASONING PROCESS (Think Step-by-Step)

Before generating the architecture, analyze:

### STEP 1: WORKLOAD ANALYSIS
- What type of workload? (compute-intensive, data-intensive, I/O-intensive)
- Traffic pattern? (steady, spiky, seasonal, time-of-day)
- Data access pattern? (read-heavy, write-heavy, mixed)
- State requirements? (stateless, stateful, session-based)

### STEP 2: CONSTRAINTS IDENTIFICATION
**Hard Constraints** (must satisfy):
- Budget: ${requirements.budgetMin}-${requirements.budgetMax}/month
- Latency: <${requirements.latencyTargetMs}ms
- Availability: ${requirements.availabilitySLA}%
- Compliance: ${requirements.compliance.join(', ') || 'None'}

**Soft Constraints** (preferences):
- Team skills and operational capability
- Vendor preferences
- Technology stack familiarity

### STEP 3: COMPONENT SELECTION
For each component, justify:
- **Why this service?** (specific reasoning)
- **Alternatives considered?** (and why rejected)
- **Cost implication?** (with calculations)
- **Operational complexity?** (team can manage?)
- **Failure modes?** (what breaks and how to handle)

### STEP 4: VALIDATION
- ✓ Meets latency requirement? (calculate end-to-end)
- ✓ Achieves availability SLA? (redundancy sufficient?)
- ✓ Within budget? (sum all costs)
- ✓ Compliant? (all regulations addressed)
- ✓ Scalable? (handles 10x growth)
- ✓ Operable? (team can manage)

### STEP 5: OPTIMIZATION
- Can we use serverless to reduce costs?
- Are there managed services to reduce ops burden?
- Can we use spot/preemptible instances?
- Is there a cheaper region with acceptable latency?
- Can we cache more aggressively?
- Are there reserved instance opportunities?

**Show your reasoning for each step.**`;
    }

    /**
     * Validation criteria
     */
    private static getValidationCriteria(): string {
        return `
## VALIDATION CHECKLIST

Before finalizing, verify:

### COST VALIDATION
✓ Sum of component costs = total cost (no math errors)
✓ Costs are realistic (2024-2025 pricing)
✓ Hidden costs included (data transfer, support, training)
✓ Within budget range (${requirements.budgetMin}-${requirements.budgetMax})
✓ Cost breakdown by category provided

### TECHNICAL VALIDATION
✓ Can handle ${requirements.requestsPerSecond} RPS
✓ Meets <${requirements.latencyTargetMs}ms latency (p99)
✓ Achieves ${requirements.availabilitySLA}% SLA
✓ Scales to ${requirements.expectedUsers * 10} users (10x growth)
✓ Data size ${requirements.dataSizeGB}GB accommodated

### COMPLIANCE VALIDATION
${requirements.compliance.map(c => `✓ ${c.toUpperCase()} requirements addressed`).join('\n')}
✓ Security controls in place
✓ Audit logging enabled
✓ Encryption at rest and in transit

### OPERATIONAL VALIDATION
✓ Monitoring and alerting included
✓ Backup and disaster recovery planned
✓ Deployment automation possible
✓ Scalability path clear
✓ Team can operate (not too complex)

### QUALITY CHECKS
✓ All providers have equivalent capability
✓ Assumptions are specific (not generic)
✓ Trade-offs explain WHAT you sacrifice and WHY
✓ Diagram accurately represents architecture
✓ Recommendations are actionable

**If any validation fails, revise the architecture.**`;
    }

    /**
     * Assemble final prompt
     */
    private static assemblePrompt(params: {
        system: string;
        context: PromptContext;
        examples: string;
        requirements: Requirements;
        chainOfThought: string;
        validation: string;
    }): string {
        const { system, context, examples, requirements, chainOfThought, validation } = params;

        return `${system}

## INDUSTRY CONTEXT: ${context.industry.name}

### Critical Components for ${context.industry.name}
${context.industry.criticalComponents.map((c: string) => `- ${c}`).join('\n')}

### Architecture Patterns
${context.industry.architecturePatterns.map((p: string) => `- ${p}`).join('\n')}

### Reference Clients (Learn from the best)
${context.industry.referenceClients.map((r: string) => `- ${r}`).join('\n')}

### Performance Targets
- Latency: ${context.industry.performanceTargets.latency}
${context.industry.performanceTargets.throughput ? `- Throughput: ${context.industry.performanceTargets.throughput}` : ''}
${context.industry.performanceTargets.availability ? `- Availability: ${context.industry.performanceTargets.availability}` : ''}

### Cost Optimization Strategies
${context.industry.costOptimization.map((s: string) => `- ${s}`).join('\n')}

### Security Priorities
${context.industry.securityPriorities.map((s: string) => `- ${s}`).join('\n')}

${context.compliance.length > 0 ? `
## COMPLIANCE REQUIREMENTS
${context.compliance.map((c: any) => `
### ${c.name}
**Requirements**: ${c.requirements.join(', ')}
**Architecture Impact**: ${c.architectureImpact.join(', ')}
**Validation**: ${c.validationCriteria.join(', ')}
`).join('\n')}
` : ''}

${examples}

${chainOfThought}

## YOUR TASK

Design 3 production-ready architecture variants for:

**Requirements**:
- App Type: ${requirements.appType}
- Scale: ${requirements.expectedUsers.toLocaleString()} users, ${requirements.requestsPerSecond} RPS
- Data: ${requirements.dataSizeGB} GB
- Performance: <${requirements.latencyTargetMs}ms latency, ${requirements.availabilitySLA}% SLA
- Regions: ${requirements.regions.join(', ')}
- Compliance: ${requirements.compliance.join(', ') || 'None'}
- Budget: $${requirements.budgetMin.toLocaleString()}-$${requirements.budgetMax.toLocaleString()}/month
${requirements.additionalNotes ? `- Notes: ${requirements.additionalNotes}` : ''}

${validation}

Return ONLY valid JSON with the exact structure specified in the system prompt. No markdown formatting.`;
    }

    /**
     * Helper methods for context building
     */
    private static getScaleContext(requirements: Requirements) {
        const rps = requirements.requestsPerSecond;
        const users = requirements.expectedUsers;

        return {
            tier: users < 10000 ? 'small' : users < 100000 ? 'medium' : users < 1000000 ? 'large' : 'enterprise',
            estimatedDailyRequests: Math.ceil(rps * 86400 * 0.3),
            estimatedMonthlyRequests: Math.ceil(rps * 86400 * 30 * 0.3),
            minInstances: Math.ceil(rps / 100),
            dataFootprint: {
                primary: requirements.dataSizeGB,
                withIndexes: Math.ceil(requirements.dataSizeGB * 1.3),
                withBackups: Math.ceil(requirements.dataSizeGB * 2)
            }
        };
    }

    private static getCostContext(requirements: Requirements) {
        const budget = (requirements.budgetMin + requirements.budgetMax) / 2;
        return {
            range: `$${requirements.budgetMin}-$${requirements.budgetMax}`,
            target: budget,
            perUser: (budget / requirements.expectedUsers * 1000).toFixed(2),
            strategy: budget < 2000 ? 'Maximum cost efficiency, serverless preferred' :
                budget < 10000 ? 'Balance cost and performance' :
                    'Performance-first with reserved capacity'
        };
    }

    private static getPerformanceContext(requirements: Requirements) {
        return {
            latencyBudget: {
                total: requirements.latencyTargetMs,
                compute: Math.ceil(requirements.latencyTargetMs * 0.4),
                database: Math.ceil(requirements.latencyTargetMs * 0.3),
                network: Math.ceil(requirements.latencyTargetMs * 0.3)
            },
            availability: {
                target: requirements.availabilitySLA,
                downtimePerYear: ((100 - requirements.availabilitySLA) * 525600 / 100).toFixed(1) + ' minutes',
                redundancy: requirements.availabilitySLA >= 99.99 ? 'Multi-region active-active' :
                    requirements.availabilitySLA >= 99.9 ? 'Multi-AZ with hot standby' :
                        'Multi-AZ with auto-failover'
            }
        };
    }

    private static getReferenceArchitectures(appType: string) {
        return Object.values(REFERENCE_ARCHITECTURES).filter(arch =>
            arch.useCases.some(uc => uc.toLowerCase().includes(appType.toLowerCase()))
        );
    }

    private static getBestPractices(requirements: Requirements): string[] {
        const practices = [
            'Use Infrastructure as Code (Terraform/CloudFormation)',
            'Implement monitoring and alerting from day 1',
            'Enable auto-scaling for variable workloads',
            'Use managed services to reduce operational burden',
            'Implement proper backup and disaster recovery',
            'Follow principle of least privilege for IAM',
            'Enable encryption at rest and in transit',
            'Use CDN for static content and global distribution',
            'Implement proper logging and audit trails',
            'Plan for failure - design for resilience'
        ];

        if (requirements.compliance.length > 0) {
            practices.push('Document compliance controls and evidence');
            practices.push('Implement automated compliance checking');
        }

        if (requirements.availabilitySLA >= 99.9) {
            practices.push('Implement multi-AZ deployment');
            practices.push('Use health checks and auto-recovery');
        }

        return practices;
    }
}
