# Production image for @longnhan/web (Next.js standalone)
# Build: docker build -f docker/web.Dockerfile -t longnhan-web:prod .
# Requires apps/web/.env.production (NEXT_PUBLIC_* and any server keys for build).

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /workspace

# ── deps stage: only lockfile + package.json files ────────────────────────────
# This layer is cached until pnpm-lock.yaml or any package.json changes.
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY tsconfig.base.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

# ── builder stage: add source + build ─────────────────────────────────────────
# Only this stage re-runs when code or .env.production changes.
FROM deps AS builder
ENV NEXT_TELEMETRY_DISABLED=1
# next build loads apps/web/.env.production when NODE_ENV=production
ENV NODE_ENV=production

COPY packages/types ./packages/types
COPY apps/web ./apps/web
RUN test -f apps/web/.env.production || (echo "Missing apps/web/.env.production" && exit 1)

RUN pnpm --filter @longnhan/types build
RUN pnpm --filter @longnhan/web build

# ── runner stage: minimal production image ─────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /workspace/apps/web/.next/standalone ./
COPY --from=builder /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /workspace/apps/web/public ./apps/web/public
COPY --from=builder /workspace/apps/web/.env.production ./apps/web/.env.production

# Standalone COPY leaves root ownership; nextjs must write .next/cache (disk LRU).
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/web/server.js"]
