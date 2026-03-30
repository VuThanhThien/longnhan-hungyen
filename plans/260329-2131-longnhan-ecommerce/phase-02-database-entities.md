---
phase: 2
title: "Database & Entities"
status: completed
effort: 5h
depends_on: [1]
completed_at: 2026-03-30
---

# Phase 2: Database & Entities

## Context Links

- [Plan Overview](plan.md)
- [NestJS + TypeORM Research](../reports/researcher-260329-2130-nestjs-typeorm-ecommerce-guide.md)
- [Brainstorm DB Schema](../reports/brainstorm-260329-2123-longnhan-hungyên-ecommerce.md)

## Overview

- **Priority:** P1 (blocking API development)
- **Status:** completed
- Define TypeORM entities, configure PostgreSQL connection, generate initial migration. Simplified entity model for MVP (no separate SKU table; variants have price+stock directly).

## Key Insights

- Research report has over-engineered Product→Variant→SKU 3-level hierarchy. For longan products (few variants by weight), **Product→Variant is sufficient**
- Use `uuid` primary keys for URL-safety
- `order_items.variant_snapshot` (JSONB) captures variant state at order time, preventing data loss on variant edits
- Vietnamese slug generation via `slug` npm package with `locale: 'vi'`

## Requirements

### Functional
- 7 entities: Admin, Product, ProductVariant, Order, OrderItem, Article, Media
- PostgreSQL connection via TypeORM DataSource
- Initial migration generating all tables
- Seed script for default admin account

### Non-Functional
- UUID primary keys
- Proper indexes on slug, status, createdAt columns
- JSONB for variant snapshot in order_items
- Decimal precision for VND prices (no decimals needed, but use integer for VND)

## Architecture

### Entity Relationship Diagram

```
Admin (id, email, password_hash, name, created_at)

Product (id, name, slug, description, base_price, images[], category,
         featured_image_url, active, created_at, updated_at)
  |-- 1:N --> ProductVariant (id, product_id, label, weight_g, price,
                               stock, sku_code, active, sort_order)

Order (id, code, customer_name, phone, email, address, province,
       total, payment_method, payment_status, order_status, notes,
       created_at, updated_at)
  |-- 1:N --> OrderItem (id, order_id, variant_id, variant_snapshot,
                          qty, unit_price, subtotal)

Article (id, title, slug, content_html, excerpt, meta_title,
         meta_description, featured_image_url, tags[],
         published, published_at, created_at, updated_at)

Media (id, cloudinary_public_id, url, filename, resource_type,
       folder, created_at)
```

### Enums (in packages/types)

```typescript
// Payment
export enum PaymentMethod { COD = 'cod', BANK_TRANSFER = 'bank_transfer' }
export enum PaymentStatus { PENDING = 'pending', PAID = 'paid', FAILED = 'failed' }

// Order
export enum OrderStatus {
  PENDING = 'pending', CONFIRMED = 'confirmed', SHIPPING = 'shipping',
  DELIVERED = 'delivered', CANCELLED = 'cancelled'
}

// Product
export enum ProductCategory {
  LONGAN_FRESH = 'longan_fresh', LONGAN_DRIED = 'longan_dried',
  LONGAN_PROCESSED = 'longan_processed', OTHER = 'other'
}
```

## Related Code Files

### Files to Create
- `apps/api/src/modules/database/typeorm.config.ts`
- `apps/api/src/modules/database/database.module.ts`
- `apps/api/src/modules/config/app.config.ts`
- `apps/api/src/modules/config/database.config.ts`
- `apps/api/src/modules/auth/entities/admin.entity.ts`
- `apps/api/src/modules/products/entities/product.entity.ts`
- `apps/api/src/modules/products/entities/product-variant.entity.ts`
- `apps/api/src/modules/orders/entities/order.entity.ts`
- `apps/api/src/modules/orders/entities/order-item.entity.ts`
- `apps/api/src/modules/articles/entities/article.entity.ts`
- `apps/api/src/modules/media/entities/media.entity.ts`
- `apps/api/src/modules/database/migrations/` (auto-generated)
- `apps/api/src/modules/database/seeds/admin-seed.ts`
- `packages/types/src/enums.ts`
- `packages/types/src/product.ts`
- `packages/types/src/order.ts`
- `packages/types/src/article.ts`
- `packages/types/src/auth.ts`

### Files to Modify
- `apps/api/src/app.module.ts` — import DatabaseModule
- `apps/api/package.json` — add typeorm, pg, @nestjs/typeorm, @nestjs/config
- `packages/types/src/index.ts` — re-export all types

## Implementation Steps

### 1. Install Dependencies

```bash
cd apps/api
pnpm add @nestjs/typeorm typeorm pg @nestjs/config class-validator class-transformer bcrypt uuid
pnpm add -D @types/bcrypt @types/uuid
```

### 2. Database Configuration

