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
import { formatDateShort } from '@/lib/utils';
import { adminClientDelete, adminClientGet } from '@/lib/admin-client';
import type { Article } from '@longnhan/types';

const PAGE_LIMIT = 30;

export default function ArticlesPageClient() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => ({
      q: searchParams.get('q') || undefined,
      tag: searchParams.get('tag') || undefined,
      page: searchParams.get('page') || undefined,
    }),
    [searchParams],
  );

  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  const queryString = useMemo(() => {
    return buildAdminListQuery(
      {
        q: params.q,
        tag: params.tag,
        page: String(page),
      },
      { limit: PAGE_LIMIT, defaultPage: 1 },
    );
  }, [page, params.q, params.tag]);

  const {
    data: raw,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['articles', 'admin', queryString],
    queryFn: () => adminClientGet<unknown>(`/articles/admin?${queryString}`),
  });

  const { data: articles, pagination } = toPaginated<Article>(raw ?? null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      await adminClientDelete(`/articles/${id}`);
    },
    onSuccess: async () => {
      toast.success('Đã xóa bài viết');
      await queryClient.invalidateQueries({ queryKey: ['articles', 'admin'] });
    },
    onError: () => {
      toast.error('Xóa bài viết thất bại');
    },
    onSettled: () => setDeletingId(null),
  });

  const filterFields = {
    q: params.q,
    tag: params.tag,
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Bài viết" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid grid-cols-1 gap-4 md:grid-cols-4"
              method="get"
              action="/articles"
            >
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-gray-600" htmlFor="q">
                  Tìm theo tiêu đề
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
                <label className="text-sm text-gray-600" htmlFor="tag">
                  Tag
                </label>
                <input
                  id="tag"
                  name="tag"
                  type="text"
                  defaultValue={params.tag || ''}
                  placeholder="Một tag"
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                />
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
            <CardTitle className="text-base">Danh sách bài viết</CardTitle>
            <Link
              href="/articles/new"
              className="inline-flex h-9 items-center rounded-md bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700"
            >
              + Thêm bài viết
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
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>{article.title}</TableCell>
                    <TableCell>{article.status}</TableCell>
                    <TableCell>{formatDateShort(article.updatedAt)}</TableCell>
                    <TableCell className="space-x-3">
                      <Link
                        href={`/articles/${article.id}/edit`}
                        className="text-sm text-green-700 hover:underline"
                      >
                        Sửa
                      </Link>
                      <button
                        type="button"
                        className="text-sm text-red-600 hover:underline disabled:opacity-60"
                        disabled={
                          deleteMutation.isPending &&
                          deletingId === String(article.id)
                        }
                        onClick={() =>
                          deleteMutation.mutate(String(article.id))
                        }
                      >
                        {deleteMutation.isPending &&
                        deletingId === String(article.id)
                          ? 'Đang xóa…'
                          : 'Xóa'}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {articles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-gray-500"
                    >
                      Chưa có bài viết phù hợp
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
            <ListPagination
              basePath="/articles"
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
