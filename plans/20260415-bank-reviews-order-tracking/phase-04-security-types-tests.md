# Phase 04 — Security hardening, shared types, tests

## Overview

Cross-cutting: align **`packages/types`** (`OrderStatus` duplicate value cleanup if safe), integration tests for **lookup** + **review create**, lint. Document new env vars in `docs/` only if project convention requires — **prefer** `.env.example` comments per development-rules.

## Requirements

- E2E or integration: Nest testing module for orders lookup (mock repo).
- Web: smoke test for track page (optional Playwright — follow existing `apps/web` test setup).
- Ensure **Sentry** does not capture PII on new actions (mirror `submitOrder` pattern).

## Related code files

- `packages/types/src/order.ts`
- `apps/api/test/` or `*.spec.ts` colocated
- `docs/code-standards.md` — touch only if team requires env documentation there

## Implementation steps

1. Export public DTOs from `packages/types`; sync admin/web imports.
2. Add API tests for: lookup 404, magic link mismatch, review duplicate constraint.
3. Run `pnpm lint` / affected test scripts before merge.

## Success criteria

- CI green; no new secrets; Swagger complete for new endpoints.
