import type { Metadata } from 'next';

import { CheckoutPageContent } from '@/components/checkout/checkout-page-content';

export const metadata: Metadata = {
  title: 'Thanh toán',
  description: 'Thanh toán — Long Nhãn Tống Trân',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
