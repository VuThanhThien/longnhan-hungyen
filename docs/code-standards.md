# Code Standards & Development Guidelines

**Last Updated:** 2026-04-18

---

## Overview

This document defines coding conventions, file structure, naming patterns, and practices for the **NestJS API** in **`apps/api`**.

### Scope

| App                      | Standards doc                                                                                                                                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api`               | **This file** (`code-standards.md`)                                                                                                                                                                                                             |
| `apps/web`, `apps/admin` | **[Frontend Code Standards](./frontend-code-standards.md)** (App Router, TanStack Query, nuqs, Zustand cart on web, etc.). **Admin** UI: follow root **[DESIGN.md](../DESIGN.md)** and prefer **shadcn/ui** in `apps/admin/src/components/ui/`. |

Shared types live in **`packages/types`**. Monorepo scripts and ports: [root README](../README.md). Phase status: [Project Roadmap](./project-roadmap.md).

---

## File Naming Conventions

### TypeScript Files

**Pattern:** `camelCase.ts` for files, `PascalCase.ts` for components/classes

```
Good:
  utils.ts
  password.util.ts
  email.service.ts
  products.controller.ts
  products.service.ts
  products.module.ts
  User.entity.ts
  CreateProductDto.ts

Bad:
  PasswordUtil.ts (not a class)
  productsService.ts (should be products.service.ts)
  CONSTANTS.ts (should be constants.ts)
```

**Special Suffixes**

- `.entity.ts` — TypeORM entities
- `.dto.ts` — Data Transfer Objects
- `.service.ts` — Business logic services
- `.controller.ts` — HTTP endpoints
- `.module.ts` — NestJS modules
- `.spec.ts` — Unit tests
- `.e2e-spec.ts` — E2E tests
- `.util.ts` — Utility functions
- `.const.ts` — Constants
- `.interface.ts` — Interfaces
- `.type.ts` — Type definitions

### Directory Structure

**Feature Module**

```
src/api/products/
├── dto/                           # Data Transfer Objects
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   └── product-response.dto.ts
├── entities/
│   └── product.entity.ts
├── products.controller.ts
├── products.service.ts
├── products.module.ts
└── products.service.spec.ts
```

**Shared Utilities**

```
src/utils/
├── password.util.ts               # Password hashing/comparison
├── slug.util.ts                   # Slug generation
├── pagination.util.ts             # Pagination helpers
└── date.util.ts                   # Date formatting
```

**Shared Types**

```
src/common/
├── dto/
│   ├── pagination.dto.ts
│   ├── api-response.dto.ts
│   └── error-response.dto.ts
├── interfaces/
│   ├── paginated-response.interface.ts
│   └── user-payload.interface.ts
├── types/
│   ├── pagination.type.ts
│   └── user-role.type.ts
└── constants/
    ├── api-messages.const.ts
    ├── user-roles.const.ts
    └── http-status.const.ts
```

---

## Naming Conventions

### Variables & Functions

**Rule:** Use `camelCase`

```typescript
// Good
const firstName = 'John';
const isActive = true;
const getUserById = (id: string) => {};
const calculateTotalPrice = (items: Item[]) => {};

// Bad
const FirstName = 'John'; // Should be camelCase
const is_active = true; // Should be camelCase
const get_user_by_id = () => {}; // Should be camelCase
```

### Classes & Interfaces

**Rule:** Use `PascalCase`

```typescript
// Good
class UserService {}
interface CreateUserDto {}
enum UserRole {
  Admin,
  User,
}

// Bad
class userService {} // Should be PascalCase
interface create_user_dto {} // Should be PascalCase
```

### Constants

**Rule:** Use `camelCase` or `UPPER_SNAKE_CASE` depending on scope

```typescript
// Module-level constants
const maxRetries = 3;
const defaultPageSize = 20;

// Or (also acceptable)
const MAX_RETRIES = 3;
const DEFAULT_PAGE_SIZE = 20;

// Enum members (always PascalCase)
enum UserRole {
  Admin = 'admin',
  User = 'user',
}
```

### Boolean Variables

**Rule:** Prefix with `is`, `has`, `should`, `can`

```typescript
// Good
const isActive = true;
const hasPermission = false;
const shouldValidate = true;
const canDelete = false;

