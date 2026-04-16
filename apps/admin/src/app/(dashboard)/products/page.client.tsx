'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { ListPagination } from '@/components/admin/list-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { buildAdminListQuery } from '@/lib/admin-list-query';
import { toPaginated } from '@/lib/admin-data';
import { formatCurrency } from '@/lib/utils';
import { adminClientDelete, adminClientGet } from '@/lib/admin-client';
import type { Product } from '@longnhan/types';

const PAGE_LIMIT = 30;

export default function ProductsPageClient() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => ({
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      page: searchParams.get('page') || undefined,
    }),
    [searchParams],
  );

  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  const queryString = useMemo(() => {
    return buildAdminListQuery(
      {
        q: params.q,
        category: params.category,
        page: String(page),
      },
      { limit: PAGE_LIMIT, defaultPage: 1 },
    );
  }, [page, params.category, params.q]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'admin'],
    queryFn: () =>
      adminClientGet<Array<{ id: string; slug: string; name: string }>>(
        '/categories/admin',
      ),
  });

  const {
    data: raw,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['products', 'admin', queryString],
    queryFn: () => adminClientGet<unknown>(`/products/admin?${queryString}`),
  });

  const { data: products, pagination } = toPaginated<Product>(raw ?? null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      await adminClientDelete(`/products/${id}`);
    },
    onSuccess: async () => {
      toast.success('Đã xóa sản phẩm');
      await queryClient.invalidateQueries({ queryKey: ['products', 'admin'] });
    },
    onError: () => {
      toast.error('Xóa sản phẩm thất bại');
    },
    onSettled: () => setDeletingId(null),
  });

  const filterFields = {
    q: params.q,
    category: params.category,
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Sản phẩm" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid grid-cols-1 gap-4 md:grid-cols-4"
              method="get"
              action="/products"
            >
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-gray-600" htmlFor="q">
                  Tìm theo tên
                </label>
                <input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={params.q || ''}
                  placeholder="Nhập từ khóa…"
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600" htmlFor="category">
                  Danh mục
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue={params.category || ''}
                  className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  <option value="">Tất cả</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="inline-flex h-10 items-center rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700"
                >
                  Lọc
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh sách sản phẩm</CardTitle>
            <Link
              href="/products/new"
              className="inline-flex h-9 items-center rounded-md bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700"
            >
              + Thêm sản phẩm
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-sm text-gray-500">Đang tải…</div>
            ) : null}
            {isError ? (
              <div className="py-8 text-sm text-red-600">
                Tải dữ liệu thất bại
              </div>
            ) : null}
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
                    <TableCell>
                      {product.categoryBrief?.name ?? product.category}
                    </TableCell>
                    <TableCell>{formatCurrency(product.basePrice)}</TableCell>
                    <TableCell>
                      {product.active ? 'active' : 'inactive'}
                    </TableCell>
                    <TableCell>{product.variants.length}</TableCell>
                    <TableCell className="space-x-3">
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="text-sm text-green-700 hover:underline"
                      >
                        Sửa
                      </Link>
                      <button
                        type="button"
                        className="text-sm text-red-600 hover:underline disabled:opacity-60"
                        disabled={
                          deleteMutation.isPending &&
                          deletingId === String(product.id)
                        }
                        onClick={() =>
                          deleteMutation.mutate(String(product.id))
                        }
                      >
                        {deleteMutation.isPending &&
                        deletingId === String(product.id)
                          ? 'Đang xóa…'
                          : 'Xóa'}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-gray-500"
                    >
                      Chưa có sản phẩm phù hợp
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
            <ListPagination
              basePath="/products"
              pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalRecords: pagination.totalRecords,
              }}
              filters={filterFields}
              limit={PAGE_LIMIT}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
