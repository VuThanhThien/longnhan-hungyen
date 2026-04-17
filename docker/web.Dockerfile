# Production image for @longnhan/web (Next.js standalone)
# Build: docker build -f docker/web.Dockerfile -t longnhan-web:prod .
# Requires apps/web/.env.production (NEXT_PUBLIC_* and any server keys for build).

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /workspace

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
# next build loads apps/web/.env.production when NODE_ENV=production
ENV NODE_ENV=production

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY tsconfig.base.json ./
COPY packages/types ./packages/types
COPY apps/web ./apps/web
RUN test -f apps/web/.env.production || (echo "Missing apps/web/.env.production" && exit 1)

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @longnhan/types build
RUN pnpm --filter @longnhan/web build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /workspace/apps/web/.next/standalone ./
COPY --from=builder /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /workspace/apps/web/public ./apps/web/public
COPY --from=builder /workspace/apps/web/.env.production ./apps/web/.env.production

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/web/server.js"]
