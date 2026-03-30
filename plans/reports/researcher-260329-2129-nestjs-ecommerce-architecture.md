# NestJS + Prisma + PostgreSQL E-Commerce Architecture Research

**Date:** 2026-03-29
**Focus:** Backend architecture best practices for 2024-2025
**Scope:** Structure, authentication, database design, media handling, API patterns

---

## Executive Summary

Modern e-commerce backends require modular architecture, robust authentication, scalable data models, and clean API design. This report synthesizes best practices across NestJS (v10+), Prisma ORM (v5+), and PostgreSQL for production e-commerce systems.

**Key Takeaway:** Prioritize separation of concerns, implement proper database constraints, use JWT for admin-only auth, and build scalable media pipelines via CDN integration.

---

## 1. NestJS Project Structure for E-Commerce

### Recommended Module Organization

```
src/
├── common/                          # Shared utilities
│   ├── decorators/
│   │   ├── is-admin.decorator.ts
│   │   ├── current-user.decorator.ts
│   │   └── validate.decorator.ts
│   ├── guards/
│   │   ├── jwt.guard.ts
│   │   ├── admin.guard.ts
│   │   └── rate-limit.guard.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── prisma-exception.filter.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   ├── timeout.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── pipes/
│   │   ├── validation.pipe.ts
│   │   └── parse-int.pipe.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── cloudinary.config.ts
│   └── enums/
│       ├── order-status.enum.ts
│       └── user-role.enum.ts
│
├── auth/                            # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   └── jwt-payload.dto.ts
│   └── guards/
│       └── jwt-auth.guard.ts
│
├── users/                           # User/Admin management
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── user.dto.ts
│   └── entities/
│       └── user.entity.ts
│
├── products/                        # Products module
│   ├── products.module.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   ├── update-product.dto.ts
│   │   ├── product.dto.ts
│   │   └── paginated-query.dto.ts
│   ├── entities/
│   │   ├── product.entity.ts
│   │   └── product-variant.entity.ts
│   └── product-variants/           # Nested module for variants
│       ├── product-variants.controller.ts
│       ├── product-variants.service.ts
│       └── dto/
│           ├── create-variant.dto.ts
│           └── update-variant.dto.ts
│
├── orders/                          # Orders module
│   ├── orders.module.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── dto/
│   │   ├── create-order.dto.ts
│   │   ├── order.dto.ts
│   │   └── order-item.dto.ts
│   ├── entities/
│   │   ├── order.entity.ts
│   │   └── order-item.entity.ts
│   └── order-items/                # Nested module for items
│       ├── order-items.controller.ts
│       └── order-items.service.ts
│
├── articles/                        # Articles/Blog/CMS module
│   ├── articles.module.ts
│   ├── articles.controller.ts
│   ├── articles.service.ts
│   ├── dto/
│   │   ├── create-article.dto.ts
│   │   ├── update-article.dto.ts
│   │   └── article.dto.ts
│   ├── entities/
│   │   └── article.entity.ts
│   └── categories/                 # Optional: nested categories
│       ├── article-categories.controller.ts
│       └── article-categories.service.ts
│
├── media/                           # Media/Upload module
│   ├── media.module.ts
│   ├── media.controller.ts
│   ├── media.service.ts
│   ├── cloudinary.service.ts        # Cloudinary integration
│   ├── dto/
│   │   └── upload-response.dto.ts
│   └── types/
│       └── cloudinary-response.type.ts
│
├── database/                        # Database & Prisma
│   ├── prisma.service.ts
│   ├── prisma.module.ts
│   └── migrations/
│
├── app.module.ts                    # Root module
├── app.controller.ts
├── app.service.ts
└── main.ts

```

### Key Module Design Patterns

**Feature Modules:** Each feature (products, orders, articles) is self-contained with:
- `*.controller.ts` - HTTP endpoints
- `*.service.ts` - Business logic
- `dto/` - Data transfer objects (validation)
- `entities/` - Response shapes
- `*.module.ts` - Dependency injection container

**Shared Module:** Common utilities exposed via `shared.module.ts`
```typescript
// shared.module.ts
@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [PrismaService, ConfigModule],
})
export class SharedModule {}
```

**Lazy Loading:** Use dynamic imports for heavy modules in production:
```typescript
// app.module.ts
{
  provide: 'FEATURE_MODULES',
  useValue: ['products', 'orders', 'articles']
}
```

