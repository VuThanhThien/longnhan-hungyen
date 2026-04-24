---
title: Production SMTP + remove MailDev
status: completed
spec: docs/features/production-smtp-maildev-removal.md
created: 2026-04-24
completed: 2026-04-24
---

## Goal

Point **production** at a **free-tier transactional SMTP** host using existing `MAIL_*` + Nodemailer. **Remove MailDev** (Compose, Dockerfile, docs, Makefile). **Document** separate **dev/sandbox** provider credentials. Ensure **no automated test** opens a real SMTP connection.

## Preconditions

- Design spec: [docs/features/production-smtp-maildev-removal.md](../../features/production-smtp-maildev-removal.md).
- Provider account(s): production + non-prod; sending domain DNS (SPF/DKIM) as required by chosen vendor.

## Phase 1 — Docker & Makefile

**Files:** `docker-compose.yml`, `docker-compose.local.yml`, `Makefile`, `apps/api/maildev.Dockerfile` (delete).

1. Remove `maildev` service from `docker-compose.yml`.
2. In `docker-compose.local.yml`: remove `maildev` service; remove `maildev` from `api.depends_on` (keep `db`, `redis`).
3. Delete `apps/api/maildev.Dockerfile`.
4. `Makefile`: replace `db redis maildev pgadmin` with `db redis pgadmin` in `docker compose` invocations and help text (`make dev`, `make up`, reset target ~L105–114).

## Phase 2 — Env examples & local dev story

**Files:** `apps/api/.env.example`, optionally `apps/api/.env.docker` if it pins MailDev host.

1. Replace MailDev-oriented defaults with **placeholder** provider SMTP (`MAIL_HOST`, `MAIL_PORT` 587, `MAIL_SECURE=false`, `MAIL_REQUIRE_TLS=true`, `MAIL_IGNORE_TLS=false` or per vendor doc) + short comment: use **provider dashboard dev project**, never prod keys locally.
2. Remove `MAIL_CLIENT_PORT` if nothing else references it (grep repo); if still used elsewhere, drop after MailDev removal.
3. Align `mail-config.spec.ts` first test: it sets `MAIL_PASS` but runtime uses `MAIL_PASSWORD` — **fix** to `MAIL_PASSWORD` so the test matches production config (no behavior change to app).

## Phase 3 — Documentation sweep

**Files (minimum):** `README.md`, `CLAUDE.md`, `apps/api/README.md`, `deploy/README.md`, `docs/deployment-guide.md`, `docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/project-overview-pdr.md`, `docs/project-roadmap.md`, `docs/project-changelog.md` (changelog entry for the change).

1. Remove MailDev URLs, ports (1080/1025/1026), and “start maildev” from setup commands.
2. **Production section:** one concrete SMTP example (e.g. SendGrid or Brevo) with `MAIL_USER` / `MAIL_PASSWORD` semantics; link to provider SMTP doc.
3. **Local dev:** “configure `MAIL_*` to your **sandbox** SMTP; no local mail catcher in repo.”
4. Update architecture diagrams/lists that show `maildev` as a node.

**Skip / separate:** `repomix-output.xml` is generated — regenerate with repomix later if the team keeps that artifact in git, or exclude from manual edits per team practice.

## Phase 4 — Test policy verification

1. `rg 'sendMail|createTransport|MailerService' apps/api --glob '*.spec.ts'` — expect **no** real transport usage; keep only mocks.
2. If any match appears, **delete or rewrite** to `useValue` / `jest.fn()` mocks.
3. Run `pnpm --filter @longnhan/api test` (or repo-standard test command) with CI-like env to confirm no accidental network mail (existing suite should already pass).

## Phase 5 — Runtime / deployment

1. On production host or PaaS: set **production** `MAIL_*` secrets; **do not** run a MailDev container.
2. Smoke: trigger one transactional email (e.g. password reset or verification) and confirm inbox delivery + provider dashboard log.

## Verification checklist (before merge)

- [x] `docker compose up -d db redis pgadmin` succeeds; no `maildev` image build.
- [x] `docker compose -f docker-compose.local.yml` **api** starts without `maildev` dependency.
- [x] `make dev` / `make up` help text and commands match new service list.
- [x] Docs and `.env.example` agree on variable names and local vs prod story.
- [x] API tests green; grep shows no spec opening SMTP.

## Out of scope (this plan)

- Switching to provider **HTTP API** (Resend SDK, etc.).
- Adding a new `MAIL_DISABLED` feature flag (can be a follow-up if team wants local without sending mail).
- Regenerating `repomix-output.xml` unless explicitly requested.
