/**
 * Architecture Validation Engine
 * Validates generated architectures against requirements and best practices
 */

import { Architecture, Requirements } from '@/types/architecture';

export interface ValidationResult {
    isValid: boolean;
    score: number; // 0-100
    errors: ValidationError[];
    warnings: ValidationWarning[];
    recommendations: string[];
}

export interface ValidationError {
    category: string;
    message: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ValidationWarning {
    category: string;
    message: string;
    impact: string;
}

export class ArchitectureValidator {
    /**
     * Validate architecture against requirements
     */
    static validate(architecture: Architecture, requirements: Requirements): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const recommendations: string[] = [];

        // Cost validation
        const costValidation = this.validateCosts(architecture, requirements);
        errors.push(...costValidation.errors);
        warnings.push(...costValidation.warnings);

        // Performance validation
        const perfValidation = this.validatePerformance(architecture, requirements);
        errors.push(...perfValidation.errors);
        warnings.push(...perfValidation.warnings);

        // Security validation
        const secValidation = this.validateSecurity(architecture, requirements);
        errors.push(...secValidation.errors);
        warnings.push(...secValidation.warnings);
        recommendations.push(...secValidation.recommendations);

        // Compliance validation
        const compValidation = this.validateCompliance(architecture, requirements);
        errors.push(...compValidation.errors);
        warnings.push(...compValidation.warnings);

        // Calculate overall score
        const score = this.calculateScore(errors, warnings);

        return {
            isValid: errors.filter(e => e.severity === 'critical').length === 0,
            score,
            errors,
            warnings,
            recommendations
        };
    }

    /**
     * Validate costs
     */
    private static validateCosts(architecture: Architecture, requirements: Requirements) {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Check if total cost is within budget
        const avgCost = (architecture.totalCosts.aws + architecture.totalCosts.azure +
            architecture.totalCosts.gcp + architecture.totalCosts.oci) / 4;

        if (avgCost > requirements.budgetMax) {
            errors.push({
                category: 'Cost',
                message: `Average cost $${avgCost}/mo exceeds budget max $${requirements.budgetMax}/mo`,
                severity: 'high'
            });
        }

        if (avgCost < requirements.budgetMin * 0.5) {
            warnings.push({
                category: 'Cost',
                message: `Cost is significantly under budget - may be under-provisioned`,
                impact: 'Performance or reliability may be compromised'
            });
        }

        // Validate component costs sum to total
        const componentSum = architecture.components.reduce((sum, comp) => {
            return sum + (comp.providers.aws.monthlyCost || 0);
        }, 0);

        if (Math.abs(componentSum - architecture.totalCosts.aws) > 100) {
            errors.push({
                category: 'Cost',
                message: 'Component costs do not sum to total cost',
                severity: 'medium'
            });
        }

        return { errors, warnings };
    }

    /**
     * Validate performance
     */
    private static validatePerformance(architecture: Architecture, requirements: Requirements) {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Check for CDN if latency is critical
        if (requirements.latencyTargetMs < 200) {
            const hasCDN = architecture.components.some(c =>
                c.serviceType === 'cdn' || c.name.toLowerCase().includes('cdn')
            );
            if (!hasCDN) {
                warnings.push({
                    category: 'Performance',
                    message: 'No CDN detected for low-latency requirement',
                    impact: 'Global users may experience higher latency'
                });
            }
        }

        // Check for caching if high RPS
        if (requirements.requestsPerSecond > 1000) {
            const hasCache = architecture.components.some(c =>
                c.serviceType === 'cache' || c.name.toLowerCase().includes('cache')
            );
            if (!hasCache) {
                warnings.push({
                    category: 'Performance',
                    message: 'No caching layer for high RPS workload',
                    impact: 'Database may become bottleneck'
                });
            }
        }

        // Check for load balancer
        const hasLB = architecture.components.some(c =>
            c.name.toLowerCase().includes('load balancer') ||
            c.name.toLowerCase().includes('alb') ||
            c.serviceType === 'networking'
        );
        if (!hasLB && requirements.expectedUsers > 10000) {
            warnings.push({
                category: 'Performance',
                message: 'No load balancer detected for high-traffic application',
                impact: 'May not distribute load effectively'
            });
        }

        return { errors, warnings };
    }

