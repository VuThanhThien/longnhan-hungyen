import { CartPageContent } from '@/components/cart/cart-page-content';
import { buildSeoMetadata } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: 'Giỏ hàng',
  description: 'Giỏ hàng của bạn tại Long Nhãn Hưng Yên — nhanhunguyen.com.',
  canonicalPath: '/cart',
  robots: { index: false, follow: false },
});

export default function CartPage() {
  return <CartPageContent />;
}
