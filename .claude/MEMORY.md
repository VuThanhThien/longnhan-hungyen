## Backend migration flow (TypeORM)

When adding/changing DB fields in `apps/api` (TypeORM):

- **edit entity first**: update the TypeORM entity class (e.g. `apps/api/src/api/<module>/entities/*.entity.ts`)
- **generate migration** from entity diff:
  - run `pnpm --filter @longnhan/api migration:generate src/database/migrations/<module>-<short-name>`
- **apply migration**:
  - run `pnpm --filter @longnhan/api migration:run` (aka “migration:up”)

Notes:
- Always check the generated migration content before running it.
- If the generated migration misses something, fix the entity and re-generate (don’t hand-edit unless necessary).
