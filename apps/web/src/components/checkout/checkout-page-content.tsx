'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { submitOrder } from '@/actions/order-actions';
import { CheckoutCustomerForm } from '@/components/checkout/checkout-customer-form';
import { CheckoutOrderSummary } from '@/components/checkout/checkout-order-summary';
import { SHIPPING_FLAT_VND } from '@/lib/constants';
import {
  orderItemsSchema,
  type OrderFormValues,
} from '@/lib/validation/order/order-schemas';
import { useCartStore } from '@/services/cart/cart-store';

function cartSubtotal(lines: { quantity: number; unitPriceVnd: number }[]) {
  return lines.reduce((sum, l) => sum + l.quantity * l.unitPriceVnd, 0);
}

export function CheckoutPageContent() {
  const lines = useCartStore((s) => s.lines);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subtotalVnd = cartSubtotal(lines);
  const shippingVnd = lines.length > 0 ? SHIPPING_FLAT_VND : 0;
  const grandTotalVnd = subtotalVnd + shippingVnd;

  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8 text-(--brand-forest) md:py-12">
        <h1 className="text-2xl font-semibold md:text-3xl">Thanh toán</h1>
        <p className="mt-4 text-(--brand-forest-muted)">
          Giỏ hàng đang trống.{' '}
          <Link
            href="/products"
            className="font-medium text-(--brand-leaf) underline underline-offset-2 hover:text-(--brand-forest)"
          >
            Xem sản phẩm
          </Link>
        </p>
      </section>
    );
  }

  const onSubmit = (values: OrderFormValues) => {
    setSubmitError(null);

    const items = lines.map((l) => ({
      variantId: l.variantId,
      qty: l.quantity,
    }));
    const parsedItems = orderItemsSchema.safeParse(items);
    if (!parsedItems.success) {
      setSubmitError('Giỏ hàng không hợp lệ, vui lòng kiểm tra lại.');
      return;
    }

    const fd = new FormData();
    fd.set('customerName', values.customerName);
    fd.set('phone', values.phone);
    if (values.email) fd.set('email', values.email);
    fd.set('address', values.address);
    fd.set('province', values.province);
    fd.set('paymentMethod', values.paymentMethod);
    if (values.notes) fd.set('notes', values.notes);
    fd.set('items', JSON.stringify(parsedItems.data));

    startTransition(async () => {
      try {
        await submitOrder(fd);
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : 'Đặt hàng thất bại, vui lòng thử lại.',
        );
      }
    });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 text-(--brand-forest) md:py-12">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <CheckoutCustomerForm
          onSubmit={onSubmit}
          isPending={isPending}
          submitError={submitError}
          totalAmountVnd={grandTotalVnd}
        />
        <CheckoutOrderSummary />
      </div>
    </section>
  );
}
