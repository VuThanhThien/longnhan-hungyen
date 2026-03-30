# NestJS + TypeORM + PostgreSQL E-Commerce Backend Research
**Date:** March 29, 2026 | **Focus:** 2024-2025 Best Practices

## Executive Summary

Modern e-commerce backends require scalable architecture, clean separation of concerns, and type-safe database interactions. NestJS + TypeORM + PostgreSQL provides enterprise-grade tooling with minimal boilerplate. Key insights:

- **Project structure**: Feature-based module architecture (products, orders, articles, auth, media)
- **Database design**: Proper normalization with strategic denormalization for e-commerce
- **Relations**: OneToMany/ManyToOne for hierarchy, ManyToMany for flexible associations
- **Authentication**: JWT with admin-only scope (no customer auth layer)
- **File handling**: Cloudinary integration via multer middleware
- **API design**: DTO-based validation, cursor/offset pagination, structured error responses
- **Monorepo**: Turborepo with apps/api + shared workspace layout

---

## 1. NestJS Project Structure for E-Commerce

### Recommended Module Architecture

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── dto/
│   │   │   ├── login-admin.dto.ts
│   │   │   └── jwt-payload.dto.ts
│   │   └── auth.module.ts
│   ├── products/
│   │   ├── entities/
│   │   │   ├── product.entity.ts
│   │   │   ├── product-variant.entity.ts
│   │   │   └── product-sku.entity.ts
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   ├── update-product.dto.ts
│   │   │   └── product-query.dto.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── products.module.ts
│   ├── orders/
│   │   ├── entities/
│   │   │   ├── order.entity.ts
│   │   │   ├── order-item.entity.ts
│   │   │   └── order-shipment.entity.ts
│   │   ├── dto/
│   │   │   ├── create-order.dto.ts
│   │   │   └── order-status.dto.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   └── orders.module.ts
│   ├── articles/
│   │   ├── entities/
│   │   │   ├── article.entity.ts
│   │   │   └── article-category.entity.ts
│   │   ├── dto/
│   │   │   ├── create-article.dto.ts
│   │   │   └── article-query.dto.ts
│   │   ├── articles.controller.ts
│   │   ├── articles.service.ts
│   │   └── articles.module.ts
│   ├── media/
│   │   ├── media.controller.ts
│   │   ├── media.service.ts
│   │   ├── cloudinary.provider.ts
│   │   └── media.module.ts
│   ├── common/
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   └── error-handling.interceptor.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── decorators/
│   │   │   ├── auth.decorator.ts
│   │   │   └── pagination.decorator.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── types/
│   │       ├── pagination.types.ts
│   │       └── response.types.ts
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── typeorm.config.ts
│   └── config/
│       ├── app.config.ts
│       ├── database.config.ts
│       └── cloudinary.config.ts
├── app.module.ts
└── main.ts
```

### Key Principles

- **Feature modules**: Each module owns entities, DTOs, controller, service
- **Shared exports**: Use `@Global()` for database, config, auth guards
- **Separation of concerns**: Controller (HTTP), Service (business logic), Repository (data access)
- **Lazy loading**: Import modules on-demand to reduce cold start
- **Configuration**: Environment-based config via `@nestjs/config` (not hardcoded)

---

## 2. TypeORM Entity Design Patterns for E-Commerce

### Core Entities: Products System

```typescript
// product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';

@Entity('products')
@Index(['slug'], { unique: true })
@Index(['status'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice: number;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'draft'], default: 'draft' })
  status: 'active' | 'inactive' | 'draft';

  @Column({ type: 'int', default: 0 })
  totalStock: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  featuredImageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
    eager: false,
  })
  variants: ProductVariant[];

  @ManyToMany(() => ArticleCategory, (category) => category.products)
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: ArticleCategory[];
}

