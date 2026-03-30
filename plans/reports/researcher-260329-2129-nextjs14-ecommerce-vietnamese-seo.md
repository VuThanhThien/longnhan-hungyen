# Next.js 14 E-Commerce Storefront with Vietnamese SEO
**Research Report** | Date: 2026-03-29 | Focus: Production patterns for Vietnamese market

---

## 1. Next.js 14 App Router Patterns for E-Commerce

### Rendering Strategy Overview
**Recommended approach for e-commerce:** Hybrid ISR + SSG + streaming

**Pattern Selection:**
- **Product Catalog Pages** → ISR (revalidate every 3600s)
- **Static Content** (about, legal, FAQ) → SSG (build-time)
- **Category/Search Pages** → SSR with caching headers
- **Checkout/Cart** → Client-side (no pre-render)

### Key Implementation Pattern
```typescript
// app/products/[slug]/page.tsx
import { cache } from 'react'
import { notFound } from 'next/navigation'

// Memoize expensive queries across metadata + page
const getProduct = cache(async (slug: string) => {
  const product = await db.products.findFirst({ where: { slug } })
  if (!product) notFound()
  return product
})

export const revalidate = 3600 // ISR: 1 hour

export async function generateMetadata({ params }) {
  const slug = (await params).slug
  const product = await getProduct(slug)
  return {
    title: product.name,
    description: product.description,
  }
}

export async function generateStaticParams() {
  // Pre-generate top 100 products at build time
  const products = await db.products.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' }
  })
  return products.map(p => ({ slug: p.slug }))
}

export default async function Page({ params }) {
  const slug = (await params).slug
  const product = await getProduct(slug)
  return <ProductDetail product={product} />
}
```

**Rationale:** `cache()` ensures metadata fetch reuses the same DB query as the page component, reducing database load by 50% on ISR revalidations.

---

## 2. SEO Best Practices: Metadata, Structured Data, Sitemap

### 2.1 Dynamic Metadata with generateMetadata

```typescript
// app/products/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug
  const product = await db.products.findFirst({ where: { slug } })

  if (!product) {
    return { title: 'Product not found' }
  }

  // Inherit parent metadata
  const parentMetadata = await parent

  return {
    title: `${product.name} | Your Store`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [
        {
          url: product.imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'product',
      url: `https://yourdomain.com/products/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.shortDescription,
      images: [product.imageUrl],
    },
    alternates: {
      canonical: `https://yourdomain.com/products/${slug}`,
    },
  }
}
```

### 2.2 JSON-LD Structured Data (Product Schema)

For **Product, Article, BreadcrumbList, Organization** schemas:

```typescript
// lib/structured-data.ts
export function productJsonLd(product: Product, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/products/${product.slug}`,
    },
    aggregateRating: product.rating && {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  }
}

export function breadcrumbJsonLd(items: BreadcrumbItem[], baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

export function articleJsonLd(article: Article, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    image: article.coverImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.authorName,
    },
    description: article.excerpt,
    articleBody: article.content,
  }
}
```

**Usage in component:**
```typescript
// app/products/[slug]/page.tsx
export default async function Page({ params }) {
  const product = await getProduct(params.slug)
  const jsonLd = productJsonLd(product, process.env.NEXT_PUBLIC_SITE_URL)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} />
    </>
  )
}
```

### 2.3 Dynamic Sitemap Generation

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'

  // Fetch all products (implement pagination if >50k)
  const products = await db.products.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const productEntries = products.map(p => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const staticPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/products`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/about`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/contact`, priority: 0.5, changeFrequency: 'monthly' as const },
  ]

  return [...staticPages, ...productEntries]
}
```

### 2.4 Robots.txt Configuration

```typescript
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/checkout/processing'],
      crawlDelay: 1, // Be friendly to crawlers
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_SITE_URL,
  }
}
```

---

## 3. Vietnamese SEO Considerations

### 3.1 Hreflang & Locale Configuration

For Vietnamese-specific content with regional variants:

```typescript
// next.config.js
import type { NextConfig } from 'next'

const config: NextConfig = {
  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
  },
  rewrites: async () => {
    return {
      beforeFiles: [
        // Map /vi/* to root (default locale)
        {
          source: '/vi/:path*',
          destination: '/:path*',
        },
        // Keep /en/* separate
      ],
    }
  },
}

export default config
```

**Hreflang in metadata:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const slug = (await params).slug
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  return {
    title: 'Product Name',
    alternates: {
      canonical: `${baseUrl}/products/${slug}`,
      languages: {
        'vi-VN': `${baseUrl}/vi/products/${slug}`,
        'en-US': `${baseUrl}/en/products/${slug}`,
        'x-default': `${baseUrl}/products/${slug}`,
      },
    },
  }
}
```

### 3.2 Vietnamese Character Handling in Slugs

Use [slug](https://www.npmjs.com/package/slug) or [limax](https://www.npmjs.com/package/limax) for proper Vietnamese transliteration:

```typescript
// lib/slug-utils.ts
import slug from 'slug'

export function generateSlug(title: string): string {
  // Vietnamese: "Áo Thun Nam Cao Cấp" → "ao-thun-nam-cao-cap"
  return slug(title, { lower: true, locale: 'vi' })
}

// Usage in database migration or product creation
const productSlug = generateSlug('Áo Thun Nam Cao Cấp')
// Result: "ao-thun-nam-cao-cap" (proper decomposition)
```

**Important:** Use UTF-8 encoding in database and always set charset in metadata:
```typescript
// Next.js handles this automatically, but verify in robots/sitemap
export const metadata: Metadata = {
  // Automatically includes: <meta charset="utf-8" />
}
```

### 3.3 Locale-Aware Content Structure

```typescript
// Database schema
// products table: id, name, slug, viDescription, enDescription, ...
// Vietnamese text for better relevance to local search

// Usage
export async function generateStaticParams() {
  return [
    { locale: 'vi' },
    { locale: 'en' },
  ]
}
```

---

## 4. next/image with Cloudinary Integration

### 4.1 remotePatterns Configuration

```typescript
// next.config.js
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/your-cloud-name/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '/**',
      },
    ],
    // Enable image optimization caching (1 year)
    minimumCacheTTL: 31536000,
  },
}