    /**
     * Validate security
     */
    private static validateSecurity(architecture: Architecture, requirements: Requirements) {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const recommendations: string[] = [];

        // Check for security components based on compliance
        if (requirements.compliance.length > 0) {
            const hasWAF = architecture.components.some(c =>
                c.name.toLowerCase().includes('waf') || c.name.toLowerCase().includes('firewall')
            );
            if (!hasWAF) {
                warnings.push({
                    category: 'Security',
                    message: 'No WAF/Firewall for compliance requirements',
                    impact: 'May not meet security compliance standards'
                });
                recommendations.push('Add WAF (AWS WAF, Azure Firewall, Cloud Armor) for DDoS protection and application security');
            }

            // Check for encryption mentions in assumptions
            const hasEncryption = architecture.assumptions.some(a =>
                a.toLowerCase().includes('encrypt')
            );
            if (!hasEncryption) {
                warnings.push({
                    category: 'Security',
                    message: 'No encryption mentioned in assumptions',
                    impact: 'May not meet compliance encryption requirements'
                });
                recommendations.push('Ensure encryption at rest (AES-256) and in transit (TLS 1.2+)');
            }
        }

        // Check for monitoring
        const hasMonitoring = architecture.components.some(c =>
            c.serviceType === 'monitoring' ||
            c.name.toLowerCase().includes('monitor') ||
            c.name.toLowerCase().includes('cloudwatch') ||
            c.name.toLowerCase().includes('prometheus')
        );
        if (!hasMonitoring) {
            recommendations.push('Add monitoring and alerting (CloudWatch, Azure Monitor, Cloud Monitoring)');
        }

        return { errors, warnings, recommendations };
    }

    /**
     * Validate compliance
     */
    private static validateCompliance(architecture: Architecture, requirements: Requirements) {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        requirements.compliance.forEach(comp => {
            const compLower = comp.toLowerCase();

            if (compLower.includes('pci')) {
                // Check for tokenization or payment gateway
                const hasPaymentGateway = architecture.components.some(c =>
                    c.name.toLowerCase().includes('stripe') ||
                    c.name.toLowerCase().includes('payment') ||
                    c.name.toLowerCase().includes('tokeniz')
                );
                if (!hasPaymentGateway) {
                    warnings.push({
                        category: 'Compliance',
                        message: 'PCI-DSS: Consider using payment gateway (Stripe) to reduce PCI scope',
                        impact: 'Full PCI compliance is complex and expensive'
                    });
                }
            }

            if (compLower.includes('hipaa')) {
                // Check for audit logging
                const hasAuditLog = architecture.assumptions.some(a =>
                    a.toLowerCase().includes('audit') || a.toLowerCase().includes('log')
                );
                if (!hasAuditLog) {
                    warnings.push({
                        category: 'Compliance',
                        message: 'HIPAA: Audit logging not explicitly mentioned',
                        impact: 'Required for HIPAA compliance'
                    });
                }
            }

            if (compLower.includes('gdpr')) {
                // Check for EU region
                const hasEURegion = requirements.regions.some(r =>
                    r.toLowerCase().includes('eu') || r.toLowerCase().includes('europe')
                );
                if (!hasEURegion) {
                    warnings.push({
                        category: 'Compliance',
                        message: 'GDPR: No EU region specified for data residency',
                        impact: 'GDPR requires EU data to stay in EU'
                    });
                }
            }
        });

        return { errors, warnings };
    }

    /**
     * Calculate overall score
     */
    private static calculateScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
        let score = 100;

        errors.forEach(e => {
            switch (e.severity) {
                case 'critical': score -= 25; break;
                case 'high': score -= 15; break;
                case 'medium': score -= 10; break;
                case 'low': score -= 5; break;
            }
        });

        warnings.forEach(() => {
            score -= 3;
        });

        return Math.max(0, score);
    }

    /**
     * Get Well-Architected Framework assessment
     */
    static assessWellArchitected(architecture: Architecture): {
        operationalExcellence: number;
        security: number;
        reliability: number;
        performanceEfficiency: number;
        costOptimization: number;
        sustainability: number;
        overall: number;
    } {
        // Simplified assessment based on architecture components
        const hasMonitoring = architecture.components.some(c => c.serviceType === 'monitoring');
        const hasCache = architecture.components.some(c => c.serviceType === 'cache');
        const hasCDN = architecture.components.some(c => c.serviceType === 'cdn');
        const hasAutoScaling = architecture.assumptions.some(a => a.toLowerCase().includes('auto-scal'));
        const hasMultiAZ = architecture.assumptions.some(a => a.toLowerCase().includes('multi-az') || a.toLowerCase().includes('multi-region'));
        const hasBackup = architecture.assumptions.some(a => a.toLowerCase().includes('backup'));

        const operationalExcellence = (hasMonitoring ? 40 : 0) + (hasAutoScaling ? 30 : 0) + 30;
        const security = 70; // Base score, would need more detailed analysis
        const reliability = (hasMultiAZ ? 40 : 0) + (hasBackup ? 30 : 0) + 30;
        const performanceEfficiency = (hasCache ? 30 : 0) + (hasCDN ? 30 : 0) + 40;
        const costOptimization = architecture.variant === 'cost-optimized' ? 90 : architecture.variant === 'balanced' ? 75 : 60;
        const sustainability = hasAutoScaling ? 80 : 60;

        const overall = Math.round((operationalExcellence + security + reliability + performanceEfficiency + costOptimization + sustainability) / 6);

        return {
            operationalExcellence,
            security,
            reliability,
            performanceEfficiency,
            costOptimization,
            sustainability,
            overall
        };
    }
}
