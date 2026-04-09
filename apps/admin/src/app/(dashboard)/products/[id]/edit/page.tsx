'use client';

import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '@/components/products/product-form';
import { ProductVariantSkuForm } from '@/components/products/product-variant-sku-form';
import { ProductVariantsCrudForm } from '@/components/products/product-variants-crud-form';
import type { AdminIdParams } from '../../_shared/products.interface';
import { useAdminProduct } from '../../_shared/use-admin-product';
import { onProductsAdminDone, useUpdateProductMutation } from '../../_shared/use-admin-product-mutations';

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams<AdminIdParams>();
  const id = params?.id;

  const { data: product, isLoading, isError } = useAdminProduct(id);
  const mutation = useUpdateProductMutation(id, { onDone: () => onProductsAdminDone(router) });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title={product ? `Sửa: ${product.name}` : 'Sửa sản phẩm'} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cập nhật sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="py-8 text-sm text-gray-500">Đang tải…</div> : null}
              {isError ? <div className="py-8 text-sm text-red-600">Không tìm thấy sản phẩm</div> : null}
              {product ? (
                <ProductForm
                  initialProduct={product}
                  onSubmit={(formData) => mutation.mutateAsync(formData)}
                  isSubmitting={mutation.isPending}
                  submitLabel="Lưu thay đổi"
                  showVariants={false}
                />
              ) : null}
            </CardContent>
          </Card>

          {product ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cập nhật SKU biến thể</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductVariantSkuForm productId={product.id} variants={product.variants} />
              </CardContent>
            </Card>
          ) : null}

          {product ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Biến thể (CRUD)</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductVariantsCrudForm productId={product.id} variants={product.variants} />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
    </div>
  );
}