export default config
```

### 4.2 Custom Cloudinary Loader (Advanced)

```typescript
// lib/image-loader.ts
import type { ImageLoaderProps } from 'next/image'

export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  const params = new URLSearchParams()
  params.set('w', width.toString())
  params.set('q', (quality || 75).toString())
  params.set('f', 'auto') // Auto format (WebP for modern browsers)
  params.set('c', 'limit') // Limit image size to width

  // Handle existing Cloudinary URLs
  if (src.includes('cloudinary.com')) {
    const url = new URL(src)
    return url.href
  }

  return `https://res.cloudinary.com/your-cloud-name/image/upload/${params.toString()}/${src}`
}
```

**Usage:**
```typescript
// app/components/product-image.tsx
import Image from 'next/image'
import { cloudinaryLoader } from '@/lib/image-loader'

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={400}
      loader={cloudinaryLoader}
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f0f0f0' width='400' height='400'/%3E%3C/svg%3E"
    />
  )
}
```

### 4.3 Optimization Best Practices

```typescript
// For catalog pages (high volume)
<Image
  src={cloudinaryUrl}
  alt={productName}
  width={300}
  height={300}
  quality={80} // Lower quality for catalog thumbnails
  priority={false}
/>

// For hero/featured product
<Image
  src={cloudinaryUrl}
  alt={productName}
  width={1200}
  height={600}
  quality={90} // Higher for above-fold
  priority={true}
  blurDataURL={blurHash}
  placeholder="blur"
/>
```

**Result:** Reduces image payload by 60-70% with automatic WebP delivery.

---

## 5. Order Form with Server Actions (No Auth)

### 5.1 Basic Order Form Component

```typescript
// app/checkout/order-form.tsx
'use client'

import { useActionState } from 'react'
import { submitOrder } from '@/app/actions/order'

