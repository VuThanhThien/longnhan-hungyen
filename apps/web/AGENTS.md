<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## API query params

Before any `apiClient` / `useQuery` fetch with query params: sanitize via `sanitizeApiQueryParams` or Zod parsers. See `.cursor/rules/frontend-api-query-params.mdc` (axios interceptor is the HTTP safety net).