`apps/api/src/modules/config/database.config.ts`:
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'longnhan',
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
}));
```

### 3. Entity Definitions

**Product entity** (simplified from research):
```typescript
@Entity('products')
@Index(['slug'], { unique: true })
@Index(['active'])
export class Product {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 255 }) name: string;
  @Column({ type: 'varchar', length: 255, unique: true }) slug: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'integer' }) basePrice: number; // VND, no decimals
  @Column({ type: 'simple-array', nullable: true }) images: string[];
  @Column({ type: 'varchar', length: 255, nullable: true }) featuredImageUrl: string;
  @Column({ type: 'varchar', length: 50, default: 'other' }) category: string;
  @Column({ type: 'boolean', default: true }) active: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @OneToMany(() => ProductVariant, v => v.product, { cascade: true }) variants: ProductVariant[];
}
```

**ProductVariant** (flat, no SKU sub-table):
```typescript
@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() productId: string;
  @Column({ type: 'varchar', length: 100 }) label: string; // "500g", "1kg"
  @Column({ type: 'integer', nullable: true }) weightG: number;
  @Column({ type: 'integer' }) price: number; // VND
  @Column({ type: 'integer', default: 0 }) stock: number;
  @Column({ type: 'varchar', length: 50, nullable: true }) skuCode: string;
  @Column({ type: 'boolean', default: true }) active: boolean;
  @Column({ type: 'integer', default: 0 }) sortOrder: number;
  @ManyToOne(() => Product, p => p.variants, { onDelete: 'CASCADE' }) product: Product;
}
```

**Order** (no customer auth, captures contact info directly):
```typescript
@Entity('orders')
@Index(['code'], { unique: true })
@Index(['orderStatus'])
@Index(['createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 20, unique: true }) code: string;
  @Column({ type: 'varchar', length: 100 }) customerName: string;
  @Column({ type: 'varchar', length: 20 }) phone: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) email: string;
  @Column({ type: 'text' }) address: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) province: string;
  @Column({ type: 'integer' }) total: number;
  @Column({ type: 'varchar', length: 20, default: 'cod' }) paymentMethod: string;
  @Column({ type: 'varchar', length: 20, default: 'pending' }) paymentStatus: string;
  @Column({ type: 'varchar', length: 20, default: 'pending' }) orderStatus: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @OneToMany(() => OrderItem, i => i.order, { cascade: true }) items: OrderItem[];
}
```

**OrderItem** (snapshot preserves variant data at order time):
```typescript
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() orderId: string;
  @Column({ nullable: true }) variantId: string;
  @Column({ type: 'jsonb' }) variantSnapshot: Record<string, any>;
  @Column({ type: 'integer' }) qty: number;
  @Column({ type: 'integer' }) unitPrice: number;
  @Column({ type: 'integer' }) subtotal: number;
  @ManyToOne(() => Order, o => o.items, { onDelete: 'CASCADE' }) order: Order;
  @ManyToOne(() => ProductVariant, { nullable: true }) variant: ProductVariant;
}
```

### 4. Order Code Generator

```typescript
// Generate: LN-260329-XXXX (prefix + date + random 4 digits)
export function generateOrderCode(): string {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LN-${date}-${rand}`;
}
```

### 5. Admin Seed

```typescript
// seeds/admin-seed.ts
import * as bcrypt from 'bcrypt';

export async function seedAdmin(dataSource: DataSource) {
  const repo = dataSource.getRepository(Admin);
  const exists = await repo.findOneBy({ email: 'admin@longnhan.vn' });
  if (!exists) {
    const hash = await bcrypt.hash('changeme123', 10);
    await repo.save({ email: 'admin@longnhan.vn', passwordHash: hash, name: 'Admin' });
  }
}
```

### 6. Generate Migration

```bash
cd apps/api
npx typeorm migration:generate src/modules/database/migrations/InitialSchema -d src/modules/database/typeorm.config.ts
```

## Todo List

- [x] Install TypeORM, pg, config dependencies
- [x] Create database config module
- [x] Define enums in packages/types
- [x] Create Product + ProductVariant entities
- [x] Create Order + OrderItem entities
- [x] Create Article entity
- [x] Create Media entity
- [x] Create Admin entity
- [x] Wire DatabaseModule into AppModule
- [x] Generate initial migration
- [x] Create admin seed script
- [x] Define shared types in packages/types (DTOs interfaces)
- [x] Verify migration runs against local PostgreSQL

## Success Criteria

- `typeorm migration:run` creates all tables in PostgreSQL
- Admin seed creates default admin account
- All entities compile with TypeScript strict mode
- Shared types importable from both web and admin apps

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| VND integer overflow | Low | Use `integer` (max 2.1B VND = ~$83K per order, sufficient) |
| Migration conflicts | Medium | Single developer, linear migration history |
| JSONB query performance | Low | Only used for variant_snapshot, not queried frequently |

## Security Considerations

- Admin password hashed with bcrypt (10 rounds)
- Database credentials in .env, never committed
- `synchronize: false` in production

## Next Steps

- Phase 3: Build API endpoints using these entities
