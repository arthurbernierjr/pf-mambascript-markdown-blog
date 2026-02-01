---
title: "CI/CD Pipelines"
subTitle: "Automate Build, Test, and Deploy"
excerpt: "Deploy with confidence through continuous integration and delivery."
featureImage: "/img/ci-cd.png"
date: "2026-02-01"
order: 814
---

# Explanation

## What is CI/CD?

CI/CD automates the software delivery process. Continuous Integration merges code frequently, while Continuous Delivery/Deployment automates releases.

### Key Concepts

| Term | Description |
|------|-------------|
| CI | Automated building and testing on every commit |
| CD (Delivery) | Automated release to staging, manual to production |
| CD (Deployment) | Fully automated deployment to production |
| Pipeline | Series of automated steps |

### Benefits

- Faster feedback loops
- Reduced manual errors
- Consistent deployments
- Improved code quality

---

# Demonstration

## Example 1: GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Lint and type check
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npm run type-check

  # Run tests
  test:
    runs-on: ubuntu-latest
    needs: lint

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test

      - name: Run tests
        run: npm test -- --coverage
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  # Build Docker image
  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push'

    permissions:
      contents: read
      packages: write

    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha
            type=ref,event=branch

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Deploy to staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
      - name: Deploy to staging
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app
            docker pull ${{ needs.build.outputs.image-tag }}
            docker-compose up -d

  # Deploy to production
  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Deploy to production
        run: |
          # Use your deployment tool (kubectl, terraform, etc.)
          kubectl set image deployment/api api=${{ needs.build.outputs.image-tag }}
```

## Example 2: GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "20"
  DOCKER_REGISTRY: registry.gitlab.com
  IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA

# Caching
.node-cache: &node-cache
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/

# Lint job
lint:
  stage: lint
  image: node:${NODE_VERSION}
  <<: *node-cache
  script:
    - npm ci
    - npm run lint
    - npm run type-check

# Test job
test:
  stage: test
  image: node:${NODE_VERSION}
  <<: *node-cache
  services:
    - postgres:15
    - redis:7

  variables:
    POSTGRES_DB: test
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    DATABASE_URL: postgres://postgres:postgres@postgres:5432/test
    REDIS_URL: redis://redis:6379

  script:
    - npm ci
    - npm run db:migrate
    - npm test -- --coverage

  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'

  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# Build Docker image
build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind

  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

  script:
    - docker build -t $IMAGE_TAG .
    - docker push $IMAGE_TAG

  only:
    - main
    - develop

# Deploy staging
deploy-staging:
  stage: deploy
  image: alpine:latest
  environment:
    name: staging
    url: https://staging.example.com

  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -

  script:
    - ssh $SSH_USER@$STAGING_HOST "cd /app && docker-compose pull && docker-compose up -d"

  only:
    - develop

# Deploy production (manual)
deploy-production:
  stage: deploy
  image: bitnami/kubectl:latest
  environment:
    name: production
    url: https://example.com

  script:
    - kubectl config set-cluster k8s --server=$K8S_SERVER
    - kubectl config set-credentials deployer --token=$K8S_TOKEN
    - kubectl config set-context default --cluster=k8s --user=deployer
    - kubectl config use-context default
    - kubectl set image deployment/api api=$IMAGE_TAG

  when: manual
  only:
    - main
```

