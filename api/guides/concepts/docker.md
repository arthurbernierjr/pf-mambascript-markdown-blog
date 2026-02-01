---
title: "Docker Fundamentals"
subTitle: "Containerize Your Applications"
excerpt: "Containers make deployment consistent and reliable everywhere."
featureImage: "/img/docker.png"
date: "2026-02-01"
order: 818
---

# Explanation

## What is Docker?

Docker is a platform for developing, shipping, and running applications in containers. Containers package code with all dependencies, ensuring consistency across environments.

### Key Concepts

| Concept | Description |
|---------|-------------|
| Image | Read-only template for containers |
| Container | Running instance of an image |
| Dockerfile | Instructions to build an image |
| Registry | Storage for Docker images |
| Volume | Persistent data storage |

---

# Demonstration

## Example 1: Basic Dockerfile

```dockerfile
# Node.js application
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "index.js"]
```

```bash
# Build image
docker build -t my-app:1.0 .

# Run container
docker run -d -p 3000:3000 --name my-app my-app:1.0

# View logs
docker logs my-app

# Stop and remove
docker stop my-app
docker rm my-app

# List images and containers
docker images
docker ps -a
```

## Example 2: Multi-Stage Build

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Switch to non-root user
USER appuser

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```dockerfile
# Python application with multi-stage
FROM python:3.11-slim AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim
WORKDIR /app

# Copy virtual environment
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application
COPY . .

# Non-root user
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
```

## Example 3: Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://postgres:postgres@db:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - api
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Scale a service
docker-compose up -d --scale api=3

# Stop and remove
docker-compose down

# Remove volumes too
docker-compose down -v
```

## Example 4: Networking and Volumes

```yaml
# docker-compose.yml with advanced networking
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    networks:
      - frontend-network

  api:
    build: ./api
    networks:
      - frontend-network
      - backend-network
    expose:
      - "4000"

  db:
    image: postgres:15
    networks:
      - backend-network
    volumes:
      - db-data:/var/lib/postgresql/data

networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    internal: true  # No external access

volumes:
  db-data:
    driver: local
```

```bash
# Volume operations
docker volume create my-data
docker volume ls
docker volume inspect my-data
docker volume rm my-data

# Mount volume
docker run -v my-data:/app/data my-app

# Bind mount (development)
docker run -v $(pwd):/app my-app

# Named volume with driver options
docker volume create --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.1,rw \
  --opt device=:/path/to/dir \
  nfs-volume
```

## Example 5: Docker Commands Reference

```bash
# Images
docker build -t name:tag .
docker build -f Dockerfile.prod -t name:tag .
docker images
docker rmi image:tag
docker tag source:tag target:tag
docker push registry/image:tag
docker pull registry/image:tag

# Containers
docker run -d --name container image:tag
docker run -it --rm image:tag /bin/sh
docker run -p 8080:80 -v /host:/container image
docker run -e VAR=value --env-file .env image
docker exec -it container /bin/sh
docker logs -f --tail 100 container
docker inspect container
docker cp container:/path/file ./local

# Cleanup
docker system prune -a
docker image prune
docker container prune
docker volume prune

# Stats and resources
docker stats
docker top container

# Networks
docker network create my-network
docker network connect my-network container
docker network inspect my-network

# Compose
docker-compose up -d
docker-compose down
docker-compose logs -f service
docker-compose exec service /bin/sh
docker-compose build --no-cache
docker-compose pull
```

## Example 6: Production Best Practices

```dockerfile
# .dockerignore
node_modules
npm-debug.log
Dockerfile*
docker-compose*
.git
.gitignore
.env*
*.md
coverage
tests

# Dockerfile with best practices
FROM node:20-alpine AS base
WORKDIR /app

# Security: Don't run as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS production

# Copy dependencies and built files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# Security: Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Metadata
LABEL maintainer="art@bpc.com"
LABEL version="1.0"

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```yaml
# Production docker-compose.yml
version: '3.8'

services:
  api:
    image: myregistry/api:${VERSION:-latest}
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    external: true
  api_key:
    external: true
```

**Key Takeaways:**
- Use multi-stage builds
- Don't run as root
- Minimize image size
- Use health checks
- Leverage build cache

---

# Imitation

### Challenge 1: Containerize a Full-Stack App

**Task:** Create Docker configuration for a React + Node.js + PostgreSQL app.

<details>
<summary>Solution</summary>

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      target: production
    ports:
      - "3000:80"
    depends_on:
      - api

  api:
    build:
      context: ./api
      target: production
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
    expose:
      - "4000"

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

</details>

---

# Practice

### Exercise 1: Optimize Image Size
**Difficulty:** Beginner

Reduce a Node.js image from 1GB to under 200MB.

### Exercise 2: Local Development Setup
**Difficulty:** Intermediate

Create a docker-compose for development with hot reload.

---

## Summary

**What you learned:**
- Dockerfile basics
- Multi-stage builds
- Docker Compose
- Networking and volumes
- Production best practices

**Next Steps:**
- Read: [CI/CD](/api/guides/concepts/ci-cd)
- Practice: Containerize your projects
- Explore: Kubernetes, Docker Swarm

---

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
