.PHONY: help install dev dev-api dev-web dev-admin \
        build build-api build-web build-admin \
        lint format type-check \
        up down logs reset up-local \
        deploy deploy-clean deploy-down prod-preflight \
        migration-up migration-up-prod migration-down migration-show migration-generate \
        seed test test-cov test-e2e

# Default target
help:
	@echo ""
	@echo "Long Nhan Hung Yen — available commands:"
	@echo ""
	@echo "  Setup"
	@echo "    make install          Install all dependencies"
	@echo ""
	@echo "  Development"
	@echo "    make dev              Infra (db, redis, maildev, pgadmin) + all apps in watch mode"
	@echo "    make dev-api          Start API only (http://localhost:3001)"
	@echo "    make dev-web          Start storefront only (http://localhost:3000)"
	@echo "    make dev-admin        Start admin only (http://localhost:3002)"
	@echo ""
	@echo "  Build"
	@echo "    make build            Build all apps"
	@echo "    make build-api        Build API only"
	@echo ""
	@echo "  Code Quality"
	@echo "    make lint             Lint all apps"
	@echo "    make format           Format all apps"
	@echo "    make type-check       Type-check all apps"
	@echo ""
	@echo "  Docker (infra)"
	@echo "    make up               Start infra services (db, redis, maildev, pgadmin)"
	@echo "    make down             Stop all services"
	@echo "    make logs             Tail service logs"
	@echo "    make reset            Reset volumes & restart services"
	@echo "    make up-local         Start full local stack with API hot-reload"
	@echo ""
	@echo "  Production (Docker + Cloudflare Tunnel)"
	@echo "    make deploy           Build & run api, web, admin, db, redis, cloudflared (ports 13100–13102)"
	@echo "    make deploy-clean     Same as deploy but with --no-cache (full rebuild, ignores all Docker cache)"
	@echo "    make deploy-down      Stop production stack"
	@echo "                          See deploy/README.md (token or config.yml + credentials JSON)"
	@echo ""
	@echo "  Database"
	@echo "    make migration-up     Run pending migrations (local .env)"
	@echo "    make migration-up-prod Run pending migrations using apps/api/.env.production"
	@echo "    make migration-down   Revert last migration"
	@echo "    make migration-show   Show migration status"
	@echo "    make seed             Run database seeders"
	@echo ""
	@echo "  Testing"
	@echo "    make test             Run unit tests"
	@echo "    make test-cov         Run tests with coverage"
	@echo "    make test-e2e         Run e2e tests"
	@echo ""

# ── Setup ─────────────────────────────────────────────────────────────────────

install:
	pnpm install

# ── Development ───────────────────────────────────────────────────────────────

dev: up
	pnpm dev

dev-api:
	pnpm dev:api

dev-web:
	pnpm dev:web

dev-admin:
	pnpm dev:admin

# ── Build ─────────────────────────────────────────────────────────────────────

build:
	pnpm build

build-api:
	pnpm build:api

build-web:
	pnpm build:web

build-admin:
	pnpm build:admin

# ── Code Quality ──────────────────────────────────────────────────────────────

lint:
	pnpm lint

format:
	pnpm format

type-check:
	pnpm type-check

# ── Docker ────────────────────────────────────────────────────────────────────

up:
	docker compose up -d db redis maildev pgadmin

down:
	docker compose down

logs:
	docker compose logs -f

reset:
	docker compose down -v && docker compose up -d db redis maildev pgadmin

up-local:
	docker compose -f docker-compose.local.yml up --build -d

# ── Production deploy ─────────────────────────────────────────────────────────

