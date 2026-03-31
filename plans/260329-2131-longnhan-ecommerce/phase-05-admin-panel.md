---
phase: 5
title: "Admin Panel (Next.js Admin)"
status: in-progress
completion: 75%
effort: 10h
depends_on: [3]
---

# Phase 5: Admin Panel (Next.js Admin)

## Context Links

- [Plan Overview](plan.md)
- [Phase 3: Backend API](phase-03-backend-api.md)

## Overview

- **Priority:** P1
- **Status:** IN PROGRESS (~75% complete)
- **Completion Target:** 2026-04-10
- **Completed:** Login, dashboard, products/articles/orders/media CRUD pages, Radix UI + charts, React Query hooks, API proxies, Server Actions, TiptapHtmlEditor
- **Remaining:** Date-range/search filters, storefront reflection verification (PDP parity), E2E test suite
- Build admin panel with JWT authentication, dashboard, and CRUD management for orders, products, articles, and media. Uses Radix UI + React Query + Tiptap editor.

## Scope Alignment (2026-03-31)

- Primary goal of this phase is **content operations**: admin manages product/article information + media, then storefront product/article pages render configured fields/images dynamically.
- Out of scope for this request: generic landing CMS blocks. Keep to `products`, `articles`, and `media` modules.
- Existing backend DTO shape already supports this model (`featuredImageUrl`, `images`, `contentHtml`, SEO metadata fields).

## Key Insights

- shadcn/ui provides accessible, customizable components (not a library, copy-paste into project)
- TanStack Table for server-side paginated data tables
- Tiptap for rich text editing (articles)
- JWT stored in HTTP-only cookie, middleware checks auth on every request
- Admin is a separate Next.js app on different subdomain (admin.longnhan.vn)
- **CRITICAL: No direct DB access** — all data fetched/mutated via `apps/api` HTTP calls. Never import TypeORM entities or repositories from this app. All CRUD operations go through the NestJS REST API with JWT Bearer token in headers.

## Requirements

### Functional
- Login page: email + password → JWT cookie
- Dashboard: order count cards (today/week/month), revenue totals, recent orders list
- Orders: data table with filters (status, payment, date range, search), status update buttons
- Products: data table + create/edit forms with variant management, image upload, URL binding to `featuredImageUrl` and `images[]`
- Articles: data table + create/edit with Tiptap rich text editor, image insertion, SEO field management (`metaTitle`, `metaDescription`)
- Media: gallery view, upload to Cloudinary, copy URL for product/article configuration
- Logout

### Non-Functional
- shadcn/ui design system
- Responsive sidebar layout
- Loading states + error handling on all API calls
- Toast notifications for actions
- Dynamic storefront reflection: product pages update via ISR window (60s), article pages update via current ISR window (3600s). On-demand revalidation is explicitly out of scope for this phase.

## Architecture

### Page Structure

```
apps/admin/
├── app/
│   ├── layout.tsx               # Minimal root layout
│   ├── login/
│   │   └── page.tsx             # Login form
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Sidebar + header layout (auth required)
│   │   ├── page.tsx             # Dashboard stats
│   │   ├── orders/
│   │   │   ├── page.tsx         # Orders table
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Order detail
│   │   ├── products/
│   │   │   ├── page.tsx         # Products table
│   │   │   ├── new/
│   │   │   │   └── page.tsx     # Create product
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx # Edit product
│   │   ├── articles/
│   │   │   ├── page.tsx         # Articles table
│   │   │   ├── new/
│   │   │   │   └── page.tsx     # Create article
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx # Edit article
│   │   └── media/
│   │       └── page.tsx         # Media gallery
│   └── not-found.tsx
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── sidebar-nav.tsx
│   │   ├── header.tsx
│   │   └── user-menu.tsx
│   ├── dashboard/
│   │   ├── stat-cards.tsx
│   │   ├── revenue-chart.tsx
│   │   └── recent-orders.tsx
│   ├── orders/
│   │   ├── orders-table.tsx
│   │   ├── order-columns.tsx
│   │   ├── order-status-badge.tsx
│   │   └── order-status-select.tsx
│   ├── products/
│   │   ├── products-table.tsx
│   │   ├── product-form.tsx
│   │   ├── variant-form-fields.tsx
│   │   └── image-upload.tsx
│   ├── articles/
│   │   ├── articles-table.tsx
│   │   ├── article-form.tsx
│   │   └── tiptap-editor.tsx
│   ├── media/
│   │   ├── media-manager.tsx
│   │   ├── media-url-picker.tsx
│   │   └── media-card.tsx
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── table.tsx
│       ├── dialog.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       ├── card.tsx
│       ├── toast.tsx
│       ├── tabs.tsx
│       └── ...
├── lib/
│   ├── admin-api-client.ts      # Fetch with JWT cookie
│   ├── auth.ts                  # Login/logout helpers
│   └── utils.ts                 # cn() helper, formatters
├── hooks/
│   ├── use-auth.ts
│   └── use-toast.ts
└── middleware.ts                 # Auth redirect middleware
```

