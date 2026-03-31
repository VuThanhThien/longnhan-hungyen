'use server';

import { redirect } from 'next/navigation';

import { apiServer } from '@/lib/api-server';

export async function submitOrder(formData: FormData): Promise<void> {
  const itemsRaw = formData.get('items');

  if (!itemsRaw) {
    throw new Error('Không có sản phẩm trong đơn hàng');
  }

  const body = {
    customerName: formData.get('customerName'),
    phone: formData.get('phone'),
    email: formData.get('email') || undefined,
    address: formData.get('address'),
    province: formData.get('province') || undefined,
    notes: formData.get('notes') || undefined,
    paymentMethod: formData.get('paymentMethod'),
    items: JSON.parse(itemsRaw as string) as { variantId: string; qty: number }[],
  };

  const { data } = await apiServer.post<{ code: string }>('/orders', body);
  redirect(`/order-success?code=${data.code}`);
}
