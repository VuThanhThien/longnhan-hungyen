export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
  FEE = 'fee',
}

export enum TransactionMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  OTHER = 'other',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  VOIDED = 'voided',
}

export enum TransactionDirection {
  IN = 'in',
  OUT = 'out',
}

export interface Transaction {
  id: string;
  orderId: string;
  type: TransactionType;
  method: TransactionMethod | null;
  amount: number;
  direction: TransactionDirection;
  status: TransactionStatus;
  referenceNo: string | null;
  referenceNote: string | null;
  occurredAt: string;
  createdByAdminId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  orderId: string;
  type: TransactionType;
  method?: TransactionMethod | null;
  amount: number;
  direction: TransactionDirection;
  status?: TransactionStatus;
  referenceNo?: string | null;
  referenceNote?: string | null;
  occurredAt: string;
}
