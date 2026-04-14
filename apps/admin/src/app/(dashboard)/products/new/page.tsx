'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '@/components/products/product-form';
import {
  onProductsAdminDone,
  useCreateProductMutation,
} from '../_shared/use-admin-product-mutations';

export default function ProductCreatePage() {
  const router = useRouter();

  const mutation = useCreateProductMutation({
    onDone: () => onProductsAdminDone(router),
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Tạo sản phẩm" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              onSubmit={(formData) => mutation.mutateAsync(formData)}
              isSubmitting={mutation.isPending}
              submitLabel="Tạo sản phẩm"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
