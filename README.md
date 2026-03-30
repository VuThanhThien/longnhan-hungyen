# Long Nhan Hung Yen

E-commerce platform for longan fruit products — NestJS API, Next.js storefront & admin panel.

## Stack

- **API** — NestJS 10, TypeScript, PostgreSQL, TypeORM, Redis/BullMQ, Cloudinary
- **Web** — Next.js (storefront)
- **Admin** — Next.js (admin panel)
- **Monorepo** — pnpm workspaces + Turborepo

## Requirements

- Node.js >= 20.10.0
- pnpm >= 9.5.0
- Docker & Docker Compose

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env
cp apps/api/.env.example apps/api/.env  # then fill in values

# 3. Start local infrastructure (DB, Redis, MailDev, pgAdmin)
docker compose up -d db redis maildev pgadmin

# 4. Run database migrations
pnpm --filter @longnhan/api migration:run

# 5. Start development servers
pnpm dev          # all apps
pnpm dev:api      # API only (http://localhost:3001)
pnpm dev:web      # storefront only (http://localhost:3000)
pnpm dev:admin    # admin only (http://localhost:3002)
```

## Local Services

| Service  | URL                       | Purpose              |
|----------|---------------------------|----------------------|
| API      | http://localhost:3001     | REST API             |
| Swagger  | http://localhost:3001/api-docs | API docs        |
| Web      | http://localhost:3000     | Storefront           |
| Admin    | http://localhost:3002     | Admin panel          |
| MailDev  | http://localhost:1080     | Email testing UI     |
| pgAdmin  | http://localhost:5050     | Database UI          |

## Docker

```bash
# Infra only (recommended for local dev)
docker compose up -d db redis maildev pgadmin

# Full stack with API hot-reload
docker compose -f docker-compose.local.yml up --build -d

# Shortcuts
pnpm docker:up     # start all services
pnpm docker:down   # stop all services
pnpm docker:reset  # reset volumes & restart
```

## Project Structure

```
apps/
  api/        # NestJS REST API (@longnhan/api)
  web/        # Next.js storefront (@longnhan/web)
  admin/      # Next.js admin panel (@longnhan/admin)
packages/     # Shared packages
docs/         # Project documentation
```

## Documentation

See [`docs/`](docs/README.md) for architecture, code standards, deployment guide, and roadmap.
