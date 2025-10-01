# SSPL Website - DevOps Guide

This comprehensive DevOps guide covers infrastructure as code, CI/CD pipelines, monitoring, logging, and operational practices for the SSPL Website.

## 🏗️ Infrastructure as Code

### Terraform Configuration

```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket = "sspl-terraform-state"
    key    = "sspl-website.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "sspl-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false

  tags = {
    Environment = var.environment
    Project     = "SSPL"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "sspl_cluster" {
  name = "sspl-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Environment = var.environment
    Project     = "SSPL"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "sspl_app" {
  family                   = "sspl-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name  = "sspl-frontend"
      image = "${aws_ecr_repository.sspl_app.repository_url}:latest"

      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "VITE_SUPABASE_URL"
          value = var.supabase_url
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/sspl-app"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Environment = var.environment
    Project     = "SSPL"
  }
}

# Application Load Balancer
resource "aws_lb" "sspl_alb" {
  name               = "sspl-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = true

  tags = {
    Environment = var.environment
    Project     = "SSPL"
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "sspl_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_lb.sspl_alb.dns_name
    origin_id   = "sspl-alb"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "sspl-alb"

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
      headers = ["Authorization", "Host"]
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.sspl_cert.arn
    ssl_support_method  = "sni-only"
  }

  tags = {
    Environment = var.environment
    Project     = "SSPL"
  }
}
```

### Ansible Playbooks

```yaml
# deploy.yml
---
- name: Deploy SSPL Website
  hosts: webservers
  become: yes
  vars:
    app_name: sspl-website
    app_port: 3000
    node_version: 18

  tasks:
    - name: Update system packages
      apt:
        update_cache: yes
        upgrade: yes

    - name: Install Node.js
      include_role:
        name: nodejs
      vars:
        nodejs_version: "{{ node_version }}"

    - name: Create application directory
      file:
        path: "/opt/{{ app_name }}"
        state: directory
        owner: nodejs
        group: nodejs

    - name: Copy application files
      copy:
        src: "{{ playbook_dir }}/../dist/"
        dest: "/opt/{{ app_name }}/"
        owner: nodejs
        group: nodejs

    - name: Install dependencies
      npm:
        path: "/opt/{{ app_name }}"
        state: present

    - name: Create systemd service
      template:
        src: templates/sspl.service.j2
        dest: "/etc/systemd/system/{{ app_name }}.service"
      notify: restart sspl

    - name: Enable and start service
      systemd:
        name: "{{ app_name }}"
        enabled: yes
        state: started

  handlers:
    - name: restart sspl
      systemd:
        name: "{{ app_name }}"
        state: restarted
```

## 🔄 CI/CD Pipelines

### GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run accessibility tests
        run: npm run test:a11y

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run security audit
        run: npm audit --audit-level high

      - name: Run SAST
        uses: github/super-linter/slim@v4
        env:
          DEFAULT_BRANCH: main
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Run bundle analysis
        run: npm run analyze

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to staging
        run: |
          aws s3 sync dist/ s3://sspl-staging-website --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.STAGING_CLOUDFRONT_ID }} --paths "/*"

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to production
        run: |
          aws s3 sync dist/ s3://sspl-production-website --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.PRODUCTION_CLOUDFRONT_ID }} --paths "/*"

      - name: Create GitHub release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.run_number }}
          release_name: Release ${{ github.run_number }}
          body: |
            ## Changes
            - Automated deployment to production
            - Build: ${{ github.run_number }}
            - Commit: ${{ github.sha }}
```

### Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        DOCKER_IMAGE = 'sspl-website'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup') {
            steps {
                sh 'curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -'
                sh 'sudo apt-get install -y nodejs'
                sh 'npm ci'
            }
        }

        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:unit'
                    }
                    post {
                        always {
                            junit 'test-results/unit/*.xml'
                        }
                    }
                }

                stage('Integration Tests') {
                    steps {
                        sh 'npm run test:integration'
                    }
                    post {
                        always {
                            junit 'test-results/integration/*.xml'
                        }
                    }
                }

                stage('E2E Tests') {
                    steps {
                        sh 'npm run test:e2e'
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'test-results/e2e',
                                reportFiles: 'index.html',
                                reportName: 'E2E Test Results'
                            ])
                        }
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                sh 'npm audit --audit-level high'
                sh 'npm run security:scan'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
                sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh 'docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:staging'
                sh 'docker push ${DOCKER_IMAGE}:staging'
                sh './deploy-staging.sh'
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    input message: 'Deploy to Production?', ok: 'Deploy'
                }
                sh 'docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest'
                sh 'docker push ${DOCKER_IMAGE}:latest'
                sh './deploy-production.sh'
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f'
            archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
        }

        success {
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: "Deployment successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }

        failure {
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: "Deployment failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
    }
}
```

