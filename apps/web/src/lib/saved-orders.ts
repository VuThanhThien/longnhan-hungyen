export const SAVED_ORDERS_STORAGE_KEY = 'ln_saved_orders_v1';

export type SavedOrderLineItemV1 = {
  productId: string;
  variantLabel: string;
};

export type SavedOrderV1 = {
  orderId: string;
  orderCode: string;
  phone: string;
  savedAt: string;
  lineItems: SavedOrderLineItemV1[];
};

const MAX_STORED = 20;

export function readSavedOrders(): SavedOrderV1[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedOrderV1);
  } catch {
    return [];
  }
}

function isSavedOrderV1(v: unknown): v is SavedOrderV1 {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.orderId === 'string' &&
    typeof o.orderCode === 'string' &&
    typeof o.phone === 'string' &&
    typeof o.savedAt === 'string' &&
    Array.isArray(o.lineItems)
  );
}

export function saveOrderToDevice(order: SavedOrderV1): void {
  if (typeof window === 'undefined') return;
  const existing = readSavedOrders().filter((o) => o.orderId !== order.orderId);
  existing.unshift(order);
  window.localStorage.setItem(
    SAVED_ORDERS_STORAGE_KEY,
    JSON.stringify(existing.slice(0, MAX_STORED)),
  );
}

export function savedOrdersForProduct(
  productId: string,
  orders: SavedOrderV1[],
): SavedOrderV1[] {
  return orders.filter((o) =>
    o.lineItems.some((li) => li.productId === productId),
  );
}
