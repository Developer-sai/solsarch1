import { Architecture, ArchitectureComponent } from '@/types/architecture';

export interface DockerComposeOutput {
    filename: string;
    content: string;
    language: string;
}

function sanitizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function getServiceForComponent(component: ArchitectureComponent): Record<string, unknown> | null {
    const serviceType = component.serviceType.toLowerCase();
    const name = sanitizeName(component.name);

    switch (serviceType) {
        case 'compute':
            return {
                [name]: {
                    build: {
                        context: `./${name}`,
                        dockerfile: 'Dockerfile'
                    },
                    ports: ['8080:8080'],
                    environment: [
                        'NODE_ENV=production'
                    ],
                    depends_on: [],
                    restart: 'unless-stopped',
                    networks: ['app-network'],
                    healthcheck: {
                        test: ['CMD', 'curl', '-f', 'http://localhost:8080/health'],
                        interval: '30s',
                        timeout: '10s',
                        retries: 3,
                        start_period: '40s'
                    },
                    deploy: {
                        replicas: 2,
                        resources: {
                            limits: {
                                cpus: '0.5',
                                memory: '512M'
                            },
                            reservations: {
                                cpus: '0.1',
                                memory: '128M'
                            }
                        }
                    }
                }
            };

        case 'database':
            return {
                [name]: {
                    image: 'postgres:14-alpine',
                    environment: [
                        'POSTGRES_USER=admin',
                        'POSTGRES_PASSWORD=${DB_PASSWORD:-changeme}',
                        `POSTGRES_DB=${name}`
                    ],
                    volumes: [
                        `${name}-data:/var/lib/postgresql/data`
                    ],
                    ports: ['5432:5432'],
                    restart: 'unless-stopped',
                    networks: ['app-network'],
                    healthcheck: {
                        test: ['CMD-SHELL', 'pg_isready -U admin'],
                        interval: '10s',
                        timeout: '5s',
                        retries: 5
                    }
                }
            };

        case 'cache':
            return {
                [name]: {
                    image: 'redis:7-alpine',
                    command: 'redis-server --appendonly yes',
                    volumes: [
                        `${name}-data:/data`
                    ],
                    ports: ['6379:6379'],
                    restart: 'unless-stopped',
                    networks: ['app-network'],
                    healthcheck: {
                        test: ['CMD', 'redis-cli', 'ping'],
                        interval: '10s',
                        timeout: '5s',
                        retries: 5
                    }
                }
            };

        case 'queue':
            return {
                [name]: {
                    image: 'rabbitmq:3-management-alpine',
                    environment: [
                        'RABBITMQ_DEFAULT_USER=admin',
                        'RABBITMQ_DEFAULT_PASS=${RABBITMQ_PASSWORD:-changeme}'
                    ],
                    volumes: [
                        `${name}-data:/var/lib/rabbitmq`
                    ],
                    ports: [
                        '5672:5672',
                        '15672:15672'
                    ],
                    restart: 'unless-stopped',
                    networks: ['app-network'],
                    healthcheck: {
                        test: ['CMD', 'rabbitmq-diagnostics', 'check_running'],
                        interval: '30s',
                        timeout: '10s',
                        retries: 5
                    }
                }
            };

        case 'storage':
            return {
                [name]: {
                    image: 'minio/minio:latest',
                    command: 'server /data --console-address ":9001"',
                    environment: [
                        'MINIO_ROOT_USER=admin',
                        'MINIO_ROOT_PASSWORD=${MINIO_PASSWORD:-changeme123}'
                    ],
                    volumes: [
                        `${name}-data:/data`
                    ],
                    ports: [
                        '9000:9000',
                        '9001:9001'
                    ],
                    restart: 'unless-stopped',
                    networks: ['app-network'],
                    healthcheck: {
                        test: ['CMD', 'curl', '-f', 'http://localhost:9000/minio/health/live'],
                        interval: '30s',
                        timeout: '10s',
                        retries: 3
                    }
                }
            };

        case 'cdn':
        case 'networking':
            return {
                nginx: {
                    image: 'nginx:alpine',
                    volumes: [
                        './nginx/nginx.conf:/etc/nginx/nginx.conf:ro',
                        './nginx/conf.d:/etc/nginx/conf.d:ro'
                    ],
                    ports: [
                        '80:80',
                        '443:443'
                    ],
                    restart: 'unless-stopped',
                    networks: ['app-network'],
                    depends_on: []
                }
            };

        default:
            return null;
    }
}