---

## 2. Prisma Schema Design for E-Commerce

### Complete Schema with Relationships

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============= ENUMS =============
enum UserRole {
  ADMIN
  MODERATOR
}

enum ProductStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  OUT_OF_STOCK
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// ============= USERS & AUTH =============
model User {
  id        String   @id @default(cuid())
  email     String   @unique @db.VarChar(255)
  password  String   @db.Text // bcrypt hash
  name      String   @db.VarChar(255)
  role      UserRole @default(ADMIN)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  articles  Article[]

  @@map("users")
  @@index([email])
}

// ============= PRODUCTS =============
model Product {
  id          String         @id @default(cuid())
  slug        String         @unique @db.VarChar(255)
  name        String         @db.VarChar(255)
  description String?        @db.Text
  status      ProductStatus  @default(DRAFT)

  // Pricing & Stock
  basePrice   Decimal        @db.Decimal(10, 2)
  cost        Decimal?       @db.Decimal(10, 2)

  // SEO & Meta
  seoTitle    String?        @db.VarChar(160)
  seoDesc     String?        @db.VarChar(160)
  metaKeywords String?       @db.Text

  // Media
  featuredImageUrl String?   @db.Text
  imageAlt    String?        @db.VarChar(255)

  // Timestamps
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  publishedAt DateTime?

  // Relations
  variants    ProductVariant[]
  orderItems  OrderItem[]
  images      ProductImage[]

  @@map("products")
  @@index([status])
  @@index([slug])
  @@index([createdAt])
  @@fulltext([name, description])  // MySQL specific, use gin for PostgreSQL
}

model ProductVariant {
  id          String   @id @default(cuid())
  productId   String
  sku         String   @unique @db.VarChar(100)
  barcode     String?  @unique @db.VarChar(100)

  // Variant Details
  name        String   @db.VarChar(255)  // e.g., "Red - Size M"
  description String?  @db.Text

  // Pricing (can override product price)
  price       Decimal  @db.Decimal(10, 2)
  cost        Decimal? @db.Decimal(10, 2)

  // Stock Management (inventory)
  stock       Int      @default(0)
  reservedQty Int      @default(0)  // For pending orders

  // Attributes (JSON for flexibility)
  attributes  Json     // { "color": "red", "size": "M" }

  // Status
  isActive    Boolean  @default(true)

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  orderItems  OrderItem[]
  images      ProductImage[]

  @@unique([productId, sku])
  @@map("product_variants")
  @@index([productId])
  @@index([sku])
  @@index([barcode])
}

model ProductImage {
  id          String   @id @default(cuid())
  productId   String?
  variantId   String?
  url         String   @db.Text
  alt         String?  @db.VarChar(255)
  order       Int      @default(0)
  createdAt   DateTime @default(now())

  product     Product? @relation(fields: [productId], references: [id], onDelete: Cascade)
  variant     ProductVariant? @relation(fields: [variantId], references: [id], onDelete: Cascade)

  @@map("product_images")
  @@index([productId])
  @@index([variantId])
}

// ============= ORDERS =============
model Order {
  id            String      @id @default(cuid())
  orderNumber   String      @unique @db.VarChar(50)

  // Customer Info (no auth, just data)
  customerEmail String      @db.VarChar(255)
  customerName  String      @db.VarChar(255)
  customerPhone String?     @db.VarChar(20)

  // Shipping
  shippingAddress String    @db.Text
  shippingCity  String      @db.VarChar(100)
  shippingPostal String?    @db.VarChar(20)
  shippingCountry String    @db.VarChar(100)

  // Billing (optional)
  billingAddress String?    @db.Text

  // Status
  status        OrderStatus @default(PENDING)

  // Pricing
  subtotal      Decimal     @db.Decimal(10, 2)
  shippingCost  Decimal     @default(0) @db.Decimal(10, 2)
  taxAmount     Decimal     @default(0) @db.Decimal(10, 2)
  totalAmount   Decimal     @db.Decimal(10, 2)

  // Payment
  paymentMethod String      @db.VarChar(50)  // "card", "transfer", etc
  paymentStatus String      @default("pending") @db.VarChar(50)
  transactionId String?     @unique @db.VarChar(255)

  // Notes
  notes         String?     @db.Text
  cancelReason  String?     @db.Text

  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  shippedAt     DateTime?
  deliveredAt   DateTime?

  // Relations
  items         OrderItem[]
  timeline      OrderTimeline[]

  @@map("orders")
  @@index([status])
  @@index([customerEmail])
  @@index([orderNumber])
  @@index([createdAt])
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  variantId   String

  // Snapshot (capture price at order time)
  productName String   @db.VarChar(255)
  variantName String   @db.VarChar(255)
  sku         String   @db.VarChar(100)
  price       Decimal  @db.Decimal(10, 2)
  quantity    Int

  // Relations
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variant     ProductVariant @relation(fields: [variantId], references: [id])

  @@map("order_items")
  @@index([orderId])
  @@index([variantId])
}

