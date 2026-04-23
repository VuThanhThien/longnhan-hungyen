# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role & Responsibilities

Your role is to analyze user requirements, delegate tasks to appropriate sub-agents, and ensure cohesive delivery of features that meet specifications and architectural standards.

## Workflows

- Primary workflow: `./.claude/rules/primary-workflow.md`
- Development rules: `./.claude/rules/development-rules.md`
- Orchestration protocols: `./.claude/rules/orchestration-protocol.md`
- Documentation management: `./.claude/rules/documentation-management.md`
- And other workflows: `./.claude/rules/*`

**IMPORTANT:** Analyze the skills catalog and activate the skills that are needed for the task during the process.
**IMPORTANT:** You must follow strictly the development rules in `./.claude/rules/development-rules.md` file.
**IMPORTANT:** Before you plan or proceed any implementation, always read the `./README.md` file first to get context.
**IMPORTANT:** Sacrifice grammar for the sake of concision when writing reports.
**IMPORTANT:** In reports, list any unresolved questions at the end, if any.

## Hook Response Protocol

### Privacy Block Hook (`@@PRIVACY_PROMPT@@`)

When a tool call is blocked by the privacy-block hook, the output contains a JSON marker between `@@PRIVACY_PROMPT_START@@` and `@@PRIVACY_PROMPT_END@@`. **You MUST use the `AskUserQuestion` tool** to get proper user approval.

**Required Flow:**

1. Parse the JSON from the hook output
2. Use `AskUserQuestion` with the question data from the JSON
3. Based on user's selection:
   - **"Yes, approve access"** → Use `bash cat "filepath"` to read the file (bash is auto-approved)
   - **"No, skip this file"** → Continue without accessing the file

**Example AskUserQuestion call:**

```json
{
  "questions": [
    {
      "question": "I need to read \".env\" which may contain sensitive data. Do you approve?",
      "header": "File Access",
      "options": [
        {
          "label": "Yes, approve access",
          "description": "Allow reading .env this time"
        },
        {
          "label": "No, skip this file",
          "description": "Continue without accessing this file"
        }
      ],
      "multiSelect": false
    }
  ]
}
```

**IMPORTANT:** Always ask the user via `AskUserQuestion` first. Never try to work around the privacy block without explicit user approval.

## Python Scripts (Skills)

When running Python scripts from `.claude/skills/`, use the venv Python interpreter:

- **Linux/macOS:** `.claude/skills/.venv/bin/python3 scripts/xxx.py`
- **Windows:** `.claude\skills\.venv\Scripts\python.exe scripts\xxx.py`

This ensures packages installed by `install.sh` (google-genai, pypdf, etc.) are available.

**IMPORTANT:** When scripts of skills failed, don't stop, try to fix them directly.

## [IMPORTANT] Consider Modularization

- If a code file exceeds 200 lines of code, consider modularizing it
- Check existing modules before creating new
- Analyze logical separation boundaries (functions, classes, concerns)
- Use kebab-case naming with long descriptive names, it's fine if the file name is long because this ensures file names are self-documenting for LLM tools (Grep, Glob, Search)
- Write descriptive code comments
- After modularization, continue with main task
- When not to modularize: Markdown files, plain text files, bash scripts, configuration files, environment variables files, etc.

## Repository Overview

E-commerce platform for longan fruit products. **pnpm + Turborepo monorepo** with three apps and one shared package.

```
apps/
  api/     @longnhan/api    NestJS 10 REST API (port 3001, Swagger at /api-docs)
  web/     @longnhan/web    Next.js storefront (port 3000)
  admin/   @longnhan/admin  Next.js admin panel (port 3002)
packages/
  types/   @longnhan/types  Shared TS types (workspace:*)
```

**Stack:** Node ≥20.10, pnpm ≥9.5, PostgreSQL (port 5435 in Docker), Redis/BullMQ (6380), TypeORM, Cloudinary, MailDev (1080), pgAdmin (5050).

## Common Commands