## 📊 Monitoring & Observability

### Application Performance Monitoring

```typescript
// src/services/monitoring.ts
import { datadogRum } from '@datadog/browser-rum';

export class MonitoringService {
  static init() {
    datadogRum.init({
      applicationId: process.env.VITE_DATADOG_APP_ID!,
      clientToken: process.env.VITE_DATADOG_CLIENT_TOKEN!,
      site: 'datadoghq.com',
      service: 'sspl-website',
      env: process.env.NODE_ENV,
      version: process.env.VITE_APP_VERSION,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
    });

    datadogRum.startSessionReplayRecording();
  }

  static trackError(error: Error, context?: any) {
    datadogRum.addError(error, context);
  }

  static trackAction(name: string, context?: any) {
    datadogRum.addAction(name, context);
  }

  static setUser(user: { id: string; name?: string; email?: string }) {
    datadogRum.setUser({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  static setGlobalContext(context: Record<string, any>) {
    datadogRum.setGlobalContext(context);
  }
}

// Initialize monitoring
if (typeof window !== 'undefined') {
  MonitoringService.init();
}
```

### Infrastructure Monitoring

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    devices:
      - /dev/kmsg

volumes:
  prometheus_data:
  grafana_data:
```

### Log Aggregation

```typescript
// src/services/logging.ts
import winston from 'winston';

export class LoggingService {
  private static logger: winston.Logger;

  static init() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'sspl-website' },
      transports: [
        // Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all logs with importance level of `info` or less to `combined.log`
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });

    // If we're not in production then log to the console with a simple format
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }));
    }
  }

  static error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }

  static warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  static info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  static debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  static http(method: string, url: string, statusCode: number, duration: number, userId?: string) {
    this.logger.info('HTTP Request', {
      method,
      url,
      statusCode,
      duration,
      userId,
      type: 'http',
    });
  }

  static security(event: string, details: any, userId?: string, ipAddress?: string) {
    this.logger.warn('Security Event', {
      event,
      details,
      userId,
      ipAddress,
      type: 'security',
    });
  }
}

// Initialize logging
LoggingService.init();
```

## 🔒 Security Automation

### Vulnerability Scanning

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday at 2 AM

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level moderate

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Dependency Review
        uses: actions/dependency-review-action@v2

  codeql-analysis:
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: ['javascript']

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: ${{ matrix.language }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

### Secret Management

```typescript
// src/services/secretService.ts
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

export class SecretService {
  private static client = new SecretsManager({
    region: process.env.AWS_REGION || 'us-east-1',
  });

  static async getSecret(secretName: string): Promise<string> {
    try {
      const response = await this.client.getSecretValue({
        SecretId: secretName,
      });

      if (response.SecretString) {
        return response.SecretString;
      }

      throw new Error('Secret value is binary, not supported');
    } catch (error) {
      console.error(`Error retrieving secret ${secretName}:`, error);
      throw error;
    }
  }

  static async getDatabaseCredentials(): Promise<{
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  }> {
    const secret = await this.getSecret('sspl/database/credentials');
    return JSON.parse(secret);
  }

  static async getAPIKeys(): Promise<{
    supabaseUrl: string;
    supabaseAnonKey: string;
    razorpayKeyId: string;
    gaTrackingId: string;
  }> {
    const secret = await this.getSecret('sspl/api/keys');
    return JSON.parse(secret);
  }

  static async rotateSecret(secretName: string, newValue: string): Promise<void> {
    try {
      await this.client.updateSecret({
        SecretId: secretName,
        SecretString: newValue,
      });

      console.log(`Secret ${secretName} rotated successfully`);
    } catch (error) {
      console.error(`Error rotating secret ${secretName}:`, error);
      throw error;
    }
  }
}
```

## 🚀 Deployment Strategies

### Blue-Green Deployment

```typescript
// scripts/blue-green-deploy.ts
import { ECS, ELBv2, Route53 } from 'aws-sdk';

export class BlueGreenDeployment {
  private ecs = new ECS();
  private elbv2 = new ELBv2();
  private route53 = new Route53();

  async deploy(serviceName: string, newImageTag: string) {
    try {
      // 1. Create new task definition with new image
      const newTaskDef = await this.createNewTaskDefinition(serviceName, newImageTag);

      // 2. Update service to use new task definition
      await this.updateService(serviceName, newTaskDef.taskDefinitionArn!);

      // 3. Wait for new tasks to be healthy
      await this.waitForServiceStability(serviceName);

      // 4. Switch traffic to new version
      await this.switchTraffic(serviceName);

      // 5. Clean up old resources
      await this.cleanupOldResources(serviceName);

      console.log('Blue-green deployment completed successfully');
    } catch (error) {
      console.error('Blue-green deployment failed:', error);
      await this.rollback(serviceName);
      throw error;
    }
  }

