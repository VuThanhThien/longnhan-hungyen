import { CheckoutPageContent } from '@/components/checkout/checkout-page-content';
import { buildSeoMetadata } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: 'Thanh toán',
  description:
    'Hoàn tất đơn hàng long nhãn Hưng Yên — thanh toán an toàn tại nhanhunguyen.com.',
  canonicalPath: '/checkout',
  robots: { index: false, follow: false },
});

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