// product-variant.entity.ts
@Entity('product_variants')
@Index(['productId', 'name'], { unique: true })
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g., "Red", "Large", "XL"

  @Column({ type: 'varchar', length: 50 })
  optionType: string; // e.g., "color", "size", "material"

  @Column({ type: 'int', default: 0 })
  stock: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @OneToMany(() => ProductSKU, (sku) => sku.variant, {
    cascade: true,
    eager: false,
  })
  skus: ProductSKU[];
}

// product-sku.entity.ts - Stock Keeping Unit
@Entity('product_skus')
@Index(['sku'], { unique: true })
export class ProductSKU {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  variantId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string; // e.g., "PROD-RED-L-001"

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  reserved: number; // For pending orders

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  wholesalePrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ProductVariant, (variant) => variant.skus, {
    onDelete: 'CASCADE',
  })
  variant: ProductVariant;

  // Computed property
  get available(): number {
    return Math.max(0, this.quantity - this.reserved);
  }
}
```

### Orders System

```typescript
// order.entity.ts
@Entity('orders')
@Index(['orderNumber'], { unique: true })
@Index(['status'])
@Index(['createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  orderNumber: string; // e.g., "ORD-2025-001234"

  @Column({ type: 'enum', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: false,
  })
  items: OrderItem[];

  @OneToOne(() => OrderShipment, (shipment) => shipment.order, {
    cascade: true,
    eager: false,
  })
  shipment: OrderShipment;
}

// order-item.entity.ts
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column()
  skuId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number; // quantity * unitPrice

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  order: Order;

  @ManyToOne(() => ProductSKU)
  sku: ProductSKU;
}

// order-shipment.entity.ts
@Entity('order_shipments')
export class OrderShipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  trackingNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  carrier: string; // e.g., "FedEx", "DHL"

  @Column({ type: 'enum', enum: ['pending', 'in_transit', 'delivered'], default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @OneToOne(() => Order, (order) => order.shipment, {
    onDelete: 'CASCADE',
  })
  order: Order;
}
```

### Articles/CMS System

```typescript
// article.entity.ts
@Entity('articles')
@Index(['slug'], { unique: true })
@Index(['published'])
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  featuredImage: string;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column()
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ArticleCategory, (category) => category.articles, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  category: ArticleCategory;
}

// article-category.entity.ts
@Entity('article_categories')
export class ArticleCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @OneToMany(() => Article, (article) => article.category, {
    eager: false,
  })
  articles: Article[];

  @ManyToMany(() => Product, (product) => product.categories)
  products: Product[];
}
```

### Design Considerations

- **Primary keys**: UUID for distributed systems (better than auto-increment)
- **Soft deletes**: NOT recommended for orders/payments (use status enum instead)
- **Indexes**: On foreign keys, frequently filtered columns (status, slug)
- **Cascade**: DELETE for variants/items, SET NULL for optional relations
- **Precision**: `decimal(12, 2)` for money (never float)
- **Eager loading**: Disabled by default (explicit `.leftJoinAndSelect()`)

---

## 3. TypeORM Relations: Best Practices

### OneToMany / ManyToOne (Hierarchical)

```typescript
// Product has many Variants (1:N)
@OneToMany(() => ProductVariant, (variant) => variant.product, {
  cascade: true,        // Auto-cascade delete/insert
  eager: false,         // Explicit loading only
  onDelete: 'CASCADE',  // DB-level constraint
})
variants: ProductVariant[];