export function generateDockerCompose(architecture: Architecture, projectName: string, environment: string): DockerComposeOutput[] {
    const outputs: DockerComposeOutput[] = [];

    const services: Record<string, unknown> = {};
    const volumes: Record<string, unknown> = {};
    const dependencies: Record<string, string[]> = {};

    // Generate services for each component
    for (const component of architecture.components) {
        const service = getServiceForComponent(component);
        if (service) {
            Object.assign(services, service);

            // Track volumes
            const name = sanitizeName(component.name);
            const serviceType = component.serviceType.toLowerCase();

            if (['database', 'cache', 'queue', 'storage'].includes(serviceType)) {
                volumes[`${name}-data`] = { driver: 'local' };
            }

            // Track dependencies
            if (serviceType === 'compute') {
                dependencies[name] = [];
            }
        }
    }

    // Update dependencies (compute services depend on database, cache, queue)
    for (const [serviceName, service] of Object.entries(services)) {
        const svc = service as Record<string, unknown>;
        if (svc.build && Array.isArray(svc.depends_on)) {
            const deps: string[] = [];
            for (const [otherName, otherService] of Object.entries(services)) {
                const other = otherService as Record<string, unknown>;
                if (otherName !== serviceName && !other.build) {
                    deps.push(otherName);
                }
            }
            svc.depends_on = deps;
        }
    }

    // Main docker-compose.yml
    const composeContent = `# Docker Compose configuration for ${architecture.name}
# Generated by SolsArch - ${new Date().toISOString()}
# Environment: ${environment}
#
# Usage:
#   docker-compose up -d
#   docker-compose logs -f
#   docker-compose down

version: '3.8'

services:
${Object.entries(services).map(([name, config]) => {
        const cfg = config as Record<string, unknown>;
        return `  ${name}:
${cfg.image ? `    image: ${cfg.image}` : ''}
${cfg.build ? `    build:
      context: ${(cfg.build as Record<string, unknown>).context}
      dockerfile: ${(cfg.build as Record<string, unknown>).dockerfile}` : ''}
${cfg.command ? `    command: ${cfg.command}` : ''}
${(cfg.environment as string[] | undefined)?.length ? `    environment:
${(cfg.environment as string[]).map(e => `      - ${e}`).join('\n')}` : ''}
${(cfg.volumes as string[] | undefined)?.length ? `    volumes:
${(cfg.volumes as string[]).map(v => `      - ${v}`).join('\n')}` : ''}
${(cfg.ports as string[] | undefined)?.length ? `    ports:
${(cfg.ports as string[]).map(p => `      - "${p}"`).join('\n')}` : ''}
${(cfg.depends_on as string[] | undefined)?.length ? `    depends_on:
${(cfg.depends_on as string[]).map(d => `      - ${d}`).join('\n')}` : ''}
    restart: ${cfg.restart || 'unless-stopped'}
    networks:
      - app-network`;
    }).join('\n\n')}

volumes:
${Object.keys(volumes).map(v => `  ${v}:
    driver: local`).join('\n')}

networks:
  app-network:
    driver: bridge
`;

    outputs.push({
        filename: 'docker-compose.yml',
        content: composeContent,
        language: 'yaml'
    });

    // Environment file
    const envContent = `# Environment variables for ${architecture.name}
# Generated by SolsArch
# Copy to .env and update values

# Environment
COMPOSE_PROJECT_NAME=${sanitizeName(projectName)}
ENVIRONMENT=${environment}

# Database
DB_PASSWORD=CHANGE_ME_SECURE_PASSWORD

# Cache (Redis)
# No additional config needed

# Queue (RabbitMQ)
RABBITMQ_PASSWORD=CHANGE_ME_SECURE_PASSWORD

# Storage (MinIO)
MINIO_PASSWORD=CHANGE_ME_SECURE_PASSWORD_123

# Application
NODE_ENV=production
LOG_LEVEL=info
`;

    outputs.push({
        filename: '.env.example',
        content: envContent,
        language: 'bash'
    });

    // Docker Compose override for development
    const devOverride = `# Development overrides for ${architecture.name}
# This file is automatically loaded when running docker-compose up

version: '3.8'

services:
${Object.entries(services).map(([name, config]) => {
        const cfg = config as Record<string, unknown>;
        if (cfg.build) {
            return `  ${name}:
    volumes:
      - ./${sanitizeName(name)}:/app
    environment:
      - NODE_ENV=development
      - DEBUG=*`;
        }
        return '';
    }).filter(Boolean).join('\n\n')}
`;

    outputs.push({
        filename: 'docker-compose.override.yml',
        content: devOverride,
        language: 'yaml'
    });

    // Sample Dockerfile for compute services
    const dockerfile = `# Dockerfile for ${projectName}
# Generated by SolsArch

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy built assets
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./

USER appuser

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "dist/index.js"]
`;

    outputs.push({
        filename: 'Dockerfile',
        content: dockerfile,
        language: 'dockerfile'
    });

    return outputs;
}
