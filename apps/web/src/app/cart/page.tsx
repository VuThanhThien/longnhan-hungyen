import type { Metadata } from 'next';
import { CartPageContent } from '@/components/cart/cart-page-content';

export const metadata: Metadata = {
  title: 'Giỏ hàng',
  description: 'Giỏ hàng — Long Nhãn Tống Trân',
};

export default function CartPage() {
  return <CartPageContent />;
}
