export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export interface OrderItem {
  id: number;
  orderId: number;
  variantId: number;
  variantName: string;
  variantSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  note: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CreateOrderDto {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  note?: string;
  paymentMethod: PaymentMethod;
  items: {
    variantId: number;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusDto {
  orderStatus: OrderStatus;
}

export interface UpdatePaymentStatusDto {
  paymentStatus: PaymentStatus;
}
