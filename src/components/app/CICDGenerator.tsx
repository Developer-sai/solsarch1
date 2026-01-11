import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GitBranch, 
  Play, 
  Rocket, 
  Shield, 
  TestTube2,
  Package,
  Cloud,
  Copy,
  Check,
  Download,
  FileCode2,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CICDConfig {
  platform: 'github' | 'gitlab' | 'aws' | 'azure';
  provider: 'aws' | 'azure' | 'gcp' | 'oci';
  runtime: 'docker' | 'node' | 'python' | 'go';
  stages: {
    lint: boolean;
    test: boolean;
    build: boolean;
    security: boolean;
    deploy: boolean;
  };
  environments: ('dev' | 'staging' | 'production')[];
  features: {
    cache: boolean;
    parallelTests: boolean;
    artifacts: boolean;
    notifications: boolean;
  };
}

const PIPELINE_TEMPLATES: Record<string, string> = {
  github: `name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  AWS_REGION: us-east-1

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  security:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          ignore-unfixed: true
          severity: 'CRITICAL,HIGH'

  build:
    runs-on: ubuntu-latest
    needs: [test, security]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: \${{ env.AWS_REGION }}
      - name: Deploy to S3/CloudFront
        run: |
          aws s3 sync dist/ s3://\${{ vars.S3_BUCKET_STAGING }}
          aws cloudfront create-invalidation --distribution-id \${{ vars.CF_DISTRIBUTION_STAGING }} --paths "/*"

  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: \${{ env.AWS_REGION }}
      - name: Deploy to S3/CloudFront
        run: |
          aws s3 sync dist/ s3://\${{ vars.S3_BUCKET_PROD }}
          aws cloudfront create-invalidation --distribution-id \${{ vars.CF_DISTRIBUTION_PROD }} --paths "/*"
`,

  gitlab: `stages:
  - lint
  - test
  - security
  - build
  - deploy

variables:
  NODE_VERSION: "20"
  AWS_DEFAULT_REGION: us-east-1

.node_template: &node_template
  image: node:\${NODE_VERSION}
  cache:
    key: \${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/

lint:
  <<: *node_template
  stage: lint
  script:
    - npm ci
    - npm run lint

test:
  <<: *node_template
  stage: test
  script:
    - npm ci
    - npm test -- --coverage
  coverage: '/Lines\\s*:\\s*(\\d+\\.?\\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

security:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy fs --exit-code 1 --severity CRITICAL,HIGH .
  allow_failure: true

build:
  <<: *node_template
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

deploy_staging:
  stage: deploy
  image: amazon/aws-cli:latest
  environment:
    name: staging
    url: https://staging.example.com
  only:
    - develop
  script:
    - aws s3 sync dist/ s3://\$S3_BUCKET_STAGING
    - aws cloudfront create-invalidation --distribution-id \$CF_DISTRIBUTION_STAGING --paths "/*"

deploy_production:
  stage: deploy
  image: amazon/aws-cli:latest
  environment:
    name: production
    url: https://example.com
  only:
    - main
  when: manual
  script:
    - aws s3 sync dist/ s3://\$S3_BUCKET_PROD
    - aws cloudfront create-invalidation --distribution-id \$CF_DISTRIBUTION_PROD --paths "/*"
`,

  aws: `version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - npm ci

  pre_build:
    commands:
      - npm run lint
      - npm test
      - echo "Running security scan..."

  build:
    commands:
      - npm run build
      - echo "Build completed on \`date\`"

  post_build:
    commands:
      - aws s3 sync dist/ s3://\${S3_BUCKET}
      - aws cloudfront create-invalidation --distribution-id \${CF_DISTRIBUTION} --paths "/*"
      - echo "Deployment completed"

artifacts:
  files:
    - '**/*'
  base-directory: dist

cache:
  paths:
    - 'node_modules/**/*'
`,

  azure: `trigger:
  branches:
    include:
      - main
      - develop

pr:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '20.x'
  npm_config_cache: \$(Pipeline.Workspace)/.npm

stages:
  - stage: Build
    jobs:
      - job: LintAndTest
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: \$(nodeVersion)
            displayName: 'Install Node.js'

          - task: Cache@2
            inputs:
              key: 'npm | "\$(Agent.OS)" | package-lock.json'
              path: \$(npm_config_cache)
            displayName: 'Cache npm'

          - script: npm ci
            displayName: 'Install dependencies'

          - script: npm run lint
            displayName: 'Lint'

          - script: npm test -- --coverage
            displayName: 'Test'

          - task: PublishCodeCoverageResults@2
            inputs:
              codeCoverageTool: Cobertura
              summaryFileLocation: \$(System.DefaultWorkingDirectory)/coverage/cobertura-coverage.xml

      - job: Build
        dependsOn: LintAndTest
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: \$(nodeVersion)

          - script: npm ci
            displayName: 'Install dependencies'

          - script: npm run build
            displayName: 'Build'

          - task: PublishPipelineArtifact@1
            inputs:
              targetPath: 'dist'
              artifact: 'build'

  - stage: DeployStaging
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
    jobs:
      - deployment: Deploy
        environment: staging
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureCLI@2
                  inputs:
                    azureSubscription: '\$(AZURE_SUBSCRIPTION)'
                    scriptType: bash
                    scriptLocation: inlineScript
                    inlineScript: |
                      az storage blob upload-batch -d '\$web' -s \$(Pipeline.Workspace)/build --account-name \$(STORAGE_ACCOUNT_STAGING)

  - stage: DeployProduction
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: Deploy
        environment: production
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureCLI@2
                  inputs:
                    azureSubscription: '\$(AZURE_SUBSCRIPTION)'
                    scriptType: bash
                    scriptLocation: inlineScript
                    inlineScript: |
                      az storage blob upload-batch -d '\$web' -s \$(Pipeline.Workspace)/build --account-name \$(STORAGE_ACCOUNT_PROD)
`,
};

