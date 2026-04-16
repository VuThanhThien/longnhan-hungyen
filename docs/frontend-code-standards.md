# Frontend Code Standards (Next.js & React)

**Last Updated:** 2026-04-15
**Applies To:** apps/web, apps/admin

---

## Typography & Fonts

- **Body font**: must use a normal-weight sans stack (e.g. `--font-geist-sans`). Do **not** set a display font as the first `font-family` on `body`, especially if the font files only include bold weights.
- **Display font**: OK for headings/brand-only (e.g. `.landing-heading`), but keep it scoped so regular copy doesn’t inherit bold-only glyphs.

## Cart State & Storage (Zustand)

The storefront uses **Zustand** with `persist` middleware for guest cart state on `apps/web`. Storage is **client-only** (localStorage).

**Storage Key:** `'longnhan-cart-v2'` (versioned to enable clean migrations; v1 data is ignored on key change).

**CartLine Schema** (display-snapshot approach):

```typescript
type CartLine = {
  variantId: string; // Unique identifier
  quantity: number; // User-selected qty (server rechecks stock)
  unitPriceVnd: number; // Snapshot price (server recomputes final total)
  productName: string; // Snapshot display
  productSlug: string; // For links to `/products/{slug}`
  variantLabel: string; // E.g., "Size L / Red"
  imageUrl: string | null;
};
```

**Store API:**

- `upsertLine(line)` — Additive merge: if variant exists, accumulate qty; else append.
- `setQuantity(variantId, qty)` — Replace qty in-place; qty ≤ 0 removes line.
- `removeLine(variantId)`, `clear()`, `getLines()`.
- `useCartTotals()` — Returns `{ itemCount, totalVnd }` for UI (via Zustand selector).

**Hydration:** Components using cart must be `'use client'` and handle initial `lines = []` before hydration (Zustand resolves from storage on mount).

---

## Observability & Error Tracking (Sentry)

All observability in the storefront is **gated to production** and filters **PII** to meet privacy compliance.

**Server Configuration** (`apps/web/sentry.server.config.ts`):

- `sendDefaultPii: false` — Sentry never auto-captures user/request details.
- `beforeSend: scrubEvent` — Custom filter removes:
  - Request: `cookies`, `headers`
  - User: `ip_address`
  - Extra: keys matching `phone|email|address|customer|name` (case-insensitive)

**Production-Only Gating** (in `order-actions.ts` and `error.tsx`):

```typescript
if (process.env.NODE_ENV === 'production') {
  Sentry.captureMessage(...);
}
```

**Order Success Tracking:**

- Captured: message level `'info'`, tag `order_code: string` (non-PII).
- Omitted: customer name, email, phone, address.

**Order Failure Tracking:**

- Captured: message `'order_submit_failed'`, tag `order_submit: 'error'`, optional HTTP status / error code.
- Omitted: form data, customer details.

**Redirect Safety:**
Server Actions using `redirect()` (Next.js internal) throw `NEXT_REDIRECT` error. Always guard:

```typescript
import { isRedirectError } from 'next/dist/client/components/redirect-error';
try {
  // ... code ...
} catch (err) {
  if (isRedirectError(err)) throw err;  // Rethrow, don't capture
  Sentry.captureException(err, {...});
}
```

---

## UI components, icons & assets (`apps/web`)

### Component libraries

