import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminFetch } from '@/lib/admin-api-client';
import { toList } from '@/lib/admin-data';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@longnhan/types';

async function deleteProductAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  if (!id) return;

  await adminFetch(`/products/${id}`, { method: 'DELETE' });
  revalidatePath('/products');
}

export default async function ProductsPage() {
  const rawProducts = await adminFetch<unknown>('/products/admin?page=1&limit=50').catch(() => []);
  const products = toList<Product>(rawProducts);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Sản phẩm" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh sách sản phẩm ({products.length})</CardTitle>
            <Link href="/products/new" className="inline-flex h-9 items-center rounded-md bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700">
              + Thêm sản phẩm
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatCurrency(product.basePrice)}</TableCell>
                    <TableCell>{product.active ? 'active' : 'inactive'}</TableCell>
                    <TableCell>{product.variants.length}</TableCell>
                    <TableCell className="space-x-3">
                      <Link href={`/products/${product.id}/edit`} className="text-sm text-green-700 hover:underline">
                        Sửa
                      </Link>
                      <form action={deleteProductAction} className="inline">
                        <input type="hidden" name="id" value={product.id} />
                        <button className="text-sm text-red-600 hover:underline">Xóa</button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                      Chưa có sản phẩm
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
