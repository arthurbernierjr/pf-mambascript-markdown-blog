---
title: "Deployment Fundamentals"
subTitle: "Getting Your App to Production"
excerpt: "The best code in the world is useless if it never ships."
featureImage: "/img/deployment.png"
date: "2026-02-01"
order: 806
---

# Explanation

## What is Deployment?

Deployment is the process of making your application available to users. It involves building, testing, and releasing code to production environments.

### Key Concepts

- **Environment**: Development, staging, production
- **CI/CD**: Continuous Integration/Continuous Deployment
- **Containerization**: Docker, Kubernetes
- **Platform**: Vercel, Railway, AWS, Heroku

### Deployment Options

| Platform | Best For | Complexity |
|----------|----------|------------|
| Vercel | Frontend, Next.js | Low |
| Railway | Full-stack, databases | Low |
| Render | Full-stack, Docker | Medium |
| AWS/GCP | Enterprise, custom | High |
| DigitalOcean | VPS, Docker | Medium |

---

# Demonstration

## Example 1: Docker Deployment

```dockerfile
# Dockerfile - Node.js app
FROM node:20-alpine AS base

WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Build stage
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist
COPY --from=build --chown=nextjs:nodejs /app/package.json ./

USER nextjs

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

## Example 2: GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
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

      - name: Run tests
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

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

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /app
            docker compose pull
            docker compose up -d
            docker image prune -f
```

## Example 3: Platform Deployment Configs

```json
// vercel.json - Vercel
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/public/$1" }
  ],
  "env": {
    "DATABASE_URL": "@database-url"
  }
}
```

```toml
# railway.toml - Railway
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[[services]]
name = "web"
```

```yaml
# render.yaml - Render
services:
  - type: web
    name: api
    env: node
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: mydb
          property: connectionString

databases:
  - name: mydb
    plan: starter
    databaseName: myapp
```

## Example 4: Environment Management

```javascript
// config.js - Environment configuration
const config = {
    development: {
        port: 3000,
        database: 'mongodb://localhost/myapp-dev',
        logLevel: 'debug',
        cors: ['http://localhost:5173']
    },
    staging: {
        port: process.env.PORT || 3000,
        database: process.env.DATABASE_URL,
        logLevel: 'info',
        cors: ['https://staging.myapp.com']
    },
    production: {
        port: process.env.PORT || 3000,
        database: process.env.DATABASE_URL,
        logLevel: 'warn',
        cors: ['https://myapp.com', 'https://www.myapp.com']
    }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];
```

```bash
# .env.example - Environment variables template
# Copy to .env and fill in values

# App
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgres://user:pass@localhost:5432/myapp

# Auth
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# External Services
STRIPE_KEY=sk_test_...
SENDGRID_KEY=SG...

# Feature Flags
ENABLE_NEW_FEATURE=false
```

## Example 5: Health Checks and Monitoring

```javascript
// health.js - Health check endpoint
const express = require('express');
const router = express.Router();

// Simple health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Detailed health check
router.get('/health/ready', async (req, res) => {
    const checks = {
        database: await checkDatabase(),
        redis: await checkRedis(),
        external: await checkExternalServices()
    };

    const healthy = Object.values(checks).every(c => c.status === 'ok');

    res.status(healthy ? 200 : 503).json({
        status: healthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        checks
    });
});

async function checkDatabase() {
    try {
        await db.query('SELECT 1');
        return { status: 'ok' };
    } catch (error) {
        return { status: 'error', message: error.message };
    }
}

async function checkRedis() {
    try {
        await redis.ping();
        return { status: 'ok' };
    } catch (error) {
        return { status: 'error', message: error.message };
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');

    // Stop accepting new requests
    server.close(() => {
        console.log('HTTP server closed');
    });

    // Close database connections
    await db.end();
    await redis.quit();

    console.log('Cleanup complete, exiting');
    process.exit(0);
});
```

**Key Takeaways:**
- Use Docker for consistent environments
- CI/CD automates testing and deployment
- Environment variables manage configuration
- Health checks enable auto-recovery
- Graceful shutdown prevents data loss

---

# Imitation

### Challenge 1: Create a Deployment Pipeline

**Task:** Set up a CI/CD pipeline that tests, builds, and deploys on merge to main.

<details>
<summary>Solution</summary>

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
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
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/

      - name: Deploy to Railway
        run: |
          npm i -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

</details>

### Challenge 2: Implement Blue-Green Deployment

**Task:** Create a deployment strategy that allows instant rollback.

<details>
<summary>Solution</summary>

```bash
#!/bin/bash
# deploy.sh - Blue-green deployment

BLUE_PORT=3000
GREEN_PORT=3001
CURRENT_LINK="/app/current"
BLUE_DIR="/app/blue"
GREEN_DIR="/app/green"

# Determine which is currently active
if [ -L "$CURRENT_LINK" ]; then
    CURRENT=$(readlink "$CURRENT_LINK")
    if [ "$CURRENT" == "$BLUE_DIR" ]; then
        DEPLOY_DIR=$GREEN_DIR
        DEPLOY_PORT=$GREEN_PORT
    else
        DEPLOY_DIR=$BLUE_DIR
        DEPLOY_PORT=$BLUE_PORT
    fi
else
    DEPLOY_DIR=$BLUE_DIR
    DEPLOY_PORT=$BLUE_PORT
fi

echo "Deploying to $DEPLOY_DIR on port $DEPLOY_PORT"

# Deploy new version
cd $DEPLOY_DIR
git pull
npm ci
npm run build

# Start new version
PORT=$DEPLOY_PORT pm2 start npm --name "app-$DEPLOY_PORT" -- start

# Wait for health check
for i in {1..30}; do
    if curl -s "http://localhost:$DEPLOY_PORT/health" | grep -q "ok"; then
        echo "Health check passed"
        break
    fi
    sleep 1
done

# Switch traffic (update nginx)
sed -i "s/proxy_pass http:\/\/localhost:[0-9]*/proxy_pass http:\/\/localhost:$DEPLOY_PORT/" /etc/nginx/conf.d/app.conf
nginx -s reload

# Update current link
ln -sfn $DEPLOY_DIR $CURRENT_LINK

echo "Deployment complete!"

# Optional: stop old version after delay
# sleep 60
# pm2 delete "app-$OLD_PORT"
```

</details>

---

# Practice

### Exercise 1: Multi-Environment Setup
**Difficulty:** Intermediate

Create deployment configs for:
- Development (local Docker)
- Staging (Railway/Render)
- Production (with monitoring)

### Exercise 2: Auto-Scaling Configuration
**Difficulty:** Advanced

Set up auto-scaling with:
- Load balancer
- Multiple instances
- Horizontal Pod Autoscaler (K8s)
- Cost optimization

---

## Summary

**What you learned:**
- Docker containerization
- CI/CD with GitHub Actions
- Platform deployment configs
- Environment management
- Health checks and monitoring

**Next Steps:**
- Read: [Monitoring and Logging](/api/guides/concepts/monitoring)
- Practice: Deploy a full-stack app
- Explore: Kubernetes basics

---

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
