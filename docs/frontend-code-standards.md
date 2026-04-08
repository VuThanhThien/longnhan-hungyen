# Frontend Code Standards (Next.js & React)

**Last Updated:** 2026-04-08
**Applies To:** apps/web, apps/admin

---

## Typography & Fonts

- **Body font**: must use a normal-weight sans stack (e.g. `--font-geist-sans`). Do **not** set a display font as the first `font-family` on `body`, especially if the font files only include bold weights.
- **Display font**: OK for headings/brand-only (e.g. `.landing-heading`), but keep it scoped so regular copy doesn’t inherit bold-only glyphs.

## Component Organization

### Server vs Client Components

**Default: Server Components** (no rendering cost)
```typescript
// pages/products/page.tsx — Server Component (default)
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

---

## API Route Handlers & Server Actions

### API Routes (Next.js Route Handlers)

Used for proxying requests to backend NestJS API:

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Call backend NestJS API
  const response = await fetch('http://api:3000/api/v1/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}
```

### Server Actions (for Form Mutations)

Used for form submissions with automatic cache revalidation:

```typescript
// lib/product-actions.ts
'use server';
import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  const data = Object.fromEntries(formData);

  const response = await fetch('http://api:3000/api/v1/products', {
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
  const response = await fetch(`http://api:3000/api/v1${path}`, {
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
  baseURL: 'http://localhost:3000/api/v1',
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
  }
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
        const newToken = await fetch('/api/auth/refresh').then(r => r.json());
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
  }
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
// app/products/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

// Manual revalidation after mutation
'use server';
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

### Error Boundaries (Client Components)

```typescript
'use client';
import { useState } from 'react';

export function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded">
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
        <button onClick={() => setError(null)}>Try again</button>
      </div>
    );
  }

  return (
    <div onError={(e) => setError(e)}>
      {children}
    </div>
  );
}
```

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

## File Organization

### Admin App Structure
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

export function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
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

## Related Documentation

- [Code Standards](./code-standards.md) — NestJS backend standards
- [System Architecture](./system-architecture.md) — Full stack architecture
- [Codebase Summary](./codebase-summary.md) — Project structure overview