// Bad
const active = true; // Missing prefix
const permission = false; // Missing prefix
```

### Database Columns

**Rule:** Use `snake_case`

```sql
-- Good
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bad
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  firstName VARCHAR(100),  -- Should be first_name
  lastName VARCHAR(100)    -- Should be last_name
);
```

### A/HC/LC Pattern (Function Names)

Follow: `prefix? + action + highContext + lowContext?`

```typescript
// Good function names
getUser(); // action: get, context: User
getUserMessages(); // action: get, context: User + Messages
handleClickOutside(); // action: handle, context: Click + Outside
shouldDisplayMessage(); // prefix: should, action: Display, context: Message
createUserWithEmail(); // action: create, context: User + Email
removeItemFromCart(); // action: remove, context: Item + Cart

// Bad function names
user(); // Too generic
msg(); // Too abbreviated
getUserAndLoadMessages(); // Too much in one function
```

### Actions (Verb Prefixes)

| Verb       | Meaning                | Example                                 |
| ---------- | ---------------------- | --------------------------------------- |
| `get`      | Retrieve data          | `getUser()`, `getUserById()`            |
| `set`      | Set/assign value       | `setUsername()`, `setActive()`          |
| `create`   | Create new resource    | `createProduct()`, `createOrder()`      |
| `update`   | Modify existing        | `updateProduct()`, `updateUserEmail()`  |
| `delete`   | Remove permanently     | `deleteProduct()`, `deleteAccount()`    |
| `remove`   | Remove from collection | `removeFromCart()`, `removeFilter()`    |
| `fetch`    | Get from remote        | `fetchProducts()`, `fetchUserData()`    |
| `handle`   | Event handler          | `handleClick()`, `handleSubmit()`       |
| `validate` | Check validity         | `validateEmail()`, `validatePassword()` |
| `format`   | Transform format       | `formatDate()`, `formatPrice()`         |
| `parse`    | Parse input            | `parseJson()`, `parseDate()`            |

---

## TypeScript Coding Standards

### Type Annotations

**Rule:** Always annotate function return types and complex parameters

```typescript
// Good
function getUser(id: string): Promise<User> {
  return userRepository.findOne(id);
}

const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// Bad
function getUser(id) {
  // No return type
  return userRepository.findOne(id);
}

const calculateTotal = (items) => {
  // No return type
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

### Null & Undefined

**Rule:** Prefer `undefined` over `null`, use strict equality

```typescript
// Good
let user: User | undefined;
if (user != null) {
  // Checks both null and undefined
  console.log(user);
}

// Bad
let user: User | null; // Use undefined
if (user !== null) {
  // Incomplete check
  console.log(user);
}
```

### Type vs Interface

**Rule:** Use `interface` for objects, `type` for unions/complex shapes

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: UserRole;
}

type UserOrGuest = User | Guest;
type ApiResponse<T> = { data: T; status: number };

// Bad
type User = {
  // Use interface
  id: string;
  email: string;
};

interface ApiResponse {
  // Use type for generic
  data: unknown;
  status: number;
}
```

### Strict Mode

Enable in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noImplicitAny": true
  }
}
```

---

## NestJS Patterns

### Module Structure

```typescript
// products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductEntity } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // If used by other modules
})
export class ProductsModule {}
```

### Service Pattern

```typescript
// products.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return this.productRepository.findOne({ where: { id } });
  }
}
```

### Controller Pattern

```typescript
// products.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products' })
  async findAll() {
    return this.productsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create product (admin only)' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }
}
```

### DTO Pattern

```typescript
// create-product.dto.ts
import { IsString, IsNumber, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Longan Fresh' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  price: number;
}
```

### Entity Pattern

```typescript
// product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## Code Quality Rules

### Format & Linting

**Prettier Config** (`.prettierrc`)

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "plugins": ["prettier-plugin-organize-imports"]
}
```

**ESLint** — Run via `pnpm lint --fix`

### Code Review Checklist

- [ ] No `any` types (use explicit types)
- [ ] All functions have return type annotations
- [ ] No console.log in production code (use logger)
- [ ] Error handling present (try-catch or error boundaries)
- [ ] No hardcoded secrets or credentials
- [ ] No TODO comments without ticket number
- [ ] Tests written for business logic
- [ ] Documentation/comments for complex logic
- [ ] No duplication (apply DRY principle)
- [ ] Database queries optimized (no N+1)

### Commit Format

**Pattern:** `<type>(<scope>?): <subject>`

```bash
# Examples
git commit -m "feat: add user authentication"
git commit -m "fix(products): handle null product name"
git commit -m "docs: update README installation steps"
git commit -m "test: add user service unit tests"
git commit -m "refactor(auth): simplify token generation"
```