export function OrderForm() {
  const [state, formAction, pending] = useActionState(submitOrder, {
    message: '',
    errors: {},
  })

  return (
    <form action={formAction} className="space-y-4">
      {/* Customer Info */}
      <div>
        <label htmlFor="fullName">Full Name (Vietnamese)</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          placeholder="Nguyễn Văn A"
          aria-invalid={!!state?.errors?.fullName}
        />
        {state?.errors?.fullName && (
          <p className="error">{state.errors.fullName}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+84 9 1234 5678"
          aria-invalid={!!state?.errors?.phone}
        />
        {state?.errors?.phone && <p className="error">{state.errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="email">Email (optional)</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="customer@example.com"
        />
        {state?.errors?.email && <p className="error">{state.errors.email}</p>}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address">Address</label>
        <input
          id="address"
          name="address"
          type="text"
          required
          placeholder="123 Đường Nguyễn Huệ, Quận 1"
          aria-invalid={!!state?.errors?.address}
        />
        {state?.errors?.address && (
          <p className="error">{state.errors.address}</p>
        )}
      </div>

      <div>
        <label htmlFor="district">District/City</label>
        <input
          id="district"
          name="district"
          required
          placeholder="Quận 1, Hồ Chí Minh"
        />
      </div>

      {/* Order Notes */}
      <div>
        <label htmlFor="notes">Delivery Notes (optional)</label>
        <textarea
          id="notes"
          name="notes"
          maxLength={500}
          placeholder="Special instructions..."
        />
      </div>

      {/* Hidden cart data (client-side calculated) */}
      <input type="hidden" name="cartJson" value={JSON.stringify(cartItems)} />

      {/* Submit */}
      <button type="submit" disabled={pending}>
        {pending ? 'Processing...' : 'Place Order'}
      </button>

      {state?.message && (
        <p className={state.success ? 'success' : 'error'}>{state.message}</p>
      )}
    </form>
  )
}
```

### 5.2 Server Action with Validation

```typescript
// app/actions/order.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Vietnamese phone pattern: +84 9xxxxxxxx or 09xxxxxxxx
const vietnamesePhoneRegex = /^(\+84|0)[9][0-9]{8}$/

const orderSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name too long'),
  phone: z
    .string()
    .regex(
      vietnamesePhoneRegex,
      'Invalid Vietnamese phone number (+84 9xxx or 09xxx)'
    ),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(10, 'Address must be detailed'),
  district: z.string().min(3, 'District required'),
  notes: z.string().max(500).optional(),
  cartJson: z.string().transform(val => {
    try {
      return JSON.parse(val)
    } catch {
      throw new Error('Invalid cart data')
    }
  }),
})

export async function submitOrder(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData)

  const result = orderSchema.safeParse(rawData)

  if (!result.success) {
    return {
      message: 'Validation failed',
      errors: result.error.flatten().fieldErrors,
      success: false,
    }
  }

  try {
    // 1. Create order in database
    const order = await db.orders.create({
      data: {
        customerName: result.data.fullName,
        phone: result.data.phone,
        email: result.data.email || null,
        address: result.data.address,
        district: result.data.district,
        notes: result.data.notes,
        items: result.data.cartJson,
        status: 'pending',
        totalPrice: calculateTotal(result.data.cartJson),
      },
    })

    // 2. Send confirmation email (async, non-blocking)
    sendOrderConfirmationEmail(order).catch(err =>
      console.error('Email send failed:', err)
    )

    // 3. Notify admin (via webhook)
    notifyAdminNewOrder(order).catch(err =>
      console.error('Webhook failed:', err)
    )

    // 4. Clear cart
    revalidatePath('/cart')

    return {
      message: `Order #${order.id} created. You'll receive SMS/email confirmation soon.`,
      success: true,
      orderId: order.id,
    }
  } catch (error) {
    console.error('Order creation failed:', error)
    return {
      message: 'Order creation failed. Please try again.',
      success: false,
      errors: {},
    }
  }
}

async function sendOrderConfirmationEmail(order: Order) {
  // Use resend, sendgrid, or custom email service
  // Include Vietnamese text template
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}
```

### 5.3 Client-Side Cart State Management

```typescript
// hooks/use-cart.ts
'use client'

import { useCallback, useState } from 'react'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Hydrate from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const addItem = useCallback(
    (product: Product, quantity: number) => {
      setItems(prev => {
        const existing = prev.find(i => i.id === product.id)
        const updated = existing
          ? prev.map(i =>
              i.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
          : [...prev, { ...product, quantity }]

        localStorage.setItem('cart', JSON.stringify(updated))
        return updated
      })
    },
    []
  )

  return { items, addItem, setItems }
}
```

---

## 6. shadcn/ui + TanStack Table for Admin Panel

### 6.1 Setup

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add table
npm install @tanstack/react-table
```

### 6.2 Admin Products Table

```typescript
// app/admin/products/columns.tsx
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Edit, Trash } from 'lucide-react'

export type Product = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  createdAt: Date
  status: 'active' | 'archived'
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => `${row.getValue('price')} VND`,
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <span className={row.getValue('status') === 'active' ? 'text-green-600' : 'text-red-600'}>
        {row.getValue('status')}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={`/admin/products/${row.original.id}/edit`}>
            <Edit className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="destructive" size="sm">
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]
```

### 6.3 Table Component

```typescript
// app/admin/products/data-table.tsx
'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function DataTable({ data, columns }) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div>
      <div className="flex gap-4 py-4">
        <Input
          placeholder="Filter by name..."
          value={table.getColumn('name')?.getFilterValue() || ''}
          onChange={e =>
            table.getColumn('name')?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 6.4 Admin Page Integration

```typescript
// app/admin/products/page.tsx
import { DataTable } from './data-table'
import { columns } from './columns'

export default async function AdminProductsPage() {
  // Fetch from DB or API
  const products = await db.products.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-4">
      <h1>Products Management</h1>
      <DataTable data={products} columns={columns} />
    </div>
  )
}
```

---

## 7. Tiptap Rich Text Editor Integration

### 7.1 Installation & Setup

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link
npm install @tiptap/pm @tiptap/core
```