### Auth Flow

```
1. User visits /login → enters email + password
2. POST /auth/login → API returns JWT in Set-Cookie (httpOnly)
3. Middleware checks cookie on every (dashboard)/* request
4. If no valid cookie → redirect to /login
5. API calls include cookie automatically (credentials: 'include')
```

### Admin API Client

```typescript
// lib/admin-api-client.ts
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

export async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    cache: 'no-store', // Admin always fresh data
  });

  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data;
}
```

## Related Code Files

### Files to Create
- All files listed in Architecture section (~40 files)

### Files to Modify
- `apps/admin/package.json` — add deps
- `apps/admin/tailwind.config.ts` — shadcn/ui theme

## Implementation Steps

### 1. Dependencies

```bash
cd apps/admin
pnpm add @longnhan/types
npx shadcn@latest init  # if not done in phase 1
npx shadcn@latest add button input table card badge select dialog tabs toast textarea label separator dropdown-menu sheet avatar
pnpm add @tanstack/react-table
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
pnpm add recharts
# optional: pnpm add react-dropzone (if true drag-drop UX is implemented)
```

### 2. Auth Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next|api|favicon.ico).*)'] };
```

### 3. Login Page

- Email + password form
- Server Action: POST to /auth/login, set cookie on success, redirect to /
- Error display for invalid credentials

### 4. Dashboard Layout

- Sidebar: logo, nav links (Dashboard, Orders, Products, Articles, Media)
- Header: page title + user menu (logout)
- Collapsible sidebar on mobile (Sheet component)

### 5. Dashboard Page

- Stat cards: orders today, this week, this month, total revenue
- Revenue chart (Recharts BarChart, last 7 days)
- Recent orders table (last 10)
- Fetch from GET /dashboard/stats

### 6. Orders Management

- TanStack Table with columns: code, customer, phone, total, payment status, order status, date
- Filters: status dropdown, payment dropdown, date range, search input
- Row actions: view detail, update status
- Order detail page: full info + items list + status update buttons
- Status update: dropdown select → PATCH /orders/:id/status

### 7. Products Management

- Table: name, category, base price, variants count, active status, actions
- Create/Edit form:
  - Basic info: name, description (textarea), base price, category, featured image
  - Variants: dynamic field array (label, weight, price, stock, sku code) with add/remove
  - Image upload: click to upload to Cloudinary via /media/upload, display preview
- Delete: confirmation dialog → soft delete

### 8. Articles Management

- Table: title, published status, published date, actions
- Create/Edit form:
  - Title, slug (auto-generated, editable), excerpt, meta title, meta description
  - Featured image upload
  - Content: Tiptap rich text editor with toolbar (bold, italic, headings, lists, links, images)
  - Publish toggle
- Tiptap editor config: StarterKit + Image + Link extensions

### 9. Media Gallery

- Grid of uploaded images (cards with thumbnail + filename + URL)
- Upload action: click-to-upload (drag-drop optional follow-up), upload to Cloudinary
- Click to copy URL
- Delete with confirmation

## Todo List

- [x] Initialize shadcn/ui + install components
- [x] Create auth middleware
- [x] Build login page + Server Action
- [x] Build dashboard layout (sidebar + header)
- [x] Build dashboard page (stat cards + chart + recent orders)
- [x] Build orders table with status/payment filters
- [ ] Add date-range + search filters to orders table
- [x] Build order detail + status update
- [x] Build products table
- [x] Build product create/edit form with variant fields
- [x] Build image upload component + URL picker workflow for product form
- [x] Build articles table
- [x] Build article create/edit form with Tiptap editor + SEO fields
- [x] Build media gallery with upload + copy URL action
- [ ] Verify product detail page reflects `featuredImageUrl` / `images[]` after admin update
- [ ] Verify article detail page reflects `featuredImageUrl` + `contentHtml` after admin update
- [x] Decide article freshness strategy: keep ISR=3600 (selected)
- [x] Add toast notifications for all actions
- [x] Add loading states and error handling
- [ ] Test all CRUD operations end-to-end

## Success Criteria

- Admin can log in and access dashboard
- Dashboard shows correct order counts and revenue
- Admin can create/edit/delete products with variants
- Admin can create/edit/delete articles with rich text
- Admin can upload images and use returned URLs in products/articles
- Admin can view/filter orders and update statuses
- All actions show success/error toast notifications
- Unauthorized access redirects to login
- Storefront product/article pages show admin-configured content and images without code changes

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Tiptap bundle size | Low | Dynamic import the editor component |
| Complex variant form state | Medium | Use controlled form with useFieldArray pattern |
| Cookie not sent cross-origin | Medium | Ensure API CORS allows credentials from admin origin |
| Token expiry mid-session | Low | Intercept 401, redirect to login |

## Security Considerations

- JWT in HTTP-only cookie (no XSS access)
- Middleware enforces auth on all dashboard routes
- Admin API client always sends token
- No sensitive data in client-side state
- CSRF: same-site cookie + origin check

## Next Steps

- Phase 7: Deploy admin to Vercel (separate project)
