'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil } from 'lucide-react';
import {
  TransactionDirection,
  TransactionStatus,
  type Transaction,
} from '@longnhan/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ordersApi } from '@/features/orders/api/orders-api';
import { adminQueryKeys } from '@/lib/query-keys';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AddTransactionDialog } from './add-transaction-dialog';
import { EditTransactionDialog } from './edit-transaction-dialog';

interface Props {
  orderId: string;
}

export function OrderTransactionsTable({ orderId }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.orders.transactions(orderId),
    queryFn: () => ordersApi.getTransactions(orderId),
  });
  const rows = data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rows.length} giao dịch</p>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Thêm giao dịch
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thời điểm</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead>Hướng</TableHead>
            <TableHead className="text-right">Số tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Tham chiếu</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-sm text-muted-foreground"
              >
                Đang tải…
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-sm text-muted-foreground"
              >
                Chưa có giao dịch
              </TableCell>
            </TableRow>
          ) : (
            rows.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{formatDate(tx.occurredAt)}</TableCell>
                <TableCell>{tx.type}</TableCell>
                <TableCell>{tx.method ?? '-'}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      tx.direction === TransactionDirection.IN
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {tx.direction}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {tx.direction === TransactionDirection.OUT ? '-' : ''}
                  {formatCurrency(tx.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {tx.referenceNo ?? '-'}
                  {tx.referenceNote ? (
                    <span className="block text-muted-foreground">
                      {tx.referenceNote}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditTx(tx)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AddTransactionDialog
        orderId={orderId}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
      {editTx ? (
        <EditTransactionDialog
          orderId={orderId}
          transaction={editTx}
          open={Boolean(editTx)}
          onOpenChange={(o) => !o && setEditTx(null)}
        />
      ) : null}
    </div>
  );
}

function statusVariant(s: TransactionStatus) {
  switch (s) {
    case TransactionStatus.COMPLETED:
      return 'default' as const;
    case TransactionStatus.PENDING:
      return 'secondary' as const;
    case TransactionStatus.FAILED:
    case TransactionStatus.VOIDED:
      return 'destructive' as const;
  }
}