model OrderTimeline {
  id        String   @id @default(cuid())
  orderId   String
  status    OrderStatus
  message   String   @db.Text
  createdAt DateTime @default(now())

  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("order_timeline")
  @@index([orderId])
}

// ============= ARTICLES/BLOG =============
model Article {
  id          String        @id @default(cuid())
  slug        String        @unique @db.VarChar(255)
  title       String        @db.VarChar(255)
  content     String        @db.Text
  excerpt     String?       @db.VarChar(500)
  status      ArticleStatus @default(DRAFT)

  // Author
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])

  // Featured
  featuredImageUrl String?  @db.Text

  // SEO
  seoTitle    String?       @db.VarChar(160)
  seoDesc     String?       @db.VarChar(160)

  // Timestamps
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  publishedAt DateTime?

  // Relations
  categories  ArticleCategory[]
  tags        ArticleTag[]

  @@map("articles")
  @@index([status])
  @@index([slug])
  @@index([authorId])
  @@index([publishedAt])
}

model ArticleCategory {
  id        String   @id @default(cuid())
  articleId String
  categoryId String

  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  category  Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@unique([articleId, categoryId])
  @@map("article_categories")
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique @db.VarChar(100)
  slug      String   @unique @db.VarChar(100)
  description String? @db.Text

  articles  ArticleCategory[]

  @@map("categories")
  @@index([slug])
}

model ArticleTag {
  id        String   @id @default(cuid())
  articleId String
  tag       String   @db.VarChar(50)

  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([articleId, tag])
  @@map("article_tags")
  @@index([articleId])
  @@index([tag])
}

// ============= MEDIA METADATA =============
model MediaAsset {
  id          String   @id @default(cuid())
  fileName    String   @db.VarChar(255)
  cloudinaryId String  @unique @db.VarChar(255)  // cloudinary public_id
  url         String   @db.Text
  secureUrl   String   @db.Text

  // Metadata
  mimeType    String   @db.VarChar(100)
  size        Int      // bytes
  width       Int?
  height      Int?

  // Storage
  format      String   @db.VarChar(20)
  uploadedAt  DateTime @default(now())

  @@map("media_assets")
  @@index([cloudinaryId])
}
```

### Schema Design Principles

**1. Separation of Concerns:**
- `Product` (catalog) separate from `ProductVariant` (SKU/inventory)
- `OrderItem` captures price snapshot (immutable history)
- `MediaAsset` tracks Cloudinary metadata independently

**2. Normalization:**
- No denormalization at rest; use views/computed fields for reads
- JSON fields for semi-structured data (variant attributes)

**3. Constraints:**
- Unique indexes on business identifiers (`sku`, `slug`, `email`)
- Foreign keys with cascade delete for hierarchical data
- NOT NULL on critical fields (status, amounts)

**4. Performance:**
- Indexes on frequently queried fields (`status`, `createdAt`, `productId`)
- Partial indexes for soft deletes if needed
- Use `db.Text` for searchable content, `db.VarChar` for identifiers

---

## 3. JWT Authentication Setup (Admin-Only)

### Implementation Pattern

```typescript
// common/config/jwt.config.ts
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'dev-secret-key',
  expiresIn: '24h',
  refreshExpiresIn: '7d',
};

// auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '@common/config/jwt.config';

interface JwtPayload {
  sub: string;      // user id
  email: string;
  role: 'ADMIN' | 'MODERATOR';
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}

// auth/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or missing token');
    }
    return user;
  }
}

// common/guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin role required');
    }
    return true;
  }
}

// auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: jwtConfig.expiresIn,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: jwtConfig.refreshExpiresIn,
      }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const payload = {
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };

      return {
        accessToken: this.jwtService.sign(payload, {
          expiresIn: jwtConfig.expiresIn,
        }),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

// auth/auth.controller.ts
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  async refresh(@Body() dto: { refreshToken: string }) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    return { message: 'Logged out successfully' };
  }
}

// auth/auth.module.ts
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
```

### Usage in Protected Routes

```typescript
// products.controller.ts
@Controller('api/products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()  // Public endpoint
  async list(@Query() query: PaginatedQueryDto) {
    return this.productsService.findPublished(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)  // Protected
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
```

---

## 4. Cloudinary Integration for Media

### Service Implementation

```typescript
// media/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './types/cloudinary-response.type';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'ecommerce',
  ): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          max_bytes: 5242880, // 5MB
          transformation: [
            { quality: 'auto:good', fetch_format: 'auto' },
            { width: 2000, height: 2000, crop: 'limit' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      stream.end(file.buffer);
    });
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder: string = 'ecommerce',
  ): Promise<CloudinaryResponse[]> {
    return Promise.all(
      files.map((file) => this.uploadImage(file, folder)),
    );
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  async deleteMultiple(publicIds: string[]): Promise<void> {
    await Promise.all(
      publicIds.map((id) => cloudinary.uploader.destroy(id)),
    );
  }

  // Optimization: get responsive image URLs
  getOptimizedUrl(
    publicId: string,
    width: number = 500,
    height: number = 500,
  ): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    });
  }

  // Generate srcset for responsive images
  getSrcSet(publicId: string): Record<string, string> {
    const sizes = [300, 600, 1000, 1500];
    return sizes.reduce(
      (acc, size) => ({
        ...acc,
        [`${size}w`]: this.getOptimizedUrl(publicId, size, size),
      }),
      {},
    );
  }
}

// media/media.service.ts
@Injectable()
export class MediaService {
  constructor(
    private cloudinary: CloudinaryService,
    private prisma: PrismaService,
  ) {}

  async uploadProductImage(
    file: Express.Multer.File,
    productId?: string,
    variantId?: string,
  ) {
    const result = await this.cloudinary.uploadImage(
      file,
      'ecommerce/products',
    );

    const asset = await this.prisma.mediaAsset.create({
      data: {
        fileName: file.originalname,
        cloudinaryId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        mimeType: file.mimetype,
        size: file.size,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });

    return {
      id: asset.id,
      url: asset.secureUrl,
      width: asset.width,
      height: asset.height,
      srcSet: this.cloudinary.getSrcSet(result.public_id),
    };
  }

  async deleteImage(cloudinaryId: string) {
    await this.cloudinary.deleteImage(cloudinaryId);
    await this.prisma.mediaAsset.deleteMany({
      where: { cloudinaryId },
    });
  }
}

// media/media.controller.ts
@Controller('api/media')
@UseGuards(JwtAuthGuard, AdminGuard)
@UseInterceptors(
  FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/image\/(jpg|jpeg|png|webp|gif)/)) {
        callback(new BadRequestException('Only images allowed'), false);
      } else {
        callback(null, true);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }),
)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload-product')
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('productId') productId?: string,
    @Query('variantId') variantId?: string,
  ) {
    return this.mediaService.uploadProductImage(
      file,
      productId,
      variantId,
    );
  }

  @Delete(':cloudinaryId')
  async deleteImage(@Param('cloudinaryId') cloudinaryId: string) {
    await this.mediaService.deleteImage(cloudinaryId);
    return { message: 'Image deleted' };
  }
}
```

### Cloudinary Configuration

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 5. REST API Best Practices for NestJS

### Pagination & Filtering

```typescript
// common/dto/paginated-query.dto.ts
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginatedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  search?: string;
}

// products/dto/product-filter.dto.ts
export class ProductFilterDto extends PaginatedQueryDto {
  @IsOptional()
  @IsString()
  status?: ProductStatus;

  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  category?: string;
}

