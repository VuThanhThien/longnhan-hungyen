'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

import { submitOrder } from '@/actions/order-actions';
import { CheckoutCustomerForm } from '@/components/checkout/checkout-customer-form';
import { CheckoutOrderSummary } from '@/components/checkout/checkout-order-summary';
import { CheckoutVoucherInput } from '@/components/checkout/checkout-voucher-input';
import { SepayRedirectForm } from '@/components/checkout/sepay-redirect-form';
import { SHIPPING_FLAT_VND } from '@/lib/constants';
import {
  orderItemsSchema,
  type OrderFormValues,
} from '@/lib/validation/order/order-schemas';
import { useCartStore } from '@/services/cart/cart-store';

function cartSubtotal(lines: { quantity: number; unitPriceVnd: number }[]) {
  return lines.reduce((sum, l) => sum + l.quantity * l.unitPriceVnd, 0);
}

type AppliedVoucher = {
  code: string;
  discountAmount: number;
};

export function CheckoutPageContent() {
  const lines = useCartStore((s) => s.lines);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(
    null,
  );
  const [sepayRedirect, setSepayRedirect] = useState<{
    url: string;
    fields: Record<string, string>;
  } | null>(null);

  const subtotalVnd = cartSubtotal(lines);
  const shippingVnd = lines.length > 0 ? SHIPPING_FLAT_VND : 0;
  const orderTotalBeforeDiscount = subtotalVnd + shippingVnd;
  const discountVnd = appliedVoucher?.discountAmount ?? 0;

  // Clear voucher when cart changes — discount may no longer be valid.
  useEffect(() => {
    queueMicrotask(() => setAppliedVoucher(null));
  }, [subtotalVnd]);

  const handlePhoneChange = useCallback((next: string) => {
    setPhone((prev) => {
      if (prev === next) return prev;
      // Phone changed — drop applied voucher (per-phone rules may differ).
      setAppliedVoucher(null);
      return next;
    });
  }, []);

  const handleVoucherApplied = useCallback(
    (discountAmount: number, code: string) => {
      setAppliedVoucher({ code, discountAmount });
    },
    [],
  );

  const handleVoucherRemoved = useCallback(() => {
    setAppliedVoucher(null);
  }, []);

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
    setSepayRedirect(null);

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
    if (appliedVoucher) fd.set('voucherCode', appliedVoucher.code);

    startTransition(async () => {
      try {
        const res = await submitOrder(fd);
        if (res.kind === 'sepay') {
          setSepayRedirect(res.sepay);
          return;
        }
        router.push(`/order-success?code=${encodeURIComponent(res.code)}`);
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
      {sepayRedirect ? (
        <SepayRedirectForm
          url={sepayRedirect.url}
          fields={sepayRedirect.fields}
        />
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <CheckoutCustomerForm
          onSubmit={onSubmit}
          isPending={isPending}
          submitError={submitError}
          onPhoneChange={handlePhoneChange}
          voucherSlot={
            <CheckoutVoucherInput
              orderTotal={orderTotalBeforeDiscount}
              phone={phone}
              appliedVoucher={appliedVoucher}
              onVoucherApplied={handleVoucherApplied}
              onVoucherRemoved={handleVoucherRemoved}
            />
          }
        />
        <CheckoutOrderSummary
          discountAmount={discountVnd}
          voucherCode={appliedVoucher?.code ?? null}
        />
      </div>
    </section>
  );
}