const PLATFORM_INFO = {
  github: { name: 'GitHub Actions', file: '.github/workflows/ci.yml', icon: '🐙' },
  gitlab: { name: 'GitLab CI', file: '.gitlab-ci.yml', icon: '🦊' },
  aws: { name: 'AWS CodePipeline', file: 'buildspec.yml', icon: '🟠' },
  azure: { name: 'Azure DevOps', file: 'azure-pipelines.yml', icon: '🔵' },
};

export function CICDGenerator() {
  const [config, setConfig] = useState<CICDConfig>({
    platform: 'github',
    provider: 'aws',
    runtime: 'node',
    stages: { lint: true, test: true, build: true, security: true, deploy: true },
    environments: ['dev', 'staging', 'production'],
    features: { cache: true, parallelTests: true, artifacts: true, notifications: false },
  });
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(PIPELINE_TEMPLATES[config.platform]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = PIPELINE_TEMPLATES[config.platform];
    const info = PLATFORM_INFO[config.platform];
    const blob = new Blob([content], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = info.file.split('/').pop() || 'pipeline.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-semibold">CI/CD Pipeline Generator</h3>
          <p className="text-xs text-muted-foreground">Generate production-ready pipelines</p>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="grid grid-cols-4 gap-2">
        {(Object.entries(PLATFORM_INFO) as [keyof typeof PLATFORM_INFO, typeof PLATFORM_INFO[keyof typeof PLATFORM_INFO]][]).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setConfig(prev => ({ ...prev, platform: key as CICDConfig['platform'] }))}
            className={cn(
              "p-3 rounded-lg border text-center transition-all",
              config.platform === key 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50 bg-secondary/30"
            )}
          >
            <div className="text-xl mb-1">{info.icon}</div>
            <div className="text-xs font-medium truncate">{info.name}</div>
          </button>
        ))}
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Pipeline Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stages */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Stages</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'lint', icon: FileCode2, label: 'Lint' },
                { key: 'test', icon: TestTube2, label: 'Test' },
                { key: 'security', icon: Shield, label: 'Security' },
                { key: 'build', icon: Package, label: 'Build' },
                { key: 'deploy', icon: Rocket, label: 'Deploy' },
              ].map(stage => (
                <label
                  key={stage.key}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all",
                    config.stages[stage.key as keyof typeof config.stages]
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-secondary/30 border border-transparent hover:border-border"
                  )}
                >
                  <Checkbox
                    checked={config.stages[stage.key as keyof typeof config.stages]}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        stages: { ...prev.stages, [stage.key]: checked }
                      }))
                    }
                  />
                  <stage.icon className="w-3.5 h-3.5" />
                  <span className="text-sm">{stage.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Provider */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Cloud Provider</label>
              <Select value={config.provider} onValueChange={(v: CICDConfig['provider']) => setConfig(prev => ({ ...prev, provider: v }))}>
                <SelectTrigger className="bg-secondary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aws">🟠 AWS</SelectItem>
                  <SelectItem value="azure">🔵 Azure</SelectItem>
                  <SelectItem value="gcp">🔴 GCP</SelectItem>
                  <SelectItem value="oci">🟣 OCI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Runtime</label>
              <Select value={config.runtime} onValueChange={(v: CICDConfig['runtime']) => setConfig(prev => ({ ...prev, runtime: v }))}>
                <SelectTrigger className="bg-secondary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docker">🐳 Docker</SelectItem>
                  <SelectItem value="node">📗 Node.js</SelectItem>
                  <SelectItem value="python">🐍 Python</SelectItem>
                  <SelectItem value="go">🐹 Go</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Pipeline */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <span>{PLATFORM_INFO[config.platform].icon}</span>
              {PLATFORM_INFO[config.platform].file}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1.5">
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} className="h-7 gap-1.5">
                <Download className="w-3.5 h-3.5" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] rounded-lg bg-[#0d1117] border border-border/50">
            <pre className="p-4 text-xs font-mono text-[#c9d1d9] leading-relaxed">
              {PIPELINE_TEMPLATES[config.platform]}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Pipeline Overview */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
        <div className="flex items-center gap-4">
          {Object.entries(config.stages).filter(([_, enabled]) => enabled).map(([stage]) => (
            <div key={stage} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="capitalize">{stage}</span>
            </div>
          ))}
        </div>
        <Badge variant="secondary" className="text-xs">
          {Object.values(config.stages).filter(Boolean).length} stages
        </Badge>
      </div>
    </div>
  );
}