@ManyToOne(() => Product, (product) => product.variants, {
  onDelete: 'CASCADE',  // Delete variant when product deleted
  nullable: false,      // Foreign key not null
})
product: Product;
```

**When to use:** Parent-child hierarchies (products → variants, orders → items)

### ManyToMany (Flexible Associations)

```typescript
// Products <-> Categories (M:N)
@ManyToMany(() => ArticleCategory, (category) => category.products)
@JoinTable({
  name: 'product_categories',  // Explicit junction table
  joinColumn: { name: 'product_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
})
categories: ArticleCategory[];

@ManyToMany(() => Product, (product) => product.categories)
products: Product[];
```

**When to use:** Many-to-many without extra data (tags, categories)

### OneToOne (Exclusive Pairing)

```typescript
// Order <-> Shipment (1:1)
@OneToOne(() => OrderShipment, (shipment) => shipment.order, {
  cascade: true,
  onDelete: 'CASCADE',
})
shipment: OrderShipment;

@OneToOne(() => Order, (order) => order.shipment, {
  onDelete: 'CASCADE',
})
order: Order;
```

**When to use:** Exclusive relationships (account ↔ profile)

### Loading Strategies

```typescript
// Avoid N+1 queries with explicit loading
const products = await productRepository
  .createQueryBuilder('product')
  .leftJoinAndSelect('product.variants', 'variant')
  .leftJoinAndSelect('variant.skus', 'sku')
  .leftJoinAndSelect('product.categories', 'category')
  .where('product.status = :status', { status: 'active' })
  .getMany();

// Pagination with relations
const [products, total] = await productRepository
  .createQueryBuilder('product')
  .leftJoinAndSelect('product.variants', 'variant')
  .skip(10)
  .take(20)
  .getManyAndCount();
```

---

## 4. TypeORM Migrations Workflow

### Setup

```typescript
// typeorm.config.ts
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsDir: 'src/database/migrations',
  synchronize: false, // NEVER in production
  logging: ['query', 'error'],
});
```

### package.json Scripts

```json
{
  "typeorm": "typeorm-ts-node-esm",
  "migration:generate": "npm run typeorm -- migration:generate src/database/migrations/$npm_config_name -- --dataSource src/database/typeorm.config.ts",
  "migration:create": "npm run typeorm -- migration:create src/database/migrations/$npm_config_name",
  "migration:run": "npm run typeorm -- migration:run -- --dataSource src/database/typeorm.config.ts",
  "migration:revert": "npm run typeorm -- migration:revert -- --dataSource src/database/typeorm.config.ts"
}
```

### Workflow

```bash
# 1. Make entity changes
# 2. Generate migration from changes
npm run migration:generate -- add_product_variants

# 3. Review generated migration
cat src/database/migrations/1234567890000-add_product_variants.ts

# 4. Run migration
npm run migration:run

# 5. Revert if needed
npm run migration:revert
```

### Sample Migration

```typescript
// src/database/migrations/1234567890000-CreateProductVariants.ts
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProductVariants1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_variants',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'option_type', type: 'varchar', length: '50' },
          { name: 'stock', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indices: [{ columnNames: ['product_id', 'name'], isUnique: true }],
      }),
    );

    await queryRunner.createForeignKey(
      'product_variants',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('product_variants');
  }
}
```

### Best Practices

- **Generate over manual**: Always `migration:generate` to capture changes
- **Version control**: Commit migrations, never skip them
- **Test in CI**: Run migrations in test database before production
- **Backwards compatibility**: Write down migrations that don't break old code
- **Dry runs**: Test revert before pushing to production
- **Naming**: Use descriptive names (`add_product_variants`, not `init`)

---

## 5. JWT Authentication Setup (Admin-Only)

### Strategy Implementation

```typescript
// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return { userId: payload.userId, role: payload.role };
  }
}

// jwt-payload.dto.ts
export class JwtPayload {
  userId: string;
  role: 'admin' | 'super_admin';
  iat?: number;
  exp?: number;
}
```

### Auth Module

```typescript
// auth.module.ts
@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [JwtModule],
})
export class AuthModule {}

// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private adminRepository: Repository<Admin>,
  ) {}

  async loginAdmin(email: string, password: string) {
    const admin = await this.adminRepository.findOne({ where: { email } });
    if (!admin || !await bcrypt.compare(password, admin.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: admin.id,
      role: admin.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      admin: { id: admin.id, email: admin.email, role: admin.role },
    };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

// auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() { email, password }: LoginAdminDto) {
    return this.authService.loginAdmin(email, password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
```

### Guards & Decorators

```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    return super.canActivate(context);
  }
}

// role.guard.ts
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// @Roles() decorator
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Usage in controller
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('super_admin')
@Delete('products/:id')
deleteProduct(@Param('id') id: string) {
  // Only super_admin can delete
}
```

### Login Flow

```
POST /auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

Response 200:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin"
  }
}