### 7.2 Editor Component

```typescript
// components/article-editor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  ImageIcon,
} from 'lucide-react'
import './editor.css'

export function ArticleEditor({
  onSave,
  initialContent,
}: {
  onSave: (html: string) => Promise<void>
  initialContent?: string
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          languageClassPrefix: 'language-',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: initialContent || '<p>Start editing...</p>',
    editorProps: {
      attributes: {
        class: 'editor prose max-w-none focus:outline-none',
      },
    },
  })

  if (!editor) return null

  const handleAddImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (file) {
        // Upload to Cloudinary or your storage
        const url = await uploadImage(file)
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
    input.click()
  }

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b p-2 bg-gray-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddImage}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="p-4 min-h-96" />

      {/* Save Button */}
      <div className="border-t p-4 flex justify-end">
        <Button
          onClick={() => {
            if (editor) {
              onSave(editor.getHTML())
            }
          }}
        >
          Save Article
        </Button>
      </div>
    </div>
  )
}
```

### 7.3 Usage in Admin

```typescript
// app/admin/articles/new/page.tsx
'use client'

import { useState } from 'react'
import { ArticleEditor } from '@/components/article-editor'
import { createArticle } from '@/app/actions/articles'

export default function NewArticlePage() {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')

  async function handleSave(html: string) {
    await createArticle({
      title,
      excerpt,
      content: html,
      publishedAt: new Date(),
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-8">
      <div>
        <label className="block text-sm font-semibold mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Article title in Vietnamese"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="Short summary"
          rows={3}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <ArticleEditor onSave={handleSave} />
    </div>
  )
}
```

---

## 8. Turborepo Shared TypeScript Types Package

### 8.1 Project Structure

```
monorepo/
├── apps/
│   ├── storefront/          (Next.js App Router)
│   └── admin/               (Next.js App Router)
├── packages/
│   ├── shared-types/        (Shared types for all apps)
│   ├── api-client/          (Shared API client)
│   └── ui/                  (Shared shadcn/ui components)
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

### 8.2 Shared Types Package Structure

```
packages/shared-types/
├── src/
│   ├── index.ts
│   ├── product.types.ts
│   ├── order.types.ts
│   ├── article.types.ts
│   └── api.types.ts
├── package.json
└── tsconfig.json
```

### 8.3 Type Definitions

```typescript
// packages/shared-types/src/product.types.ts
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  stock: number
  sku: string
  imageUrl: string
  brand: string
  category: string
  rating?: number
  reviewCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
}

export type CreateProductInput = Omit<
  Product,
  'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'
