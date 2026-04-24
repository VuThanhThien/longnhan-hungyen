import { OrderStatus } from './order';

export enum OrderStatusHistoryActor {
  SYSTEM = 'system',
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  actorType: OrderStatusHistoryActor;
  actorId: string | null;
  note: string | null;
  createdAt: string;
}

/** Public/guest-safe version: omits actorId / admin identity. */
export interface OrderStatusHistoryPublicEntry {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  actorType: OrderStatusHistoryActor;
  createdAt: string;
}
