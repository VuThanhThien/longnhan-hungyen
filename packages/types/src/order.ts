/** Mirrors `OrderStatus` in `apps/api/.../order.entity.ts` (Postgres enum values). */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
}

/** Mirrors `PaymentStatus` in `apps/api/.../order.entity.ts`. */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export interface OrderItem {
  id: string;
  variantSnapshot: Record<string, unknown>;
  qty: number;
  unitPrice: number;
  subtotal: number;
  // Backward-compatible aliases for old consumers.
  orderId?: string;
  variantId?: string;
  variantName?: string;
  variantSku?: string;
  quantity?: number;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  province: string | null;
  notes: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  // Backward-compatible aliases for old consumers.
  orderCode?: string;
  customerPhone?: string;
  customerEmail?: string | null;
  shippingAddress?: string;
  shippingCity?: string;
  shippingProvince?: string;
  note?: string | null;
  totalAmount?: number;
}

export interface CreateOrderDto {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  province?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  items: {
    variantId: string;
    qty: number;
  }[];
}

export interface UpdateOrderStatusDto {
  orderStatus: OrderStatus;
}

export interface UpdatePaymentStatusDto {
  paymentStatus: PaymentStatus;
}
