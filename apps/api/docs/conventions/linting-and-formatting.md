# Linting & Formatting

This project uses [TypeScript ESLint](https://typescript-eslint.io/) for code linting and [Prettier](https://prettier.io/) for code formatting. These tools work together to catch errors and enforce consistent code style across the project.

---

[[toc]]

## Languages

- **TypeScript** is linted by TypeScript ESLint and formatted by Prettier
- **JSON** is formatted by Prettier

## Scripts

There are several contexts in which linters and formatters run:

### Terminal

```bash
# Lint all TypeScript files and fix violations automatically
pnpm lint

# Format all TypeScript and test files with Prettier
pnpm format

# Check TypeScript types without emitting
pnpm type-check
```

See `package.json` in the `scripts` section for full command definitions.

### Pre-commit Hook

Staged files are automatically linted and tested before each commit via Husky and lint-staged. This ensures only clean code is committed.

See `lint-staged.config.mjs` to update pre-commit behavior.

### Editor

In supported editors (VS Code, WebStorm, etc.), ESLint and Prettier extensions will show linting errors and formatting suggestions in real-time.

## Prettier Configuration

Located in `.prettierrc` at the project root:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "plugins": ["prettier-plugin-organize-imports"]
}
```

### Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| `singleQuote` | `true` | Use single quotes instead of double |
| `trailingComma` | `all` | Add trailing commas in multi-line structures |
| `plugins` | `prettier-plugin-organize-imports` | Auto-organize imports alphabetically |

### Running Prettier

```bash
# Format all TypeScript and test files
pnpm format

# Format specific files
prettier --write "src/**/*.ts"
```

## ESLint Configuration

Located in `eslint.config.mjs` at the project root.

ESLint extends TypeScript ESLint recommended rules with project-specific overrides for code quality and consistency.

## Configuration Files

| File | Purpose |
|------|---------|
| `eslint.config.mjs` | ESLint rules and configuration |
| `.prettierrc` | Prettier formatting rules |
| `lint-staged.config.mjs` | Pre-commit linting configuration |
