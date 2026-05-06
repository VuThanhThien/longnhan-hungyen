---
name: Cart Product Validation Before Checkout
description: Validate cart items against API before checkout to prevent ordering deleted products
type: plan
status: completed
---

# Cart Product Validation Before Checkout

## Problem

Cart stores product info locally (Zustand + localStorage). When admin deletes a product/variant from database, cart still has stale data. When user submits order:

1. API tries to load variant → returns `null` or `inactive`
2. Throw `BadRequestException("Variant X not found or inactive")`
3. Server renders generic error "An error occurred in the Server Components render..."

## Solution Overview

1. **API endpoint** — `POST /orders/validate-cart` to check if cart items exist and are active
2. **Client validation** — Call endpoint on checkout page mount
3. **Handle invalid items** — Show toast + auto-remove invalid items from cart

## Files Modified

| File                                                         | Change                           |
| ------------------------------------------------------------ | -------------------------------- |
| `apps/api/src/api/orders/dto/validate-cart.req.dto.ts`       | NEW — DTOs for validation        |
| `apps/api/src/api/orders/orders.service.ts`                  | Add `validateCartItems` method   |
| `apps/api/src/api/orders/orders.controller.ts`               | Add `validateCart` endpoint      |
| `apps/web/src/actions/order-actions.ts`                      | Add `validateCart` client action |
| `apps/web/src/components/checkout/checkout-page-content.tsx` | Call validation on mount         |

## Implementation Complete

### 1. API DTO (NEW)

- `ValidateCartReqDto` — items array with variantId + qty
- `ValidateCartResDto` — valid boolean + invalidItems array

### 2. API Service

- `validateCartItems()` — checks if variants exist, are active, have sufficient stock

### 3. API Endpoint

- `POST /orders/validate-cart` — public endpoint (throttled)

### 4. Client Action

- `validateCart(items)` — calls API, fails open gracefully

### 5. Checkout Page

- Validates cart on mount
- Auto-removes invalid items with toast notification

## Validation Flow

```
Checkout Page Mount
       ↓
Call POST /orders/validate-cart
       ↓
┌─────────────────────────────────┐
│ invalidItems = []?                  │
├─────────────────────────────────┤
│ YES → Render checkout form         │
│ NO  → Remove from cart store   │
│       Show toast.error()        │
│       Re-render              │
└─────────────────────────────────┘
```

## Testing

Run tests to verify:

- Test with active variant → passes
- Test with inactive variant → removed, toast shown
- Test with deleted variant → removed, toast shown
- Test with insufficient stock → removed, toast with stock info
