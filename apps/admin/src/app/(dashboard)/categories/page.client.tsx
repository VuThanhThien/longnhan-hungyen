'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { extractErrorMessage } from '@/lib/http/extract-error-message';
import { adminQueryKeys } from '@/lib/query-keys';
import type { Category } from '@longnhan/types';

export default function CategoriesPageClient() {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: adminQueryKeys.categories.root,
    queryFn: () => adminClientGet<Category[]>('/categories/admin'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminClientDelete(`/categories/${id}`);
    },
    onSuccess: async () => {
      toast.success('Đã tắt danh mục');
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.categories.root,
      });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
    },
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
              Thêm danh mục
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
                  <TableHead className="text-right w-[1%] whitespace-nowrap">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      <Badge variant="outline" className="font-mono">
                        {cat.slug}
                      </Badge>
                    </TableCell>
                    <TableCell>{cat.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={cat.active ? 'success' : 'secondary'}>
                        {cat.active ? 'Hoạt động' : 'Tắt'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                        >
                          <Link href={`/categories/${cat.id}/edit`}>Sửa</Link>
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="cursor-pointer"
                          disabled={deleteMutation.isPending}
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
                          {deleteMutation.isPending &&
                          deleteMutation.variables === cat.id ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          {deleteMutation.isPending &&
                          deleteMutation.variables === cat.id
                            ? 'Đang xử lý…'
                            : 'Xoá'}
                        </Button>
                      </div>
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
