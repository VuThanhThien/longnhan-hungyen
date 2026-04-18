'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductForm } from '@/components/products/product-form';
import { ProductVariantSkuForm } from '@/components/products/product-variant-sku-form';
import { ProductVariantsCrudForm } from '@/components/products/product-variants-crud-form';
import type { AdminIdParams } from '../../_shared/products.interface';
import { useAdminProduct } from '../../_shared/use-admin-product';
import {
  onProductsAdminDone,
  useUpdateProductMutation,
} from '../../_shared/use-admin-product-mutations';

const PRODUCT_EDIT_FORM_ID = 'product-edit-main-form';

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams<AdminIdParams>();
  const id = params?.id;
  const [tab, setTab] = useState('info');

  const { data: product, isLoading, isError } = useAdminProduct(id);
  const mutation = useUpdateProductMutation(id, {
    onDone: () => onProductsAdminDone(router),
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title={product ? `Sửa: ${product.name}` : 'Sửa sản phẩm'} />
      <main className="flex min-h-0 flex-1 flex-col">
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Đang tải…</div>
        ) : null}
        {isError ? (
          <div className="p-6 text-sm text-destructive">
            Không tìm thấy sản phẩm
          </div>
        ) : null}

        {product ? (
          <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-popover px-6 py-3">
              <TabsList className="max-w-full flex-wrap justify-start gap-1 h-auto min-h-10 py-1">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="sku">SKU biến thể</TabsTrigger>
                <TabsTrigger value="variants">Biến thể</TabsTrigger>
              </TabsList>
              <div className="flex shrink-0 items-center gap-2">
                {tab === 'info' ? (
                  <Button
                    type="submit"
                    form={PRODUCT_EDIT_FORM_ID}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
                  </Button>
                ) : (
                  <p className="max-w-xs text-right text-xs text-muted-foreground sm:max-w-none">
                    Lưu từng dòng trong nội dung bên dưới.
                  </p>
                )}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <TabsContent value="info" className="m-0 focus-visible:ring-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Cập nhật sản phẩm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductForm
                      formId={PRODUCT_EDIT_FORM_ID}
                      hideSubmitButton
                      initialProduct={product}
                      onSubmit={(formData) => mutation.mutateAsync(formData)}
                      isSubmitting={mutation.isPending}
                      submitLabel="Lưu thay đổi"
                      showVariants={false}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sku" className="m-0 focus-visible:ring-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Cập nhật SKU biến thể
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductVariantSkuForm
                      productId={product.id}
                      variants={product.variants}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="variants"
                className="m-0 focus-visible:ring-0"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Biến thể (CRUD)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductVariantsCrudForm
                      productId={product.id}
                      variants={product.variants}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        ) : null}
      </main>
    </div>
  );
}