  private async createNewTaskDefinition(serviceName: string, imageTag: string) {
    const currentTaskDef = await this.ecs.describeTaskDefinition({
      taskDefinition: serviceName,
    }).promise();

    const newTaskDef = {
      ...currentTaskDef.taskDefinition!,
      containerDefinitions: currentTaskDef.taskDefinition!.containerDefinitions!.map(container => ({
        ...container,
        image: container.image!.replace(/:.*/, `:${imageTag}`),
      })),
    };

    const result = await this.ecs.registerTaskDefinition({
      family: serviceName,
      ...newTaskDef,
    }).promise();

    return result.taskDefinition!;
  }

  private async updateService(serviceName: string, taskDefinitionArn: string) {
    await this.ecs.updateService({
      service: serviceName,
      taskDefinition: taskDefinitionArn,
      forceNewDeployment: true,
    }).promise();
  }

  private async waitForServiceStability(serviceName: string) {
    // Wait for service to reach steady state
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes

    while (attempts < maxAttempts) {
      const service = await this.ecs.describeServices({
        services: [serviceName],
      }).promise();

      if (service.services![0].deployments!.length === 1) {
        console.log('Service deployment completed');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      attempts++;
    }

    throw new Error('Service deployment timeout');
  }

  private async switchTraffic(serviceName: string) {
    // Implementation for traffic switching
    console.log('Switching traffic to new version');
  }

  private async cleanupOldResources(serviceName: string) {
    // Clean up old task definitions and resources
    console.log('Cleaning up old resources');
  }

  private async rollback(serviceName: string) {
    // Rollback to previous version
    console.log('Rolling back deployment');
  }
}
```

### Canary Deployment

```typescript
// scripts/canary-deploy.ts
export class CanaryDeployment {
  async deploy(serviceName: string, newImageTag: string, canaryPercentage: number = 10) {
    try {
      // 1. Create canary task definition
      const canaryTaskDef = await this.createCanaryTaskDefinition(serviceName, newImageTag);

      // 2. Deploy canary version alongside current version
      await this.deployCanary(serviceName, canaryTaskDef, canaryPercentage);

      // 3. Monitor canary deployment
      const canaryHealthy = await this.monitorCanary(serviceName);

      if (canaryHealthy) {
        // 4. Gradually increase traffic to canary
        await this.increaseTraffic(serviceName, canaryPercentage);

        // 5. Complete deployment
        await this.completeDeployment(serviceName);
      } else {
        // Rollback canary
        await this.rollbackCanary(serviceName);
      }
    } catch (error) {
      console.error('Canary deployment failed:', error);
      await this.rollbackCanary(serviceName);
      throw error;
    }
  }

  private async createCanaryTaskDefinition(serviceName: string, imageTag: string) {
    // Create task definition for canary deployment
    console.log('Creating canary task definition');
  }

  private async deployCanary(serviceName: string, taskDef: any, percentage: number) {
    // Deploy canary version
    console.log(`Deploying canary with ${percentage}% traffic`);
  }

  private async monitorCanary(serviceName: string): Promise<boolean> {
    // Monitor canary health metrics
    console.log('Monitoring canary deployment');
    return true; // Return health status
  }

  private async increaseTraffic(serviceName: string, currentPercentage: number) {
    // Gradually increase traffic to canary
    console.log('Increasing traffic to canary');
  }

  private async completeDeployment(serviceName: string) {
    // Complete the deployment
    console.log('Completing canary deployment');
  }

  private async rollbackCanary(serviceName: string) {
    // Rollback canary deployment
    console.log('Rolling back canary deployment');
  }
}
```

## 📈 Performance Optimization

### Auto Scaling

```typescript
// src/services/autoScaling.ts
import { ApplicationAutoScaling } from '@aws-sdk/client-application-auto-scaling';

export class AutoScalingService {
  private client = new ApplicationAutoScaling({ region: 'us-east-1' });

