'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminClientDelete, adminClientGet } from '@/lib/admin-client';
import type { Category } from '@longnhan/types';

export default function CategoriesPageClient() {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['categories', 'admin'],
    queryFn: () => adminClientGet<Category[]>('/categories/admin'),
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      await adminClientDelete(`/categories/${id}`);
    },
    onSuccess: async () => {
      toast.success('Đã tắt danh mục');
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: () => {
      toast.error('Thao tác thất bại (có thể còn sản phẩm gắn danh mục)');
    },
    onSettled: () => setDeletingId(null),
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Danh mục sản phẩm" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh sách danh mục</CardTitle>
            <Link
              href="/categories/new"
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-150 hover:text-destructive"
            >
              + Thêm danh mục
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-sm text-muted-foreground">
                Đang tải…
              </div>
            ) : null}
            {isError ? (
              <div className="py-8 text-sm text-destructive">
                Tải dữ liệu thất bại
              </div>
            ) : null}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {cat.slug}
                    </TableCell>
                    <TableCell>{cat.sortOrder}</TableCell>
                    <TableCell>
                      {cat.active ? (
                        <span className="text-success">Hoạt động</span>
                      ) : (
                        <span className="text-muted-foreground">Tắt</span>
                      )}
                    </TableCell>
                    <TableCell className="space-x-3">
                      <Link
                        href={`/categories/${cat.id}/edit`}
                        className="text-sm text-success hover:underline"
                      >
                        Sửa
                      </Link>
                      <button
                        type="button"
                        className="text-sm text-destructive hover:underline disabled:opacity-60"
                        disabled={
                          deleteMutation.isPending && deletingId === cat.id
                        }
                        onClick={() => {
                          if (
                            !window.confirm(
                              'Tắt danh mục này? (Không xóa vĩnh viễn nếu API dùng soft delete)',
                            )
                          ) {
                            return;
                          }
                          deleteMutation.mutate(cat.id);
                        }}
                      >
                        {deleteMutation.isPending && deletingId === cat.id
                          ? 'Đang xử lý…'
                          : 'Tắt'}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Chưa có danh mục
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