- **Radix UI** primitives — accessible behavior (Dialog, Accordion, etc.); compose with Tailwind in `apps/web/src/components/ui/`.
- **shadcn/ui** patterns — install or mirror from the [shadcn/ui registry](https://ui.shadcn.com/) (`pnpm dlx shadcn@latest add …`), keep shared pieces under `components/ui/`, use `cn()` from `@/lib/utils` for class merging.
- **Magic UI** — optional for marketing/storefront polish (e.g. [Tweet Card](https://magicui.design/docs/components/tweet-card)); align spacing, borders, and typography with existing cards rather than mixing unrelated visual systems.

Prefer these stacks over bespoke modal/sheet/card markup when a registry component fits. Other apps in the monorepo may use different UI libraries; follow the target app’s conventions.

### Icons & static assets

- **UI icons:** Prefer **`lucide-react`** ([Lucide](https://lucide.dev/icons/)) for standard glyphs (navigation, cart, phone, etc.). Import named components (`import { ShoppingCart } from 'lucide-react'`) and size/color with `className` (`h-5 w-5`, `text-(--brand-*)`). Do **not** use emoji or Unicode “symbol” characters as substitutes for icons in product UI; use Lucide (or the rare exceptions below).
- **Radix icons:** `@radix-ui/react-icons` remains acceptable where already used (e.g. search bar); prefer **one** icon system per surface for consistency unless a Radix-only glyph is required.
- **Brand / decorative / raster art:** Prefer files under **`apps/web/public/`** (PNG, WebP, SVG) and reference them with `next/image` or CSS `url('/path')` (e.g. decorative search bar corners). Do not hand-generate SVG paths for assets that should be shipped as static files.
- **When to add new SVG in code:** Only if neither Lucide nor `public/` provides a suitable asset; keep it minimal and colocate with the component.

## Component Organization

### Server vs Client Components

**Default: Server Components** (no rendering cost)

```typescript
// apps/web/src/app/products/page.tsx — Server Component (default)
export default async function ProductsPage() {
  const products = await fetch('...'); // OK: server-side data fetching
  return <ProductList products={products} />;
}
```

**Client Components** (only for interactivity)

```typescript
// components/product-list.tsx — Client Component
'use client';
import { useState } from 'react';

export function ProductList({ products }) {
  const [filter, setFilter] = useState('');
  return (
    <>
      <input onChange={(e) => setFilter(e.target.value)} />
      {/* Filtered rendering */}
    </>
  );
}
```

**Rule:** Use Server Components by default. Add `'use client'` ONLY for:

- State management (`useState`, `useContext`)
- Event handlers (`onClick`, `onChange`)
- React hooks (`useEffect`, `useQuery`, etc.)

### Carousels (landing surfaces)

Carousels are easy to ship poorly. Keep them minimal and safe:

- **Split responsibilities**: keep layout + data mapping as **Server Components**; isolate the interactive carousel into a small `'use client'` component.
- **A11y**: provide pause/play; keyboard navigation (Left/Right); visible `focus-visible` rings; honor `prefers-reduced-motion` (disable autoplay).
- **Perf/CLS**: use `next/image` with stable layout (fixed height or explicit `width/height`) + correct `sizes`. Do **not** set `priority` on every slide; at most the first above-the-fold slide.
- **Copy/text-on-image**: add a gradient scrim behind overlays to maintain contrast; do not rely on subtle text colors over busy images.

### `useSearchParams` + `<Suspense>` (Admin list pages)

In Next.js App Router, `useSearchParams()` is a client hook and must be rendered within a `<Suspense>` boundary. For admin list pages that read query params (pagination/sorting/filtering), use this structure:

```tsx
// apps/admin/src/app/(dashboard)/<resource>/page.tsx (Server Component)
import { Suspense } from 'react';
import ResourcePageClient from './page.client';

export default function ResourcePage() {
  return (
    <Suspense fallback={null}>
      <ResourcePageClient />
    </Suspense>
  );
}
```

```tsx
// apps/admin/src/app/(dashboard)/<resource>/page.client.tsx (Client Component)
'use client';

import { useSearchParams } from 'next/navigation';

export default function ResourcePageClient() {
  const searchParams = useSearchParams();
  // Read pagination/sort/filter from searchParams
  return null;
}
```

### `nuqs` — URL query state (storefront `apps/web`)

Use [**nuqs**](https://nuqs.dev/docs) for type-safe search params: shared parsers between server and client, serializers for links/navigation, and hooks that behave like `useState` backed by the query string.

**Docs:** [Installation](https://nuqs.dev/docs/installation) · [Adapters (Next.js App Router)](https://nuqs.dev/docs/adapters) · [Server-side](https://nuqs.dev/docs/server-side) · [**SEO**](https://nuqs.dev/docs/seo)

**Setup in `apps/web`:**

1. Wrap the app with `NuqsAdapter` from `nuqs/adapters/next/app` (inside `AppProviders`, with a `<Suspense fallback={null}>` boundary around the adapter so `useSearchParams` is valid during static prerender).
2. Define parsers once (e.g. `src/lib/product-search-params.ts`) using `nuqs/server`: `createLoader`, `createSearchParamsCache`, `createSerializer`, and `parseAsString` (and options such as `throttleMs` on the query field).
3. **Client:** `useQueryStates(productSearchParamsParsers)` for components that read/write the current URL (e.g. header search on `/` and `/products`).
4. **Server:** `await loadProductSearchParams(searchParams)` in route handlers that need `q` / `category` for data fetching.
5. **Navigation:** `serializeProductSearchUrl('/products', { q, category })` instead of hand-built `URLSearchParams`.

**SEO and canonical URLs ([nuqs SEO](https://nuqs.dev/docs/seo))**

Query strings affect how crawlers treat duplicate URLs. Align canonical tags with whether params are _UI-only_ or _content-defining_.

| Situation                                                                                                             | Canonical strategy                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Params are **local-only** (filters, draft search text, UI state that does not change the primary “topic” of the page) | Point canonical at the **path without** those query strings so search engines index one preferred URL.                                                                                           |
| Params **define** what is shown (e.g. a resource id, or search results that are the main intent of the URL)           | Canonical should **include** the relevant query string(s). Reuse the same **parsers** and **`createSerializer`** in `generateMetadata` so the canonical matches what users and parsers agree on. |

In the Next.js App Router, set this with **metadata**:

```ts
import type { Metadata } from 'next';

// Example: local-only state on `/` — prefer indexing the bare landing URL
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};
```

For routes where the visible content depends on parsed params, compute canonical inside **`generateMetadata`** using your shared loader/serializer (same pattern as [nuqs SEO examples](https://nuqs.dev/docs/seo)):

```ts
import type { Metadata } from 'next';
import type { SearchParams } from 'nuqs/server';
import {
  loadProductSearchParams,
  serializeProductSearchUrl,
} from '@/lib/product-search-params';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { q, category } = await loadProductSearchParams(searchParams);
  const hasContentDefiningParams = Boolean(q ?? category);
  return {
    alternates: {
      canonical: hasContentDefiningParams
        ? serializeProductSearchUrl('/products', { q, category })
        : '/products',
    },
  };
}
```

Resolve `alternates.canonical` against root **`metadataBase`** in `layout.tsx` when you use relative paths. **Decide per route** whether `q` / `category` belong in the canonical (product listing/search often yes; the marketing home with incidental `?q=` from the header often should stay canonical **`/`** without params — see [nuqs SEO](https://nuqs.dev/docs/seo)).

---

## Zustand — client state & guest cart (`apps/web`)

Use **[Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)** for **client-only** global state that must not live in the URL. For **bookmarkable / shareable** filters and search, use **nuqs** instead.

**Shopping cart (guest, no server cart API)**

- Implementation: `src/services/cart/cart-store.ts` — `useCartStore`, `useCartTotals`, `getCartTotals`.
- **Persist** via `persist` middleware to **`localStorage`**; key **`longnhan-cart-v2`** (`CART_STORAGE_KEY`). If the JSON shape changes, bump the key or add a **`version` + `migrate`** in `persist` options.
- Store **lines** only: `variantId`, `quantity`, `unitPriceVnd`. Derive **item count** and **total ₫** from lines (do not duplicate totals in state).
- **Providers:** none required — use hooks in **`'use client'`** components. **`NuqsAdapter`** and the cart store are independent; order in `AppProviders` does not require nesting one inside the other.
- **SSR / hydration:** server render uses the store’s initial empty state; **`persist` rehydrates** after load. Do not rely on cart contents during server components.

**Selectors:** use **`useShallow`** from `zustand/react/shallow` when selecting computed objects (e.g. `{ itemCount, totalVnd }`) to avoid unnecessary re-renders.

---

## API Route Handlers & Server Actions

### API Routes (Next.js Route Handlers)

Used for proxying requests to backend NestJS API:

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Call backend NestJS API (local dev: localhost:3001; Docker: service host from compose)
  const response = await fetch('http://localhost:3001/api/v1/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: response.status },
    );
  }

  return NextResponse.json(await response.json());
}
```

### Server Actions (for Form Mutations)

Used for form submissions with automatic cache revalidation:

```typescript
// Example Server Action (e.g. apps/web/src/actions/... or apps/admin pattern)
'use server';
import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  const data = Object.fromEntries(formData);

  const response = await fetch('http://localhost:3001/api/v1/products', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to create product');

  revalidatePath('/products'); // Revalidate /products page
  return response.json();
}

// Usage in form
<form action={createProduct}>
  <input name="name" />
  <button type="submit">Create</button>
</form>
```

**Rule:** Use Server Actions for form mutations + `revalidatePath()` to sync Server Component cache.

---

## Data Fetching Patterns

### Server-side (Server Components)

Fetch from backend in Server Components:

```typescript
// lib/admin-api-client.ts
export async function adminFetch(path: string, options = {}) {
  const response = await fetch(`http://localhost:3001/api/v1${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${getCookieToken()}`,
      ...options.headers,
    },
  });

  if (!response.ok) throw new Error('API Error');
  return response.json();
}

// Usage in Server Component
const products = await adminFetch('/products');
return <ProductList products={products} />;
```

### Client-side (Client Components)

Use Axios + React Query for client-side data fetching:

```typescript
// lib/http-client.ts
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  timeout: 15000,
});

// Auto-refresh interceptor (refresh 60s before expiry)
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await refreshToken(); // Refresh via /api/auth/refresh
    }
    return Promise.reject(error);
  },
);

// Usage with React Query
import { useQuery } from '@tanstack/react-query';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => httpClient.get('/products'),
  });
}
```

---

## React Query Integration

### Query Keys & Hooks

**Pattern:** `[resource, ...filters]`

```typescript
// features/media/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useMediaList(folder?: string) {
  return useQuery({
    queryKey: ['media', folder], // Include filters in key
    queryFn: () => httpClient.get('/media', { params: { folder } }),
    staleTime: 30000, // 30s stale time for admin
  });
}