**Types**

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `test` — Tests
- `refactor` — Code refactoring
- `perf` — Performance improvement
- `chore` — Build/dependencies
- `ci` — CI/CD changes

### Branch Format

**Pattern:** `<type>.<ticket>?.<subject>`

```bash
# Examples
git checkout -b feature.1234.user-authentication
git checkout -b bugfix.auth-token-expiry
git checkout -b chore.update-dependencies
```

---

## File Size Limits

- **Code files:** Max 200 lines (consider modularizing larger files)
- **Test files:** Max 300 lines
- **Config files:** No limit (necessary for setup)
- **Markdown docs:** Max 800 lines (split into sections)

---

## Import Organization

**Order:**

1. Node.js built-ins
2. Third-party packages
3. NestJS decorators/modules
4. Local project imports

```typescript
// Good
import fs from 'fs';
import path from 'path';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import axios from 'axios';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductEntity } from './entities/product.entity';
```

**Tool:** Prettier plugin auto-sorts imports.

---

## Error Handling

### Custom Exceptions

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

export class ProductNotFoundException extends HttpException {
  constructor(productId: string) {
    super(`Product with ID ${productId} not found`, HttpStatus.NOT_FOUND);
  }
}

// Usage
if (!product) {
  throw new ProductNotFoundException(id);
}
```

### Try-Catch Pattern

```typescript
async create(dto: CreateProductDto) {
  try {
    const product = this.productRepository.create(dto);
    return await this.productRepository.save(product);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('Product name already exists');
    }
    throw new InternalServerErrorException('Failed to create product');
  }
}
```

---

## Testing Standards

### Unit Test Template

```typescript
// products.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductEntity } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockRepository;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should create a product', async () => {
    const dto = { name: 'Test', price: 50 };
    const product = { id: '1', ...dto };

    mockRepository.create.mockReturnValue(product);
    mockRepository.save.mockResolvedValue(product);

    const result = await service.create(dto);

    expect(result).toEqual(product);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
    expect(mockRepository.save).toHaveBeenCalledWith(product);
  });
});
```

### Test Coverage

Target: **70%+ coverage**

```bash
pnpm test:cov
```

---

## Documentation Standards

### JSDoc Comments

```typescript
/**
 * Calculate the total price of order items.
 *
 * @param items - Array of order items with price and quantity
 * @returns Total price rounded to 2 decimal places
 */
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Create a new user in the database.
 *
 * @throws {BadRequestException} If email already exists
 * @throws {InternalServerErrorException} If database error occurs
 */
async create(dto: CreateUserDto): Promise<User> {
  // ...
}
```

### Class Documentation

```typescript
/**
 * Service for managing products.
 * Handles CRUD operations and product queries.
 *
 * @example
 * const service = app.get(ProductsService);
 * const product = await service.findById('uuid');
 */
@Injectable()
export class ProductsService {
  // ...
}
```

---

## Performance Checklist

- [ ] Database queries use indexes
- [ ] Pagination implemented for list endpoints
- [ ] Caching used for frequently accessed data
- [ ] N+1 queries avoided (eager loading)
- [ ] File uploads handled asynchronously
- [ ] Background jobs for heavy operations
- [ ] Response compression enabled
- [ ] API rate limiting configured

---

## Security Checklist

- [ ] Passwords hashed (Argon2)
- [ ] JWT secrets strong and environment-based
- [ ] SQL injection prevented (TypeORM parameterized queries)
- [ ] XSS protected (Helmet headers)
- [ ] CSRF tokens used (if needed)
- [ ] Sensitive data not in logs
- [ ] API keys in environment variables
- [ ] CORS configured restrictively
- [ ] Input validation on all endpoints
- [ ] Rate limiting on auth endpoints

---

## Next.js & React Standards Overview

For detailed Next.js/React standards (components, data fetching, Server Actions, React Query, authentication, styling), see:

- **[Frontend Code Standards](./frontend-code-standards.md)** — Next.js 16, React 19, Server Components, Client Components, API patterns, **nuqs** (query state + [SEO / canonical URLs](https://nuqs.dev/docs/seo)), **Zustand** (guest cart + client state in `apps/web`), icons (**lucide-react**, `public/` assets; see _Icons & assets_)

---

## Related Documentation

- [Naming Cheatsheet](./code-standards.md#naming-conventions) — Detailed naming patterns
- [Root README](../README.md) — Monorepo setup, local services, core commands
- [Project Roadmap](./project-roadmap.md) — Canonical phase status
