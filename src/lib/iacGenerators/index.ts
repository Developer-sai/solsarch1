// IaC Generator Factory
// Exports all generators with a unified interface

export { generateTerraform, type IaCGeneratorOptions, type IaCOutput } from './terraformGenerator';
export { generateCloudFormation, type CloudFormationOutput } from './cloudformationGenerator';
export { generateARMTemplate, type ARMTemplateOutput } from './armGenerator';
export { generateKubernetes, type KubernetesOutput } from './kubernetesGenerator';
export { generateDockerCompose, type DockerComposeOutput } from './dockerComposeGenerator';

import { Architecture } from '@/types/architecture';
import { generateTerraform, IaCGeneratorOptions, IaCOutput } from './terraformGenerator';
import { generateCloudFormation, CloudFormationOutput } from './cloudformationGenerator';
import { generateARMTemplate, ARMTemplateOutput } from './armGenerator';
import { generateKubernetes, KubernetesOutput } from './kubernetesGenerator';
import { generateDockerCompose, DockerComposeOutput } from './dockerComposeGenerator';

export type IaCFormat = 'terraform' | 'cloudformation' | 'arm' | 'kubernetes' | 'docker-compose';

export type GeneratedOutput = IaCOutput | CloudFormationOutput | ARMTemplateOutput | KubernetesOutput | DockerComposeOutput;

export interface GeneratorConfig {
    format: IaCFormat;
    provider: 'aws' | 'azure' | 'gcp' | 'oci';
    region: string;
    projectName: string;
    environment: 'dev' | 'staging' | 'prod';
}

/**
 * Generate Infrastructure as Code files for an architecture
 */
export function generateIaC(architecture: Architecture, config: GeneratorConfig): GeneratedOutput[] {
    const { format, provider, region, projectName, environment } = config;

    switch (format) {
        case 'terraform':
            return generateTerraform(architecture, {
                provider,
                region,
                projectName,
                environment
            });

        case 'cloudformation':
            if (provider !== 'aws') {
                throw new Error('CloudFormation is only supported for AWS');
            }
            return generateCloudFormation(architecture, projectName, environment);

        case 'arm':
            if (provider !== 'azure') {
                throw new Error('ARM templates are only supported for Azure');
            }
            return generateARMTemplate(architecture, projectName, environment);

        case 'kubernetes':
            return generateKubernetes(architecture, projectName, environment);

        case 'docker-compose':
            return generateDockerCompose(architecture, projectName, environment);

        default:
            throw new Error(`Unsupported IaC format: ${format}`);
    }
}

/**
 * Get the file extension for a given IaC format
 */
export function getIaCFileExtension(format: IaCFormat): string {
    switch (format) {
        case 'terraform':
            return 'tf';
        case 'cloudformation':
            return 'yaml';
        case 'arm':
            return 'json';
        case 'kubernetes':
            return 'yaml';
        case 'docker-compose':
            return 'yml';
        default:
            return 'txt';
    }
}

/**
 * Get the primary language for syntax highlighting
 */
export function getIaCLanguage(format: IaCFormat): string {
    switch (format) {
        case 'terraform':
            return 'hcl';
        case 'cloudformation':
            return 'yaml';
        case 'arm':
            return 'json';
        case 'kubernetes':
            return 'yaml';
        case 'docker-compose':
            return 'yaml';
        default:
            return 'text';
    }
}

/**
 * Get display name for IaC format
 */
export function getIaCDisplayName(format: IaCFormat): string {
    switch (format) {
        case 'terraform':
            return 'Terraform';
        case 'cloudformation':
            return 'AWS CloudFormation';
        case 'arm':
            return 'Azure ARM Template';
        case 'kubernetes':
            return 'Kubernetes YAML';
        case 'docker-compose':
            return 'Docker Compose';
        default:
            return format;
    }
}

/**
 * Get all supported IaC formats
 */
export function getSupportedFormats(): { id: IaCFormat; name: string; providers: string[] }[] {
    return [
        { id: 'terraform', name: 'Terraform', providers: ['aws', 'azure', 'gcp', 'oci'] },
        { id: 'cloudformation', name: 'AWS CloudFormation', providers: ['aws'] },
        { id: 'arm', name: 'Azure ARM Template', providers: ['azure'] },
        { id: 'kubernetes', name: 'Kubernetes YAML', providers: ['aws', 'azure', 'gcp', 'oci'] },
        { id: 'docker-compose', name: 'Docker Compose', providers: ['aws', 'azure', 'gcp', 'oci'] }
    ];
}
