import { notFound, redirect } from 'next/navigation';
import type { Product } from '@longnhan/types';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '@/components/products/product-form';
import { adminFetch } from '@/lib/admin-api-client';
import { parseProductPayload } from '@/lib/admin-form-parsers';

interface ProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params;
  const product = await adminFetch<Product>(`/products/admin/${id}`).catch(() => null);
  if (!product) notFound();

  async function updateProductAction(formData: FormData) {
    'use server';
    const payload = parseProductPayload(formData);
    await adminFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    redirect('/products');
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title={`Sửa: ${product.name}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cập nhật sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm initialProduct={product} action={updateProductAction} submitLabel="Lưu thay đổi" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