// Common response shape
export class PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// products.service.ts - Implementation
@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findPublished(dto: ProductFilterDto) {
    const { page, limit, sortBy, sortOrder, search, status, minPrice, maxPrice } = dto;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: Prisma.ProductWhereInput = {
      status: status || ProductStatus.PUBLISHED,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    // Fetch data
    const [total, data] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          basePrice: true,
          featuredImageUrl: true,
          variants: {
            where: { isActive: true },
            select: { id: true, sku: true, stock: true, price: true },
            take: 1,
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}

// products.controller.ts - Usage
@Get()
async list(@Query() query: ProductFilterDto) {
  return this.productsService.findPublished(query);
}
```

### Error Handling

```typescript
// common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      message: (exceptionResponse as any).message || exception.message,
      timestamp: new Date().toISOString(),
      ...(status >= 500 && { traceId: 'uuid-here' }),
    });
  }
}

// common/filters/prisma-exception.filter.ts
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    if (exception.code === 'P2002') {
      status = HttpStatus.CONFLICT;
      message = `Unique constraint failed on ${(exception.meta?.target as string[])?.[0]}`;
    } else if (exception.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

// app.module.ts
@Module({
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}
```

### Validation & Transformation

```typescript
// common/pipes/validation.pipe.ts
import { BadRequestException, ValidationPipe as NestValidationPipe } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
      whitelist: true,
    });
  }
}

// main.ts
import { ValidationPipe } from '@common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
```

---

## 6. PostgreSQL Schema Patterns for E-Commerce

### Product Variants & SKU Management

```sql
-- Key constraints for inventory
CREATE TABLE product_variants (
  id CHAR(24) PRIMARY KEY,
  product_id CHAR(24) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  barcode VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  cost NUMERIC(10, 2),
  stock INT NOT NULL DEFAULT 0,
  reserved_qty INT NOT NULL DEFAULT 0,
  attributes JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(product_id, sku)
);

-- Indexes for performance
CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_barcode ON product_variants(barcode);
CREATE INDEX idx_variants_active ON product_variants(is_active) WHERE is_active = TRUE;

-- GIN index for JSONB attributes
CREATE INDEX idx_variants_attributes ON product_variants USING GIN (attributes);

-- Available stock calculation (stock - reserved)
CREATE VIEW product_variants_with_available_stock AS
SELECT
  id,
  sku,
  stock,
  reserved_qty,
  (stock - reserved_qty) as available_stock
