'use client';

import { useEffect } from 'react';

import type { PublicOrderSummary } from '@/actions/order-tracking-actions';
import { saveOrderToDevice } from '@/lib/saved-orders';

export function AutoSaveOrderForReviews({
  summary,
}: {
  summary: PublicOrderSummary;
}) {
  useEffect(() => {
    if (!summary.id || !summary.phone) return;

    saveOrderToDevice({
      orderId: summary.id,
      orderCode: summary.code,
      phone: summary.phone,
      savedAt: new Date().toISOString(),
      lineItems: summary.items
        .filter((i): i is typeof i & { productId: string } =>
          Boolean(i.productId),
        )
        .map((i) => ({
          productId: i.productId,
          variantLabel: i.variantLabel ?? i.name,
        })),
    });
  }, [summary]);

  return null;
}
