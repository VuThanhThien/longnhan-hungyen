.PHONY: help install dev dev-api dev-web dev-admin \
        build build-api build-web build-admin \
        lint format type-check \
        up down logs reset up-local \
        migration-up migration-down migration-show migration-generate \
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
	@echo "    make dev              Start all apps in watch mode"
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
	@echo "  Database"
	@echo "    make migration-up     Run pending migrations"
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

dev:
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

# ── Database ──────────────────────────────────────────────────────────────────

migration-up:
	pnpm --filter @longnhan/api migration:up

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
