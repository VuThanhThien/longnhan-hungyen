# API Documentation

This section provides an overview of the API documentation and endpoints.

---

[[toc]]

## Swagger Documentation

We use Swagger to document all API endpoints interactively. Access the Swagger UI at:

- **Development:** http://localhost:3000/api-docs
- **Production:** Disabled for security (only accessible via internal requests)

## Base URL

All API endpoints are prefixed with `/api/v1` by default (configurable via `API_PREFIX` env var).

Example: `http://localhost:3000/api/v1/products`

## Authentication

### JWT Bearer Token

Protected endpoints require JWT authentication via `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### Endpoint Authorization

- **Public endpoints**: No authentication required (marked with `@ApiPublic()` decorator)
- **Admin endpoints**: Requires valid JWT with admin role (marked with `@ApiAuth()` decorator)
- **User endpoints**: Requires valid JWT (standard auth guard)

### Obtaining a Token

```
POST /api/v1/auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { "token": "eyJhbGc...", "refreshToken": "..." }
```

## Core Endpoints

| Module | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| Products | GET | `/v1/products` | Public | List all products |
| Products | GET | `/v1/products/:slug` | Public | Get product by slug |
| Products | POST | `/v1/products` | Admin | Create product |
| Products | PUT | `/v1/products/:id` | Admin | Update product |
| Products | DELETE | `/v1/products/:id` | Admin | Delete product |
| Orders | POST | `/v1/orders` | Public | Create order |
| Orders | GET | `/v1/orders` | User | Get user orders |
| Orders | GET | `/v1/orders/:id` | User | Get order details |
| Orders | PATCH | `/v1/orders/:id/status` | Admin | Update order status |
| Articles | GET | `/v1/articles` | Public | List articles |
| Articles | GET | `/v1/articles/:slug` | Public | Get article by slug |
| Articles | POST | `/v1/articles` | Admin | Create article |
| Articles | PUT | `/v1/articles/:id` | Admin | Update article |
| Articles | DELETE | `/v1/articles/:id` | Admin | Delete article |
| Media | POST | `/v1/media/upload` | Admin | Upload media (Cloudinary) |
| Media | GET | `/v1/media` | Admin | List uploaded media |
| Media | DELETE | `/v1/media/:id` | Admin | Delete media |
| Dashboard | GET | `/v1/dashboard/stats` | Admin | Get stats (period: today/week/month/all) |
| Health | GET | `/health` | Public | Health check |

## Error Handling

### Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

## Pagination

List endpoints support pagination with two modes:

### Offset Pagination

```
GET /v1/products?page=1&limit=20
```

### Cursor Pagination

```
GET /v1/products?cursor=abc123&limit=20
```

## Request/Response Examples

### Get Products

```bash
curl -X GET http://localhost:3000/api/v1/products
```

### Create Order (requires auth)

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": "uuid", "quantity": 2 }
    ]
  }'
```

### Upload Media (admin only)

```bash
curl -X POST http://localhost:3000/api/v1/media/upload \
  -H "Authorization: Bearer <admin_token>" \
  -F "file=@image.jpg"
```