Client sends in headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 6. Cloudinary Integration for Media Uploads

### Setup

```typescript
// cloudinary.provider.ts
import { v2 as cloudinary } from 'cloudinary';

export const cloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  },
};

// media.service.ts
@Injectable()
export class MediaService {
  constructor(@Inject('CLOUDINARY') private cloudinary) {}

  async uploadImage(file: Express.Multer.File, folder: string = 'ecommerce'): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        resolve();
      });
    });
  }

  async getOptimizedUrl(publicId: string, options: { width?: number; height?: number; quality?: string } = {}): string {
    return this.cloudinary.url(publicId, {
      quality: options.quality || 'auto',
      fetch_format: 'auto',
      width: options.width,
      height: options.height,
      crop: 'fill',
    });
  }
}

// media.module.ts
@Module({
  providers: [cloudinaryProvider, MediaService],
  exports: [MediaService],
})
export class MediaModule {}
```

### File Upload with Multer

```typescript
// media.controller.ts
import { fileFilter, multerOptions } from '@common/config/multer.config';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const result = await this.mediaService.uploadImage(file, 'products');
    return {
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    };
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    const results = await Promise.all(
      files.map((file) => this.mediaService.uploadImage(file, 'products')),
    );
    return {
      success: true,
      data: results,
    };
  }

  @Delete('delete/:publicId')
  async deleteImage(@Param('publicId') publicId: string) {
    await this.mediaService.deleteImage(publicId);
    return { success: true, message: 'Image deleted' };
  }
}

// multer.config.ts
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads/temp',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      cb(null, `${uniqueName}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new BadRequestException('Invalid file type. Only JPEG, PNG, WebP allowed.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
};
```

### Cloudinary API Flow

```
1. Client selects file
2. POST /media/upload with FormData
3. Server receives file in memory/temp storage
4. Server uploads to Cloudinary via API
5. Return secure_url + public_id
6. Store in database
7. Delete temp file
```

---

## 7. REST API Best Practices in NestJS

### Pagination DTOs

```typescript
// pagination.dto.ts
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  search?: string;
}

