# Production image for @longnhan/admin (Next.js standalone)
# Requires apps/admin/.env.production (e.g. API_URL for server actions).
# Build: docker build -f docker/admin.Dockerfile -t longnhan-admin:prod .

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /workspace

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY tsconfig.base.json ./
COPY packages/types ./packages/types
COPY apps/admin ./apps/admin
RUN test -f apps/admin/.env.production || (echo "Missing apps/admin/.env.production" && exit 1)

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @longnhan/types build
RUN pnpm --filter @longnhan/admin build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /workspace/apps/admin/.next/standalone ./
COPY --from=builder /workspace/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /workspace/apps/admin/public ./apps/admin/public
COPY --from=builder /workspace/apps/admin/.env.production ./apps/admin/.env.production

USER nextjs

EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/admin/server.js"]
