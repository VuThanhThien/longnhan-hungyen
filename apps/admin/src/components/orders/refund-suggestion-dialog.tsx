'use client';

import {
  TransactionMethod,
  TransactionType,
  type PaymentMethod,
} from '@longnhan/types';
import { AddTransactionDialog } from './add-transaction-dialog';

interface Props {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestedAmount: number;
  orderPaymentMethod: PaymentMethod;
}

/** Wraps AddTransactionDialog with refund-prefilled defaults. */
export function RefundSuggestionDialog({
  orderId,
  open,
  onOpenChange,
  suggestedAmount,
  orderPaymentMethod,
}: Props) {
  return (
    <AddTransactionDialog
      orderId={orderId}
      open={open}
      onOpenChange={onOpenChange}
      title="Đề xuất hoàn tiền"
      submitLabel="Ghi nhận hoàn tiền"
      defaultValues={{
        type: TransactionType.REFUND,
        method: mapPaymentMethod(orderPaymentMethod),
        amount: suggestedAmount,
      }}
    />
  );
}

function mapPaymentMethod(pm: PaymentMethod): TransactionMethod {
  return pm === 'bank_transfer'
    ? TransactionMethod.BANK_TRANSFER
    : TransactionMethod.COD;
}