// cursor-pagination.dto.ts (for large datasets)
export class CursorPaginationDto {
  @IsOptional()
  @IsString()
  cursor?: string; // Base64 encoded ID

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

### Response DTOs

```typescript
// paginated-response.dto.ts
export class PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// api-response.dto.ts
export class ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}
```

### Service Pagination Logic

```typescript
// products.service.ts
async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<ProductDto>> {
  const { page = 1, limit = 20, search, sortBy = 'createdAt', sort = 'desc' } = query;
  const skip = (page - 1) * limit;

  let qb = this.productRepository.createQueryBuilder('product');

  if (search) {
    qb = qb.where('product.name ILIKE :search OR product.description ILIKE :search', {
      search: `%${search}%`,
    });
  }

  const [data, total] = await qb
    .skip(skip)
    .take(limit)
    .orderBy(`product.${sortBy}`, sort.toUpperCase() as 'ASC' | 'DESC')
    .getManyAndCount();

  return {
    data: data.map((product) => plainToClass(ProductDto, product)),
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}
```

### Controller Usage

```typescript
@Controller('products')
export class ProductsController {
  constructor(private productService: ProductsService) {}

  @Get()
  async getAll(@Query() query: PaginationQueryDto) {
    const result = await this.productService.findAll(query);
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const product = await this.productService.findById(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return {
      success: true,
      data: product,
    };
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Post()
  async create(@Body() dto: CreateProductDto) {
    const product = await this.productService.create(dto);
    return {
      success: true,
      data: product,
      message: 'Product created successfully',
    };
  }
}
```

### Validation & Error Handling

```typescript
// create-product.dto.ts
export class CreateProductDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  basePrice: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @IsPositive()
  salePrice?: number;

  @IsEnum(['active', 'inactive', 'draft'])
  status?: 'active' | 'inactive' | 'draft';

  @ValidateNested()
  @Type(() => ProductVariantDto)
  @ArrayMinSize(1)
  variants: ProductVariantDto[];
}

// validation.pipe.ts (custom validation)
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('Validation failed');
    }
    const object = plainToClass(metadata.type, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors));
    }
    return value;
  }

  private formatErrors(errors: ValidationError[]) {
    return errors.reduce((acc, err) => {
      acc[err.property] = Object.values(err.constraints);
      return acc;
    }, {});
  }
}

// http-exception.filter.ts (global error handling)
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ExecutionContext) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      success: false,
      status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Query Examples

```
GET /products?page=1&limit=20&search=laptop&sortBy=basePrice&sort=asc
GET /products/uuid?include=variants,categories
DELETE /products/uuid
PATCH /products/uuid { "status": "inactive" }
POST /media/upload
```

---

## 8. PostgreSQL Schema for E-Commerce

### Full Schema Design

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  status ENUM('active', 'inactive', 'draft') DEFAULT 'draft',
  total_stock INT DEFAULT 0,
  featured_image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CHECK (base_price > 0),
  CHECK (sale_price IS NULL OR sale_price > 0),
  CHECK (sale_price IS NULL OR sale_price < base_price)
);

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Product variants (size, color, etc.)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  option_type VARCHAR(50) NOT NULL,
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(product_id, name)
);

CREATE INDEX idx_variants_product_id ON product_variants(product_id);

-- Product SKUs (stock keeping units)
CREATE TABLE product_skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  barcode VARCHAR(50),
  quantity INT DEFAULT 0,
  reserved INT DEFAULT 0,
  cost_price DECIMAL(10, 2),
  wholesale_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  CHECK (quantity >= 0),
  CHECK (reserved >= 0),
  CHECK (reserved <= quantity)
);

CREATE INDEX idx_skus_variant_id ON product_skus(variant_id);
CREATE INDEX idx_skus_sku ON product_skus(sku);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(12, 2) NOT NULL,
  tax DECIMAL(12, 2) DEFAULT 0,
  shipping_cost DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CHECK (total_amount >= 0)
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  sku_id UUID NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (sku_id) REFERENCES product_skus(id),
  CHECK (quantity > 0),
  CHECK (unit_price > 0),
  CHECK (subtotal = quantity * unit_price)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Order shipments
CREATE TABLE order_shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE,
  tracking_number VARCHAR(100),
  carrier VARCHAR(50),
  status ENUM('pending', 'in_transit', 'delivered') DEFAULT 'pending',
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Article categories
CREATE TABLE article_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Articles/Blog posts
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  featured_image VARCHAR(255),
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  category_id UUID,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (category_id) REFERENCES article_categories(id) ON SET NULL
);

CREATE INDEX idx_articles_published ON articles(published);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);

-- Product categories (M:N junction)
CREATE TABLE product_categories (
  product_id UUID NOT NULL,
  category_id UUID NOT NULL,

  PRIMARY KEY (product_id, category_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES article_categories(id) ON DELETE CASCADE
);

-- Admin users
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_admins_email ON admins(email);
```

### Key Design Decisions

- **No soft deletes**: Use status enums (active/inactive/draft)
- **Cascade DELETE**: For products → variants → SKUs
- **SET NULL**: For optional foreign keys (articles.category)
- **Constraints**: CHECK clauses for data integrity (prices > 0, stock >= reserved)
- **Precision**: DECIMAL(12, 2) for money fields
- **Indexes**: On frequently queried/filtered columns (status, created_at, email)

---

## 9. Turborepo Monorepo Setup

### Directory Structure

```
ecommerce-monorepo/
├── package.json (root)
├── turbo.json
├── pnpm-workspace.yaml
├── .env.example
├── apps/
│   └── api/
│       ├── src/
│       │   ├── modules/
│       │   ├── main.ts
│       │   └── app.module.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── nest-cli.json
├── packages/
│   ├── shared-types/
│   │   ├── src/
│   │   │   ├── dtos/
│   │   │   ├── entities/
│   │   │   └── index.ts
│   │   └── package.json
│   ├── database/
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   ├── migrations/
│   │   │   └── typeorm.config.ts
│   │   └── package.json
│   └── utils/
│       ├── src/
│       │   ├── validators/
│       │   ├── helpers/
│       │   └── index.ts
│       └── package.json
├── docker-compose.yml
└── .gitignore
```

### Root package.json

```json
{
  "name": "ecommerce-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "api:dev": "turbo run dev --filter=api",
    "db:migrate": "turbo run db:migrate --filter=database",
    "db:seed": "turbo run db:seed --filter=database"
  },
  "dependencies": {},
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false,
      "dependsOn": ["db:migrate"]
    }
  }
}
```

### apps/api/package.json

```json
{
  "name": "api",
  "version": "1.0.0",
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main.js",
    "test": "jest",
    "db:migrate": "typeorm migration:run",
    "db:seed": "ts-node src/database/seeds/index.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.2.0",
    "@nestjs/core": "^10.2.0",
    "@nestjs/jwt": "^12.0.1",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.2.0",
    "@nestjs/typeorm": "^9.0.1",
    "typeorm": "^0.3.17",
    "pg": "^8.11.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "cloudinary": "^1.40.0",
    "multer": "^1.4.5",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "bcrypt": "^5.1.1"
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm run dev              # Run all apps in parallel
pnpm run api:dev          # Run only API

# Build
pnpm run build            # Build all packages
pnpm build --filter=api   # Build specific package

# Database
pnpm run db:migrate       # Run migrations
pnpm run db:seed          # Seed database

# Testing & Linting
pnpm run test
pnpm run lint
```

---

## 10. Summary: Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 20+ | JavaScript runtime |
| **Framework** | NestJS | 10.2+ | TypeScript web framework |
| **ORM** | TypeORM | 0.3.17+ | Database abstraction |
| **Database** | PostgreSQL | 14+ | Relational database |
| **Auth** | Passport.js + JWT | Latest | Authentication |
| **File Storage** | Cloudinary | V2 API | Image hosting/CDN |
| **Uploads** | Multer | 1.4+ | File upload middleware |
| **Validation** | class-validator | 0.14+ | DTO validation |
| **Monorepo** | Turborepo | 2.0+ | Workspace management |
| **Testing** | Jest/Vitest | Latest | Unit/integration tests |
| **Password Hashing** | bcrypt | 5.1+ | Secure password storage |

---

## Key Takeaways

1. **Module structure**: Feature-based (products, orders, articles, auth, media)
2. **Database design**: Normalized schema with indexes on high-cardinality columns
3. **Relations**: OneToMany for hierarchies (products→variants→SKUs), ManyToMany for flexible associations
4. **Migrations**: Auto-generate from entity changes, version control everything
5. **Auth**: JWT with roles (admin/super_admin), admin-only endpoints
6. **Files**: Cloudinary for images, multer for temporary local storage
7. **API**: DTO validation, pagination, structured responses, global error handling
8. **Monorepo**: Turborepo for workspace management, shared packages for types/entities
9. **Deployment**: Docker, environment-based config, health checks, logging

---

## Unresolved Questions

- Should product variants support dynamic attribute combinations (e.g., color + size)?
  - **Recommendation**: Use junction table variant_attributes for flexibility
- How to handle inventory reservations for pending orders?
  - **Recommendation**: Track `reserved` field in SKU, implement async inventory sync
- Should soft deletes be implemented for compliance/audits?
  - **Recommendation**: Use status enums + audit logs instead (cleaner schema)
- Multi-currency support strategy?
  - **Recommendation**: Store prices in base currency, convert on API response layer
- How to optimize product search with millions of SKUs?
  - **Recommendation**: Add full-text search index, consider Elasticsearch for scale
