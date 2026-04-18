<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Admin UI

**Visual spec:** Use repository root **[DESIGN.md](../../DESIGN.md)** as the canonical reference for admin look and feel (warm palette, typography roles, spacing, buttons, cards, borders, motion). When implementing screens, map those rules through Tailwind and CSS variables in `src/app/globals.css` (and shared tokens under `docs/design-system/` when they exist).

**Components:** Prefer **[shadcn/ui](https://ui.shadcn.com/)** patterns (Radix + Tailwind). Primitives live under `src/components/ui/`. Add missing pieces from the registry with the CLI from `apps/admin` (for example `pnpm dlx shadcn@latest add dialog`), then tune classes to match **DESIGN.md**. Avoid bespoke duplicate controls when a shadcn component already covers the pattern.

**Standards:** See [Frontend code standards](../../docs/frontend-code-standards.md) for shared Next.js rules, including the admin-specific UI subsection.