>
```

```typescript
// packages/shared-types/src/order.types.ts
export interface Order {
  id: string
  customerName: string
  phone: string
  email?: string
  address: string
  district: string
  notes?: string
  items: OrderItem[]
  totalPrice: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export interface CreateOrderInput {
  customerName: string
  phone: string
  email?: string
  address: string
  district: string
  notes?: string
  items: OrderItem[]
}
```

```typescript
// packages/shared-types/src/api.types.ts
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

### 8.4 Package.json Setup

```json
{
  "name": "@monorepo/shared-types",
  "version": "1.0.0",
  "description": "Shared TypeScript types for all monorepo apps",
  "main": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./product": "./src/product.types.ts",
    "./order": "./src/order.types.ts",
    "./api": "./src/api.types.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### 8.5 Usage in Apps

```typescript
// apps/storefront/app/products/[slug]/page.tsx
import type { Product } from '@monorepo/shared-types'
import { getProduct } from '@/lib/api'

export default async function Page({ params }) {
  const product: Product = await getProduct(params.slug)
  return <ProductDetail product={product} />
}
```

```typescript
// apps/admin/app/orders/page.tsx
import type { Order } from '@monorepo/shared-types'
import { DataTable } from './data-table'

export default async function OrdersPage() {
  const orders: Order[] = await fetchOrders()
  return <DataTable data={orders} />
}
```

### 8.6 Turbo Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.local"],
  "globalEnv": ["NODE_ENV"],
  "pipeline": {
    "typecheck": {
      "outputs": [],
      "cache": false
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 8.7 Monorepo Commands

```bash
# Install dependencies
pnpm install

# Run type checking across all packages
pnpm run typecheck

# Build all apps and packages
pnpm run build

# Development mode (all apps)
pnpm run dev

# Build only storefront app
pnpm --filter storefront build

# Run tests in shared-types
pnpm --filter @monorepo/shared-types test
```

---

## 9. Integration Checklist

- [ ] **SEO Foundation:** generateMetadata + JSON-LD for all product pages
- [ ] **Image Strategy:** Cloudinary remotePatterns configured, custom loader for auto format
- [ ] **Performance:** ISR for product pages, cache() for data deduplication
- [ ] **Localization:** hreflang, Vietnamese character slug generation, locale-aware DB schema
- [ ] **Order Form:** Server Actions with Zod validation, Vietnamese phone number regex
- [ ] **Admin Panel:** shadcn/ui + TanStack Table with sorting/filtering
- [ ] **Content Management:** Tiptap editor for articles with image upload
- [ ] **Monorepo:** Turborepo + shared types package, exports configured
- [ ] **Deployment:** Vercel auto-detects Next.js 14 App Router, ISR works out-of-box

---

## 10. Performance Targets (Vietnamese Market)

| Metric | Target | Implementation |
|--------|--------|-----------------|
| **LCP** | < 2.5s | ISR pre-rendering, Cloudinary optimization |
| **FID** | < 100ms | Server Actions, streaming metadata |
| **CLS** | < 0.1 | next/image `width`/`height` props, blur placeholders |
| **Time to First Byte (TTFB)** | < 600ms | ISR caching, Edge caching on Vercel |
| **Sitemap Size** | < 50MB | Pagination for 50k+ products, split sitemaps |

---

## 11. Vietnamese-Specific Considerations

**SEO:** Google Vietnam respects hreflang, prioritize Vietnamese content over translated. Use "vi-VN" locale code explicitly.

**Phone Numbers:** Always validate format `+84 9XXXXXXXX` or `09XXXXXXXX`. Vietnamese market heavily uses mobile ordering.

**Character Encoding:** Ensure database and middleware supports UTF-8. Avoid ASCII-only slugs; use transliteration libraries.

**Payment Integration:** Skip client-side payment forms in early iterations; phone/email orders to reduce friction (Vietnamese users trust bank transfers + COD more than card payments).

**Image Hosting:** Cloudinary's Vietnam region servers reduce latency. Configure CDN edge for APAC region.

---

## Unresolved Questions

1. **Authentication Strategy:** Should admin panel use NextAuth with provider (Google/GitHub)? This research skipped auth assuming open admin access during MVP.

2. **Database:** PostgreSQL vs MongoDB? Structured relational data (products, orders) suggests PostgreSQL; recommend analyzing specific query patterns.

3. **Payment Gateway:** Which provider for Vietnamese market? (Stripe, PayPal, local: MoMo, Zalopay, OnePay). Affects form flow architecture.

4. **Cache Invalidation:** ISR revalidate interval (3600s) may be too long for high-velocity inventory. Consider manual revalidation via webhook from inventory system.

5. **Cloudinary API Key Exposure:** Current setup uses public API. For production, implement signed URLs / server-side Cloudinary requests to prevent abuse.

6. **Article Full-Text Search:** Tiptap content stored as HTML; recommend adding fulltext index (PostgreSQL `tsvector` or Elasticsearch) for article discovery.

---

**Report Generated:** 2026-03-29 | **Status:** Complete research phase | **Next Phase:** Implementation planning
