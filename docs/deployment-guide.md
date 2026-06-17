# Deployment Guide

**Last Updated:** 2026-04-01
**Production Targets:** Railway (API), Vercel (web + admin)

---

## Overview

This guide covers setting up, deploying, and maintaining the Long Nhan Hung Yen API in development, staging, and production environments.

---

## Prerequisites

### Required Software

- Docker & Docker Compose
- Node.js >= 20.10.0
- pnpm >= 9.5.0
- PostgreSQL 13+ (can use Docker)
- Redis (can use Docker)

### Required Credentials

- Cloudinary account (production media uploads)
- Brevo API key (https://app.brevo.com/settings/keys/api)
- PostgreSQL database credentials
- JWT secret key (generate securely)

---

## Local Development Setup

### 1. Clone & Install

```bash
# Clone repository
git clone <repo-url> longnhantongtran
cd longnhantongtran

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` for local development:

```env
# Application
NODE_ENV=development
APP_PORT=3000
APP_DEBUG=true
APP_CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5435
DATABASE_NAME=nestjs_api
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

# Authentication
AUTH_JWT_SECRET=dev-secret-key-change-in-prod
AUTH_JWT_TOKEN_EXPIRES_IN=1d
AUTH_REFRESH_SECRET=dev-refresh-secret-change-in-prod

# Email (Brevo SDK — get key at https://app.brevo.com/settings/keys/api)
BREVO_API_KEY=<your-brevo-api-key>
MAIL_DEFAULT_EMAIL=noreply@localhost
MAIL_DEFAULT_NAME=No Reply

# Cloudflare Turnstile (CAPTCHA for COD orders)
# Use test keys for local dev: https://developers.cloudflare.com/turnstile/get-started/
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

### 3. Start Infrastructure

```bash
# Option A: Start only database/cache services
docker compose up -d db redis pgadmin

# Option B: Full local dev stack with API container (hot-reload)
docker compose -f docker-compose.local.yml up --build -d
```

**Services:**

- PostgreSQL: localhost:5435
- Redis: localhost:6380
- PgAdmin: http://localhost:5050
- API (if using `docker-compose.local.yml`): http://localhost:3001 (host mapping in compose)

### 4. Initialize Database

```bash
# Create database (if not using docker compose)
pnpm db:create

# Run migrations
pnpm migration:up

# Seed sample data
pnpm seed:run
```

### 5. Start Development Server

```bash
# Terminal method
pnpm dev

# Or via Docker (if using docker-compose.local.yml)
# Already running, check logs with:
docker compose -f docker-compose.local.yml logs -f api
```

API available at: http://localhost:3001 (see root `README.md` for all local ports)
Swagger docs: http://localhost:3001/api-docs

---

## Staging Deployment

### Setup

Staging uses the production Docker Compose stack without the API container (deploy separately).

```bash
# 1. SSH into staging server
ssh user@staging-server

# 2. Clone repository
git clone <repo-url> longnhantongtran
cd longnhantongtran

# 3. Create staging .env file
cat > .env << EOF
NODE_ENV=staging
APP_PORT=3000
APP_DEBUG=false
APP_CORS_ORIGIN=https://staging.example.com

DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_NAME=nestjs_api
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=$(openssl rand -base64 32)

AUTH_JWT_SECRET=$(openssl rand -hex 32)
AUTH_JWT_TOKEN_EXPIRES_IN=1d
AUTH_REFRESH_SECRET=$(openssl rand -hex 32)

BREVO_API_KEY=<staging-brevo-api-key>
MAIL_DEFAULT_EMAIL=noreply@staging.example.com
MAIL_DEFAULT_NAME=No Reply

# Cloudinary (if available in staging)
# CLOUDINARY_CLOUD_NAME=xxx
# CLOUDINARY_API_KEY=xxx
# CLOUDINARY_API_SECRET=xxx

# Cloudflare Turnstile (COD bot protection)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<staging-site-key>
TURNSTILE_SECRET_KEY=<staging-secret-key>
EOF

# 4. Start infrastructure
docker compose up -d db redis pgadmin
```

### Deploy API

```bash
# 1. Build production image
docker build -t api:staging -f apps/api/Dockerfile .

# 2. Run API container
docker run -d \
  --name api \
  --network longnhan-network \
  -p 3000:3000 \
  --env-file .env \
  api:staging

# 3. Verify
curl http://localhost:3000/health
```

### Initialize Database

```bash
# Run migrations inside container
docker exec api pnpm migration:up

# Seed data
docker exec api pnpm seed:run
```

### Verification Checklist

- [ ] API responds on port 3000
- [ ] Swagger docs accessible at `/api-docs`
- [ ] Database migrations applied
- [ ] Sample data seeded
- [ ] SMTP configured (provider sandbox for staging)
- [ ] PostgreSQL accessible via PgAdmin
- [ ] Redis available for caching

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing (`pnpm test`)
- [ ] Code reviewed and merged to main
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL/TLS certificates obtained
- [ ] CDN/reverse proxy configured
- [ ] Monitoring & alerting setup
- [ ] Rollback plan documented

### Production Environment Variables

Create secure `.env.production`:

```env
# Application
NODE_ENV=production
APP_PORT=3000
APP_DEBUG=false
APP_CORS_ORIGIN=https://api.example.com

# Database
DATABASE_HOST=prod-db.example.com
DATABASE_PORT=5432
DATABASE_NAME=longnhan_prod
DATABASE_USERNAME=app_user
DATABASE_PASSWORD=<secure-password>
DATABASE_SSL_ENABLED=true
DATABASE_REJECT_UNAUTHORIZED=true

# Authentication
AUTH_JWT_SECRET=<secure-random-hex-32>
AUTH_JWT_TOKEN_EXPIRES_IN=1d
AUTH_REFRESH_SECRET=<secure-random-hex-32>

# Email (Brevo SDK)
BREVO_API_KEY=<production-brevo-api-key>
MAIL_DEFAULT_EMAIL=noreply@longnhan.vn
MAIL_DEFAULT_NAME=Long Nhan Hung Yen

# Cloudinary (Required)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Cloudflare Turnstile (COD bot protection) — https://dash.cloudflare.com/
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<production-site-key>
TURNSTILE_SECRET_KEY=<production-secret-key>
```

**Secure Storage:**

- Use environment management: AWS Secrets Manager, HashiCorp Vault, or similar
- Never commit `.env.production` to git
- Rotate secrets regularly
- Use HTTPS only

### Docker Build & Push

```bash
# 1. Build image with version tag
VERSION=1.0.0
docker build -t api:$VERSION -f apps/api/Dockerfile .

# 2. Tag for registry
docker tag api:$VERSION your-registry.com/longnhan/api:$VERSION
docker tag api:$VERSION your-registry.com/longnhan/api:latest

# 3. Push to registry
docker push your-registry.com/longnhan/api:$VERSION
docker push your-registry.com/longnhan/api:latest
```

### Deploy to Production

#### Option A: Docker Swarm

```bash
# 1. Create docker-compose.production.yml
cat > docker-compose.production.yml << 'EOF'
version: '3.8'

services:
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: longnhan_prod
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - longnhan-network
    deploy:
      replicas: 1

  redis:
    image: redis:7-alpine
    networks:
      - longnhan-network
    deploy:
      replicas: 1

  api:
    image: your-registry.com/longnhan/api:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_HOST=db
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env.production
    networks:
      - longnhan-network
    depends_on:
      - db
      - redis
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s

volumes:
  postgres_data:

networks:
  longnhan-network:
    driver: overlay
EOF

# 2. Deploy stack
docker stack deploy -c docker-compose.production.yml longnhan
```

#### Option B: Kubernetes

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
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
          image: your-registry.com/longnhan/api:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DATABASE_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: db-host
          envFrom:
            - secretRef:
                name: app-secrets
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

Deploy:

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

#### Option C: Manual Server Deployment

```bash
# 1. SSH into production server
ssh deploy@prod-server

# 2. Clone repo
cd /var/www
git clone <repo-url> longnhan
cd longnhan

# 3. Copy production .env (securely obtained)
# scp .env.production deploy@prod-server:/var/www/longnhan/.env

# 4. Build locally or pull pre-built image
docker pull your-registry.com/longnhan/api:latest

# 5. Start production stack
docker compose -f docker-compose.yml up -d

# 6. Run migrations
docker compose exec api pnpm migration:up

# 7. Verify health
curl http://localhost:3000/health
```

### Post-Deployment Verification

```bash
# 1. Check API health
curl https://api.example.com/health

# 2. Verify Swagger docs
curl https://api.example.com/api-docs

# 3. Test authentication
curl -X POST https://api.example.com/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 4. Check logs
docker logs api  # or kubectl logs deployment/api

# 5. Monitor metrics
# Check memory, CPU, disk usage, response times
```

---

## Database Management

### Migrations

Migrations are **auto-generated** from entities. Never write manually.

```bash
# Create migration from entity changes
pnpm migration:generate src/database/migrations/AddProductTable

# List migrations
pnpm migration:show

# Run pending migrations
pnpm migration:up

# Rollback last migration
pnpm migration:down
```

### Backup & Restore

#### PostgreSQL Backup

```bash
# Full database dump
docker exec db pg_dump -U postgres nestjs_api > backup.sql

# Restore from backup
cat backup.sql | docker exec -i db psql -U postgres -d nestjs_api
```

#### Automated Backups (Production)

Production uses a Docker **db-backup sidecar** (nightly 02:00 UTC, local 7-day retention on Docker volume, webhook on failure). Full setup, verify, and restore steps:

**→ [deploy/README.md §7 Database backups](../deploy/README.md#7-database-backups)**

Quick manual dump (same host, no sidecar):

```bash
docker exec longnhan_prod_db pg_dump -U longnhan -d longnhan | gzip > backup_manual.sql.gz
```

---

## Database Management

### Migrations

Migrations are **auto-generated** from entities. Never write manually.

```bash
# Create migration from entity changes
pnpm migration:generate src/database/migrations/AddProductTable

# List migrations
pnpm migration:show

# Run pending migrations
pnpm migration:up

# Rollback last migration
pnpm migration:down
```

### Backup & Restore

#### PostgreSQL Backup

```bash
# Full database dump
docker exec db pg_dump -U postgres nestjs_api > backup.sql

# Restore from backup
cat backup.sql | docker exec -i db psql -U postgres -d nestjs_api
```

---

## Post-Deployment Verification

```bash
# 1. Check API health
curl https://api.example.com/health

# 2. Verify Swagger docs
curl https://api.example.com/api-docs

# 3. Test authentication
curl -X POST https://api.example.com/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 4. Check logs
docker logs api

# 5. Monitor metrics
# Check memory, CPU, disk usage
```

---

## Troubleshooting

### API Container Won't Start

```bash
# Check logs
docker logs api

# Common causes: Database not accessible, missing ENV vars, port in use
docker ps -a
docker logs api
```

### Database Migrations Failed

```bash
pnpm migration:show
pnpm migration:down
pnpm migration:up
```

### Memory Issues

```bash
docker stats api
docker run -e "NODE_OPTIONS=--max-old-space-size=2048" api:latest
```

---

## Rollback Procedure

#### Docker Swarm

```bash
docker service update --image your-registry.com/longnhan/api:previous longnhan_api
curl http://localhost:3000/health
```

#### Kubernetes

```bash
kubectl rollout undo deployment/api
kubectl rollout status deployment/api
```

---

## References

- [API App README](../apps/api/README.md)
- [Docker Documentation](https://docs.docker.com/)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [PostgreSQL Backup](https://www.postgresql.org/docs/13/backup.html)