Run from repo root unless noted. Turbo fans out to all apps; use `pnpm --filter <pkg>` or the `:api`/`:web`/`:admin` aliases for a single app.

```bash
# Dev
pnpm dev                    # all apps via turbo
pnpm dev:api | dev:web | dev:admin

# Build / lint / format / typecheck (turbo or per-app)
pnpm build           pnpm build:api
pnpm lint            pnpm lint:fix       pnpm lint:api
pnpm format          pnpm type-check

# Local infra (DB, Redis, MailDev, pgAdmin)
docker compose up -d db redis maildev pgadmin
pnpm docker:up | docker:down | docker:reset

# API DB workflow (run inside apps/api or via filter)
pnpm --filter @longnhan/api migration:up
pnpm --filter @longnhan/api migration:generate src/database/migrations/<Name>
pnpm --filter @longnhan/api migration:down
pnpm --filter @longnhan/api seed:run
pnpm --filter @longnhan/api db:create | db:drop

# API tests (Jest)
pnpm --filter @longnhan/api test
pnpm --filter @longnhan/api test -- <pattern>      # single file/pattern
pnpm --filter @longnhan/api test:watch
pnpm --filter @longnhan/api test:cov
pnpm --filter @longnhan/api test:e2e

# Frontend "test" = type-check (no Jest configured for web/admin)
pnpm --filter @longnhan/admin test    # tsc --noEmit
```

First-time setup: `pnpm install` → copy `.env.example` files → `docker compose up -d db redis maildev pgadmin` → `pnpm --filter @longnhan/api migration:up` → `pnpm dev`.

## Architecture Notes

**API (`apps/api/src/`)** — NestJS feature modules under `api/` (auth, products, orders, reviews, vouchers, articles, categories, media, user, dashboard, post, home, health). Cross-cutting concerns live in sibling top-level dirs: `common/`, `config/`, `database/` (data-source + migrations + seeders), `guards/`, `filters/`, `decorators/`, `exceptions/`, `i18n/`, `mail/`, `redis/`, `background/` (BullMQ workers), `integrations/` (Cloudinary etc.), `shared/`, `libs/`, `generated/`. Entry: `main.ts` → `app.module.ts` → `api/api.module.ts`. TypeORM data source: `src/database/data-source.ts` (used by all `pnpm typeorm` scripts via `env-cmd`).

**Web & Admin (Next.js App Router)** — `app/` routes, `components/` (shadcn/ui under `components/ui/`), `features/` (admin only, feature-sliced), `services/` (API clients), `hooks/`, `lib/`, `proxy.ts` for backend proxying. State/data via TanStack Query. Admin uses Radix primitives + Tailwind (shadcn). Web adds Sentry instrumentation.

**Shared types** — `packages/types` re-exported as `@longnhan/types`; use it instead of duplicating DTO/entity shapes across apps.

**Turbo pipeline** — `turbo.json` defines `dev`/`build`/`lint`/`type-check`/`format` tasks across the workspace; prefer the root `pnpm <task>` form so caching works.

## Documentation Management

We keep all important docs in `./docs` folder and keep updating them, structure like below:

```
./docs
├── project-overview-pdr.md
├── code-standards.md
├── codebase-summary.md
├── design-guidelines.md
├── deployment-guide.md
├── system-architecture.md
└── project-roadmap.md
```

**Visual design (admin):** Repository root **`DESIGN.md`** is the narrative design spec; implement admin UI with **shadcn/ui** under `apps/admin/src/components/ui/`. Details: **`apps/admin/AGENTS.md`** and **`docs/frontend-code-standards.md`** (Admin UI section).

**IMPORTANT:** _MUST READ_ and _MUST COMPLY_ all _INSTRUCTIONS_ in project `./CLAUDE.md`, especially _WORKFLOWS_ section is _CRITICALLY IMPORTANT_, this rule is _MANDATORY. NON-NEGOTIABLE. NO EXCEPTIONS. MUST REMEMBER AT ALL TIMES!!!_
