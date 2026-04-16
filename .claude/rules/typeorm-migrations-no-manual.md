---
description: Enforce TypeORM-generated migrations (no manual files) for apps/api entity changes
alwaysApply: true
---

# TypeORM migrations (apps/api): never manual

When we change/update any database entity in `apps/api`, **do not create or edit migration files manually**.

## Required flow

- **Generate migration via TypeORM**

```bash
cd apps/api
pnpm run migration:generate src/database/migrations/${CHANGE_NAME}
```

- **Pause and ask for approval** before applying it:
  - Ask: “Do you want me to run migrations now (`pnpm run migration:up`)? Yes/No”

- **Only if user approves**, apply migrations:

```bash
cd apps/api
pnpm run migration:up
```

## Notes

- Migration name: use a short, descriptive PascalCase or kebab-case `${CHANGE_NAME}` matching the entity change (e.g. `AddProductReviewStatus`, `order-tracking-token`).
- If generation fails or produces unexpected SQL, stop and diagnose—**do not hand-edit migrations** as a workaround.