prod-preflight:
	@test -f apps/api/.env.production || (echo "Missing apps/api/.env.production (see apps/api/.env.example)."; exit 1)
	@grep -qE '^DATABASE_PASSWORD=.+' apps/api/.env.production 2>/dev/null || (echo "apps/api/.env.production: set DATABASE_PASSWORD= to a non-empty value (required for the Postgres service and compose interpolation)."; exit 1)
	@test -f apps/web/.env.production || (echo "Missing apps/web/.env.production (see apps/web/.env.example)."; exit 1)
	@test -f apps/admin/.env.production || (echo "Missing apps/admin/.env.production (see apps/admin/.env.example)."; exit 1)
	@if grep -qE '^CLOUDFLARED_TUNNEL_TOKEN=[^#[:space:]].*' apps/api/.env.production 2>/dev/null; then \
	  : ; \
	elif [ -f deploy/cloudflare/config.yml ] && ls deploy/cloudflare/*.json >/dev/null 2>&1; then \
	  : ; \
	else \
	  echo "Cloudflare: set CLOUDFLARED_TUNNEL_TOKEN in apps/api/.env.production, OR add deploy/cloudflare/config.yml plus a credentials *.json (see deploy/cloudflare/config.yml.example)."; exit 1; \
	fi

deploy: prod-preflight
	@if grep -qE '^CLOUDFLARED_TUNNEL_TOKEN=[^#[:space:]].*' apps/api/.env.production 2>/dev/null; then \
	  docker compose -f docker-compose.prod.yml --env-file apps/api/.env.production -p longnhan-prod up -d --build --force-recreate; \
	else \
	  docker compose -f docker-compose.prod.yml -f docker-compose.prod.cloudflared-config.yml --env-file apps/api/.env.production -p longnhan-prod up -d --build --force-recreate; \
	fi

deploy-clean: prod-preflight
	@if grep -qE '^CLOUDFLARED_TUNNEL_TOKEN=[^#[:space:]].*' apps/api/.env.production 2>/dev/null; then \
	  docker compose -f docker-compose.prod.yml --env-file apps/api/.env.production -p longnhan-prod build --no-cache && \
	  docker compose -f docker-compose.prod.yml --env-file apps/api/.env.production -p longnhan-prod up -d --force-recreate; \
	else \
	  docker compose -f docker-compose.prod.yml -f docker-compose.prod.cloudflared-config.yml --env-file apps/api/.env.production -p longnhan-prod build --no-cache && \
	  docker compose -f docker-compose.prod.yml -f docker-compose.prod.cloudflared-config.yml --env-file apps/api/.env.production -p longnhan-prod up -d --force-recreate; \
	fi

deploy-down:
	@if grep -qE '^CLOUDFLARED_TUNNEL_TOKEN=[^#[:space:]].*' apps/api/.env.production 2>/dev/null; then \
	  docker compose -f docker-compose.prod.yml --env-file apps/api/.env.production -p longnhan-prod down; \
	else \
	  docker compose -f docker-compose.prod.yml -f docker-compose.prod.cloudflared-config.yml --env-file apps/api/.env.production -p longnhan-prod down; \
	fi

# ── Database ──────────────────────────────────────────────────────────────────

migration-up:
	pnpm --filter @longnhan/api migration:up

# Uses production DB credentials/host from apps/api/.env.production (e.g. DATABASE_HOST=127.0.0.1, DATABASE_PORT=5436 when stack exposes Postgres on the host).
migration-up-prod:
	@test -f apps/api/.env.production || (echo "Missing apps/api/.env.production (see apps/api/.env.example)."; exit 1)
	cd apps/api && pnpm exec env-cmd -f .env.production pnpm exec typeorm-ts-node-commonjs -d src/database/data-source.ts migration:run

migration-down:
	pnpm --filter @longnhan/api migration:down

migration-show:
	pnpm --filter @longnhan/api migration:show

migration-generate:
	pnpm --filter @longnhan/api migration:generate

seed:
	pnpm --filter @longnhan/api seed:run

# ── Testing ───────────────────────────────────────────────────────────────────

test:
	pnpm --filter @longnhan/api test

test-cov:
	pnpm --filter @longnhan/api test:cov

test-e2e:
	pnpm --filter @longnhan/api test:e2e
