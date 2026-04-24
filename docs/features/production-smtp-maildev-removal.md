# Production SMTP + remove MailDev (design spec)

## Problem

**MailDev** is a local SMTP sink + web UI. It does **not** deliver mail to real inboxes. If the same Compose stack or env patterns leak to **production**, mail “succeeds” to MailDev but users get nothing. Goal: **production uses a free-tier transactional SMTP provider** over the **existing** NestJS Mailer + Nodemailer `MAIL_*` config. **Remove MailDev** from the repo and runtime. **Developers** use a **separate** provider account / sender (sandbox posture). **Automated tests** must **never** open a real SMTP session or call a live provider.

## User stories

- As **ops**, I want **prod** `MAIL_*` pointing at a **public SMTP** host with TLS and a verified sending domain so transactional mail reaches users.
- As **dev**, I want **local** `.env` with **non-prod** API key / sender so mistakes do not use production credentials.
- As **maintainer**, I want **no MailDev** service, image, or docs so nobody deploys a fake mail server by accident.
- As **CI**, I want the test suite to **never** depend on real `MAIL_HOST` or network mail; mail paths stay **mocked or stubbed**.

## Decisions (locked)

| Topic             | Choice                                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prod integration  | **SMTP only** — keep `mail.config.ts` + Nodemailer; no provider HTTP API in this work.                                                                                                                                                                                                                                                                   |
| MailDev           | **Remove everywhere** — delete Compose service(s), `maildev.Dockerfile`, and doc references that imply MailDev is part of the stack.                                                                                                                                                                                                                     |
| Non-prod mail     | **Real provider, separate credentials/sender** (dev/staging account or sub-account; verified **non-prod** from-address / domain where required).                                                                                                                                                                                                         |
| Tests vs provider | **No unit/integration test may call a real SMTP endpoint** when `pnpm test` (or CI) runs. Remove any test that sends mail over the network; use mocks (`MailService`, queue, `MailerService` stubs). If a test ever needs “real” behavior, it must be **opt-in** (separate script, not default CI) — **out of scope** for this spec unless product asks. |

## Provider choice (recommendation, not vendor-lock in code)

Pick **one** free-tier transactional SMTP product and document exact `MAIL_*` values in `docs/deployment-guide.md` (and `.env.example` comments): e.g. **Brevo**, **SendGrid**, **Mailjet** — all support SMTP + API keys; **code stays SMTP**. Criteria: monthly free cap, Vietnam deliverability anecdote if known, domain verification steps (SPF/DKIM).

## Architecture / data flow

Unchanged at code level:

1. App loads `mail` config from env.
2. BullMQ / services call **MailService** (or templates) → Nodemailer → **remote SMTP** (`MAIL_HOST`:`MAIL_PORT`).

**Before:** local `MAIL_HOST=localhost` + MailDev container. **After:** local `MAIL_HOST=<provider SMTP host>` + dev credentials (or optional future “mail disabled” flag — **not** in locked decisions unless added later).

## MailDev removal checklist (implementation)

- `docker-compose.yml`: remove `maildev` service and any `depends_on` / `links` to it.
- `docker-compose.local.yml`: same; fix `api` service `depends_on` if it listed `maildev`.
- Delete `apps/api/maildev.Dockerfile`.
- Docs: `README.md`, `CLAUDE.md`, `apps/api/README.md`, `deploy/README.md`, `docs/deployment-guide.md`, `docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/project-overview-pdr.md`, `docs/project-roadmap.md`, `docs/project-changelog.md` — strip MailDev ports/tables; add “local = real SMTP dev account” one-liner.
- `.env.example`: replace MailDev-oriented `MAIL_HOST`/`MAIL_PORT` with placeholder provider SMTP + comment “use dev project in provider dashboard”.
- `MAIL_CLIENT_PORT`: remove if only used for MailDev UI (grep before delete).

## Error handling / edge cases

- **Misconfigured prod:** Nodemailer errors → existing logs/queue retry behavior; document common TLS/port mistakes (`MAIL_SECURE` / `MAIL_REQUIRE_TLS` vs port 465 vs 587).
- **Free tier exhaustion:** monitor provider dashboard; document upgrade path.
- **Spam / reputation:** mandate SPF/DKIM for `MAIL_DEFAULT_EMAIL` domain in deployment guide.

## Testing strategy

- **Keep:** config unit tests (`mail-config.spec.ts`) with **fake** hosts (`smtp.example.com`) — no network.
- **Keep:** `MailService` / queue tests with **jest mocks** — no `MailerService` integration.
- **Remove or rewrite:** any test that instantiates a real transporter, calls `sendMail` against `process.env.MAIL_HOST`, or uses `nodemailer.createTransport` without mock — **must not exist** after implementation pass (repo audit today: no `sendMail` in `*.spec.ts`; re-grep in PR).
- **CI:** do not inject production `MAIL_*` secrets; use dummy values compatible with validators, or skip mail module bootstrap in narrow tests if needed.

## Implementation risks

- Developers forget dev credentials → local mail fails until they configure provider dev project (mitigate: clear `.env.example` + README).
- Removing MailDev may break `make dev` scripts that assume `docker compose ... maildev` — update `deploy/README.md` and any Makefile targets.

## Success metrics

- Production orders / auth flows receive real emails (spot-check).
- `docker compose` / prod host **no** `maildev` container or image build.
- `pnpm test` for API passes **with** `MAIL_HOST=smtp.example.com` (or CI defaults) and **zero** SMTP sockets opened (optional: document `NODE_OPTIONS`/firewall not required if mocks hold).

## Next steps

1. Review/approve this spec.
2. Run **`/plan`** with this file as context for an implementation plan (Compose + Dockerfile + docs + env examples + script/Makefile grep).

Spec path: `docs/features/production-smtp-maildev-removal.md`. Reply with changes you want, or **approved** to proceed to planning.
