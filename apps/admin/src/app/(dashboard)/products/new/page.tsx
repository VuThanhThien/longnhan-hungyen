import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '@/components/products/product-form';
import { adminFetch } from '@/lib/admin-api-client';
import { parseProductPayload } from '@/lib/admin-form-parsers';

export default function ProductCreatePage() {
  async function createProductAction(formData: FormData) {
    'use server';
    const payload = parseProductPayload(formData);
    await adminFetch('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    redirect('/products');
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Tạo sản phẩm" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm action={createProductAction} submitLabel="Tạo sản phẩm" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
