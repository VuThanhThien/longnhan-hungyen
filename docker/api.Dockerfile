# Monorepo-aware production image for @longnhan/api
# Build: docker build -f docker/api.Dockerfile -t longnhan-api:prod .
# Runtime configuration: pass apps/api/.env.production via docker-compose env_file (see docker-compose.prod.yml).

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /workspace

FROM base AS builder
# pnpm refuses to remove node_modules without a TTY unless CI=true (Docker builds have no TTY)
ENV CI=true
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

RUN pnpm fetch

COPY packages/types ./packages/types
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @longnhan/types build
RUN pnpm --filter @longnhan/api build
# Portable app + production node_modules (pnpm virtual store under /workspace is not copy-friendly)
RUN pnpm --filter @longnhan/api deploy --prod --legacy /out/api

FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

COPY --chown=nestjs:nodejs --from=builder /out/api /app
# WORKDIR creates /app as root; COPY --chown does not change ownership of the destination dir, so nestjs
# cannot mkdir nestjs-i18n typesOutputPath (see apps/api/src/utils/modules-set.ts → /app/src/generated).
RUN chown nestjs:nodejs /app

USER nestjs

ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