  async configureAutoScaling(serviceName: string) {
    // CPU-based scaling
    await this.client.registerScalableTarget({
      ServiceNamespace: 'ecs',
      ResourceId: `service/sspl-cluster/${serviceName}`,
      ScalableDimension: 'ecs:service:DesiredCount',
      MinCapacity: 2,
      MaxCapacity: 10,
    });

    // CPU utilization policy
    await this.client.putScalingPolicy({
      PolicyName: 'cpu-scaling',
      ServiceNamespace: 'ecs',
      ResourceId: `service/sspl-cluster/${serviceName}`,
      ScalableDimension: 'ecs:service:DesiredCount',
      PolicyType: 'TargetTrackingScaling',
      TargetTrackingScalingPolicyConfiguration: {
        TargetValue: 70.0,
        PredefinedMetricSpecification: {
          PredefinedMetricType: 'ECSServiceAverageCPUUtilization',
        },
        ScaleInCooldown: 300,
        ScaleOutCooldown: 60,
      },
    });

    // Memory utilization policy
    await this.client.putScalingPolicy({
      PolicyName: 'memory-scaling',
      ServiceNamespace: 'ecs',
      ResourceId: `service/sspl-cluster/${serviceName}`,
      ScalableDimension: 'ecs:service:DesiredCount',
      PolicyType: 'TargetTrackingScaling',
      TargetTrackingScalingPolicyConfiguration: {
        TargetValue: 80.0,
        PredefinedMetricSpecification: {
          PredefinedMetricType: 'ECSServiceAverageMemoryUtilization',
        },
        ScaleInCooldown: 300,
        ScaleOutCooldown: 60,
      },
    });
  }

  async configureScheduledScaling(serviceName: string) {
    // Scale up during peak hours
    await this.client.putScheduledAction({
      ServiceNamespace: 'ecs',
      ResourceId: `service/sspl-cluster/${serviceName}`,
      ScalableDimension: 'ecs:service:DesiredCount',
      ScheduledActionName: 'scale-up-peak-hours',
      Schedule: 'cron(0 9 * * MON-FRI)', // 9 AM weekdays
      ScalableTargetAction: {
        MinCapacity: 5,
        MaxCapacity: 15,
      },
    });

    // Scale down during off-peak hours
    await this.client.putScheduledAction({
      ServiceNamespace: 'ecs',
      ResourceId: `service/sspl-cluster/${serviceName}`,
      ScalableDimension: 'ecs:service:DesiredCount',
      ScheduledActionName: 'scale-down-off-peak',
      Schedule: 'cron(0 18 * * MON-FRI)', // 6 PM weekdays
      ScalableTargetAction: {
        MinCapacity: 2,
        MaxCapacity: 5,
      },
    });
  }
}
```

### Database Optimization

```sql
-- Database performance optimization
-- Create indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_user_email ON auth.users(email);
CREATE INDEX CONCURRENTLY idx_user_created_at ON auth.users(created_at);
CREATE INDEX CONCURRENTLY idx_player_team ON sspl_players(team_id);
CREATE INDEX CONCURRENTLY idx_match_date ON sspl_matches(date);
CREATE INDEX CONCURRENTLY idx_news_published ON sspl_news(published_date);

-- Partition large tables by date
CREATE TABLE sspl_matches_y2025 PARTITION OF sspl_matches
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW player_stats AS
SELECT
    p.id,
    p.name,
    t.name as team_name,
    COUNT(m.id) as matches_played,
    SUM(CASE WHEN m.winner_id = p.team_id THEN 1 ELSE 0 END) as wins,
    AVG(CAST(p.stats->>'runs' AS INTEGER)) as avg_runs
FROM sspl_players p
JOIN sspl_teams t ON p.team_id = t.id
LEFT JOIN sspl_matches m ON m.team_a_id = p.team_id OR m.team_b_id = p.team_id
WHERE p.is_active = true
GROUP BY p.id, p.name, t.name;

-- Refresh materialized view periodically
CREATE OR REPLACE FUNCTION refresh_player_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY player_stats;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh
SELECT cron.schedule('refresh-player-stats', '0 */6 * * *', 'SELECT refresh_player_stats();');
```

## 📋 DevOps Checklist

### Infrastructure Setup
- [ ] Infrastructure as Code implemented
- [ ] Multi-environment configuration
- [ ] Auto scaling configured
- [ ] Load balancing setup
- [ ] CDN configuration
- [ ] Database optimization

### CI/CD Pipeline
- [ ] Automated testing pipeline
- [ ] Security scanning integrated
- [ ] Deployment automation
- [ ] Rollback procedures
- [ ] Environment promotion

### Monitoring & Alerting
- [ ] Application performance monitoring
- [ ] Infrastructure monitoring
- [ ] Log aggregation
- [ ] Alert configuration
- [ ] Dashboard setup

### Security Automation
- [ ] Vulnerability scanning
- [ ] Secret management
- [ ] Access control
- [ ] Security monitoring
- [ ] Compliance automation

### Backup & Recovery
- [ ] Database backups configured
- [ ] Backup verification
- [ ] Disaster recovery plan
- [ ] Backup restoration tested
- [ ] Point-in-time recovery

---

**Last Updated**: 2025-08-31
**DevOps Version**: 1.0.0