export function useUploadMedia() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return httpClient.post('/media/upload', formData);
    },
    onSuccess: () => {
      // Invalidate cache after mutation
      client.invalidateQueries({ queryKey: ['media'] });
    },
  });
}
```

**Rules:**

- Always invalidate related queries on mutation success
- Use `staleTime: 30000` for admin (30s), `staleTime: 60000` for public (60s)
- Query keys should match API resource structure

---

## Form Handling

### With react-hook-form + yup

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().min(6, 'Min 6 chars').required('Password required'),
});

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await loginAction(data);
    } catch (error) {
      // Show error toast
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email')}
        type="email"
        placeholder="Email"
      />
      {errors.email && <span className="text-red-600">{errors.email.message}</span>}

      <input
        {...register('password')}
        type="password"
        placeholder="Password"
      />
      {errors.password && <span className="text-red-600">{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Authentication Pattern

### Cookie-based Token Storage

```typescript
// lib/auth-token.ts
import { cookies } from 'next/headers';

export function getAuthToken(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('longnhan-hy-admin-auth-token-data')?.value || null;
}

export function setAuthToken(token: string) {
  const cookieStore = cookies();
  cookieStore.set('longnhan-hy-admin-auth-token-data', token, {
    maxAge: 86400, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
}

export function clearAuthToken() {
  const cookieStore = cookies();
  cookieStore.delete('longnhan-hy-admin-auth-token-data');
}
```

### Auto-refresh Interceptor

```typescript
// lib/http-client.ts
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Refresh token
        const newToken = await fetch('/api/auth/refresh').then((r) => r.json());
        setAuthToken(newToken.accessToken);

        // Retry original request
        return httpClient(error.config);
      } catch {
        // Logout on refresh failure
        clearAuthToken();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
```

---

## Tailwind CSS v4 & Styling

### Best Practices

**Prefer inline classes** over `@apply`:

```tsx
// Good
export function Card({ children }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
      {children}
    </div>
  );
}

// Avoid excessive @apply
```

**Component-level variants:**

```tsx
export function Button({ variant = 'primary', size = 'md', children }) {
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button className={`rounded ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </button>
  );
}
```

### CSS Modules (Alternative)

For scoped, non-utility styles:

```css
/* button.module.css */
.primary {
  @apply px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700;
}

.disabled {
  @apply opacity-50 cursor-not-allowed;
}
```

```tsx
// button.tsx
import styles from './button.module.css';

export function Button({ disabled }) {
  return (
    <button className={`${styles.primary} ${disabled && styles.disabled}`}>
      Click me
    </button>
  );
}
```

---

## Performance Optimization

### Image Optimization (Cloudinary Loader)

```typescript
import Image from 'next/image';

// Cloudinary URL transformation
export function ProductImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      loader={({ src, width }) => `${src}?w=${width}&q=80`}
      width={400}
      height={300}
      priority={false}
    />
  );
}
```

### Dynamic Imports & Code Splitting

```typescript
import dynamic from 'next/dynamic';

// Lazy-load heavy components
const TiptapEditor = dynamic(() => import('./tiptap-editor'), {
  ssr: false, // Don't render on server (editor needs DOM)
  loading: () => <div>Loading editor...</div>,
});

export function ArticleForm() {
  return (
    <form>
      <input name="title" />
      <TiptapEditor /> {/* Only loads when needed */}
    </form>
  );
}
```

### ISR & On-demand Revalidation

```typescript
// apps/web/src/app/products/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

// Manual revalidation after mutation
('use server');
export async function createProduct(data) {
  await fetch('...', { method: 'POST', body: JSON.stringify(data) });
  revalidatePath('/products'); // Revalidate product list page
  revalidatePath('/products/[slug]'); // Revalidate dynamic product pages
}
```

---

## Error Handling

### Try-Catch in Server Actions

```typescript
'use server';

export async function createProduct(data) {
  try {
    const response = await fetch('...', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Create product failed:', error);
    throw new Error('Failed to create product. Please try again.');
  }
}
```

### Route errors (App Router)

Use a segment **`error.tsx`** (client file) so Next.js can catch render errors in that subtree — do not use `onError` on a `<div>` (that is not a React error boundary).

```tsx
// apps/web/src/app/example-segment/error.tsx
'use client';

import { useEffect } from 'react';

export default function ExampleSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
      <h2 className="font-semibold">Something went wrong</h2>
      <p className="mt-1 text-sm">{error.message}</p>
      <button
        type="button"
        className="mt-3 rounded bg-red-800 px-3 py-1 text-sm text-white"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
```

For granular client trees, a **class-based** `componentDidCatch` boundary is still valid; prefer `error.tsx` for route-level failures.

---

## SEO Best Practices

### Metadata

```typescript
// app/products/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await fetch(`/api/products/${params.slug}`).then(r => r.json());

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

export default function ProductPage({ params }) {
  return <Product slug={params.slug} />;
}
```

### JSON-LD Schema

```typescript
export function ProductSchema({ product }) {
  return (
    <script type="application/ld+json">
      {JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image,
        price: product.price,
      })}
    </script>
  );
}
```

---

## File organization

### Storefront (`apps/web/src`) — quick map

```
apps/web/src/
├── app/                    # Routes: page.tsx, layout, cart/, products/, articles/, …
├── actions/                # Server Actions (e.g. orders)
├── components/
│   ├── layout/             # header.tsx, header-search-bar, header-cart-button, mobile-nav, footer, …
│   ├── home/, landing/, products/, articles/, orders/, ui/, …
├── data/                   # Static marketing content
├── hooks/
├── lib/                    # api-client, api-server, product-search-params, format-*, SEO, …
├── services/
│   ├── auth/               # Auth context / hooks
│   └── cart/               # Zustand cart-store (guest cart)
```

Static files: **`apps/web/public/`** (not under `src/`).

### Admin app structure

```
apps/admin/src/
├── app/
│   ├── login/                 # Login page
│   ├── (dashboard)/           # Protected routes
│   │   ├── page.tsx           # Dashboard
│   │   ├── products/          # Product pages
│   │   ├── articles/          # Article pages
│   │   ├── orders/            # Order pages
│   │   ├── media/             # Media page
│   │   └── layout.tsx         # Dashboard layout
│   ├── api/                   # API route handlers
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Root page (redirect)
├── components/
│   ├── layout/                # Header, sidebar, etc.
│   ├── dashboard/             # Dashboard widgets
│   ├── products/              # Product components
│   ├── articles/              # Article components
│   ├── orders/                # Order components
│   ├── media/                 # Media components
│   ├── providers/             # React Query, Auth providers
│   └── ui/                    # Radix UI wrappers
├── features/
│   ├── media/                 # Media hooks, API calls
│   │   ├── hooks.ts
│   │   └── api.ts
│   └── orders/                # Order hooks
├── lib/                       # Utilities
│   ├── admin-api-client.ts    # Server fetch
│   ├── http-client.ts         # Axios instance
│   ├── auth-token.ts          # Token management
│   ├── admin-actions.ts       # Server Actions
│   └── utils.ts               # Helpers
└── globals.css                # Tailwind config
```

---

## Type Safety

### Component Props

```typescript
import { ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  // ...
}
```

### API Response Types

Use shared types from `@longnhan/types`:

```typescript
import { Product, Order } from '@longnhan/types';

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => httpClient.get(`/products/${id}`),
  });
}
```

---

## Testing Patterns

### Component Testing (Jest + React Testing Library)

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick handler', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);

    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalled();
  });
});
```

---

## Related documentation

- [Code Standards](./code-standards.md) — **`apps/api`** (NestJS) conventions
- [System Architecture](./system-architecture.md) — Full stack architecture
- [Codebase Summary](./codebase-summary.md) — Project structure overview
- [Project Roadmap](./project-roadmap.md) — Phase status