FROM product_variants;
```

### Order Lifecycle & Status Management

```sql
-- Order status transitions
CREATE TABLE orders (
  id CHAR(24) PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Audit trail for status changes
CREATE TABLE order_timeline (
  id CHAR(24) PRIMARY KEY,
  order_id CHAR(24) NOT NULL,
  status VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_timeline_order_id ON order_timeline(order_id);

-- Order fulfillment view
CREATE VIEW order_fulfillment_status AS
SELECT
  o.id,
  o.order_number,
  o.status,
  COUNT(DISTINCT oi.id) as total_items,
  COUNT(DISTINCT CASE WHEN o.status = 'DELIVERED' THEN oi.id END) as delivered_items,
  (SELECT message FROM order_timeline WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as latest_message
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;
```

### Blog/CMS Content Structure

```sql
-- Article with versioning capability
CREATE TABLE articles (
  id CHAR(24) PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  author_id CHAR(24) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMPTZ,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Full-text search support
CREATE INDEX idx_articles_search ON articles USING GIN (
  to_tsvector('english', title || ' ' || content)
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_author_id ON articles(author_id);

-- Tag system (many-to-many)
CREATE TABLE article_tags (
  id CHAR(24) PRIMARY KEY,
  article_id CHAR(24) NOT NULL,
  tag VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  UNIQUE(article_id, tag)
);

CREATE INDEX idx_article_tags_tag ON article_tags(tag);

-- Categories with hierarchy (optional)
CREATE TABLE categories (
  id CHAR(24) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_id CHAR(24),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
```

### Query Optimization Patterns

```sql
-- Efficient product listing with variant info
SELECT
  p.id,
  p.slug,
  p.name,
  p.description,
  p.base_price,
  p.featured_image_url,
  jsonb_build_object(
    'id', pv.id,
    'sku', pv.sku,
    'price', pv.price,
    'available_stock', (pv.stock - pv.reserved_qty)
  ) as primary_variant
FROM products p
LEFT JOIN LATERAL (
  SELECT id, sku, price, stock, reserved_qty
  FROM product_variants
  WHERE product_id = p.id AND is_active = TRUE
  ORDER BY created_at
  LIMIT 1
) pv ON TRUE
WHERE p.status = 'PUBLISHED'
ORDER BY p.created_at DESC
LIMIT 20 OFFSET 0;

-- Order summary with item count and total
SELECT
  o.id,
  o.order_number,
  o.customer_email,
  o.status,
  o.total_amount,
  COUNT(DISTINCT oi.id) as item_count,
  SUM(oi.quantity) as total_quantity,
  o.created_at
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY o.id
ORDER BY o.created_at DESC;

-- Article search with tag aggregation
SELECT
  a.id,
  a.slug,
  a.title,
  a.excerpt,
  a.published_at,
  jsonb_agg(DISTINCT at.tag) as tags
FROM articles a
LEFT JOIN article_tags at ON a.id = at.article_id
WHERE a.status = 'PUBLISHED'
  AND (
    to_tsvector('english', a.title || ' ' || a.content) @@
    plainto_tsquery('english', 'search term')
  )
GROUP BY a.id, a.slug, a.title, a.excerpt, a.published_at
ORDER BY a.published_at DESC;
```

---

## 7. Turborepo Monorepo Setup

### Project Structure

```
monorepo/
├── apps/
│   ├── api/                         # NestJS backend
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   └── web/                         # Next.js frontend
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
│       └── next.config.js
│
├── packages/
│   ├── shared-types/                # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── api.ts               # API response types
│   │   │   ├── models.ts            # Database model types
│   │   │   ├── auth.ts              # Auth types
│   │   │   └── pagination.ts        # Pagination types
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui-components/               # Shared React components
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── utils/                       # Shared utilities
│       ├── src/
│       │   ├── validators.ts
│       │   ├── formatters.ts
│       │   └── api-client.ts
│       ├── package.json
│       └── tsconfig.json
│
├── turbo.json
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

### Configuration Files

```json
{
  "name": "ecommerce-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  }
}
```

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "**/.env.local",
    "**/.env"
  ],
  "pipeline": {
    "build": {
      "dependsOn": [
        "^build"
      ],
      "outputs": [
        "dist/**",
        ".next/**"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "outputs": [
        "coverage/**"
      ],
      "inputs": [
        "src/**",
        "tests/**",
        "jest.config.js"
      ]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "outputs": []
    }
  }
}
```

### Shared Types Package

```typescript
// packages/shared-types/src/api.ts
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
  traceId?: string;
}

// packages/shared-types/src/models.ts
export interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string;
  basePrice: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'OUT_OF_STOCK';
  featuredImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
}

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

// packages/shared-types/src/auth.ts
export interface JwtPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'MODERATOR';
  iat: number;
  exp: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
```

### Next.js Frontend Usage

```typescript
// apps/web/src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, Product } from '@shared-types/api';

export function useProducts(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['products', page, limit],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?page=${page}&limit=${limit}`
      );
      return res.json() as Promise<ApiResponse<Product[]>>;
    },
  });
}
```

---

## Key Takeaways & Best Practices Summary

| Area | Best Practice | Why |
|------|---------------|-----|
| **Module Structure** | Feature-based modules with clear boundaries | Scalability, testability, code reuse |
| **Database Schema** | Separate variants from products, snapshot order items | Handles inventory complexity, preserves order history |
| **Authentication** | JWT + role-based guards, no customer auth | Admin-only workflow, stateless, scalable |
| **Media** | Cloudinary for uploads + MediaAsset table for metadata | CDN performance, storage efficiency, trackability |
| **API Design** | Pagination, filtering, proper error handling | User experience, performance, debugging |
| **PostgreSQL** | Indexes on queries, constraints on writes, views for reports | Query performance, data integrity, business logic isolation |
| **Monorepo** | Turborepo with shared types package | DRY, type safety across frontend/backend, reduced duplication |

---

## Unresolved Questions

1. **Payment Processing:** Should integration (Stripe, PayPal) be a separate module or integrated into orders?
2. **Inventory Transactions:** Should stock movements be logged as audit trail in separate table?
3. **Search Strategy:** Implement PostgreSQL full-text search or use Elasticsearch for large catalogs?
4. **Caching Layer:** Redis for product cache, or rely on database indexes?
5. **Event-Driven Updates:** Use Bull queues for async order processing (email, inventory, notifications)?
6. **Multi-Tenancy:** Is this single-tenant or multi-tenant e-commerce platform?
7. **Customer Accounts:** Future requirement for customer auth / wishlists / reviews?