## Example 3: Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
        DOCKER_REGISTRY = 'registry.example.com'
        IMAGE_NAME = 'api'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                nodejs(nodeJSInstallationName: 'Node 20') {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                nodejs(nodeJSInstallationName: 'Node 20') {
                    sh 'npm run lint'
                }
            }
        }

        stage('Test') {
            steps {
                nodejs(nodeJSInstallationName: 'Node 20') {
                    sh 'npm test -- --coverage'
                }
            }
            post {
                always {
                    junit 'coverage/junit.xml'
                    publishHTML([
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }

        stage('Build Docker Image') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def imageTag = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${env.GIT_COMMIT.take(7)}"
                    docker.build(imageTag)
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-credentials') {
                        docker.image(imageTag).push()
                        docker.image(imageTag).push('latest')
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sshagent(['staging-ssh-key']) {
                    sh '''
                        ssh deployer@staging.example.com "
                            cd /app &&
                            docker-compose pull &&
                            docker-compose up -d
                        "
                    '''
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message 'Deploy to production?'
                ok 'Deploy'
            }
            steps {
                withKubeConfig([credentialsId: 'k8s-credentials']) {
                    sh '''
                        kubectl set image deployment/api \
                            api=${DOCKER_REGISTRY}/${IMAGE_NAME}:${GIT_COMMIT}
                    '''
                }
            }
        }
    }

    post {
        failure {
            slackSend(
                color: 'danger',
                message: "Build failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
        success {
            slackSend(
                color: 'good',
                message: "Build succeeded: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
    }
}
```

## Example 4: Docker Build Optimization

```dockerfile
# Dockerfile (multi-stage build)

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER nodejs

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml for local development
version: '3.8'

services:
  api:
    build:
      context: .
      target: builder
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://postgres:postgres@db:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Example 5: Deployment Strategies

```yaml
# Kubernetes rolling update
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: registry.example.com/api:latest
          ports:
            - containerPort: 3000
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health/live
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

```yaml
# Blue-Green deployment with Argo Rollouts
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: api
spec:
  replicas: 3
  strategy:
    blueGreen:
      activeService: api-active
      previewService: api-preview
      autoPromotionEnabled: false
      prePromotionAnalysis:
        templates:
          - templateName: success-rate
        args:
          - name: service-name
            value: api-preview
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: registry.example.com/api:v2
```

## Example 6: Infrastructure as Code

```hcl
# terraform/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "terraform-state"
    key    = "api/terraform.tfstate"
    region = "us-east-1"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "api-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Service
resource "aws_ecs_service" "api" {
  name            = "api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 3
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnets
    security_groups = [aws_security_group.api.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 3000
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }
}

# Task Definition
resource "aws_ecs_task_definition" "api" {
  family                   = "api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([
    {
      name  = "api"
      image = "${var.ecr_repository}:${var.image_tag}"
      portMappings = [{
        containerPort = 3000
        hostPort      = 3000
      }]
      environment = [
        { name = "NODE_ENV", value = "production" }
      ]
      secrets = [
        { name = "DATABASE_URL", valueFrom = aws_secretsmanager_secret.db_url.arn }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "api"
        }
      }
    }
  ])
}
```

**Key Takeaways:**
- Automate everything possible
- Test before deploying
- Use multi-stage Docker builds
- Implement proper health checks
- Choose appropriate deployment strategies

---

# Imitation

### Challenge 1: Build a Complete Pipeline

**Task:** Create a CI/CD pipeline with testing, building, and deployment stages.

<details>
<summary>Solution</summary>

```yaml
# .github/workflows/complete-pipeline.yml
name: Complete CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy
        run: |
          curl -X POST ${{ secrets.DEPLOY_WEBHOOK }} \
            -d '{"image": "ghcr.io/${{ github.repository }}:${{ github.sha }}"}'

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy
        run: |
          kubectl set image deployment/api api=ghcr.io/${{ github.repository }}:${{ github.sha }}
```

</details>

---

# Practice

### Exercise 1: Add Security Scanning
**Difficulty:** Intermediate

Add security scanning:
- Dependency vulnerability check
- Container image scanning
- SAST analysis

### Exercise 2: Canary Deployments
**Difficulty:** Advanced

Implement canary deployments:
- Gradual traffic shifting
- Automated rollback
- Metrics-based promotion

---

## Summary

**What you learned:**
- GitHub Actions, GitLab CI, Jenkins
- Docker optimization
- Deployment strategies
- Infrastructure as Code
- Pipeline best practices

**Next Steps:**
- Read: [Deployment](/api/guides/concepts/deployment)
- Practice: Set up CI/CD for your project
- Explore: ArgoCD, Flux

---

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
