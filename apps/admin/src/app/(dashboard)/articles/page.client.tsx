'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { ListPagination } from '@/components/admin/list-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
import { extractErrorMessage } from '@/lib/http/extract-error-message';
import { adminQueryKeys } from '@/lib/query-keys';
import { formatDateShort } from '@/lib/utils';
import {
  adminArticleListFilterSchema,
  type AdminArticleListFilterValues,
} from '@/lib/validation/admin-list-filter-schemas';
import { adminClientDelete, adminClientGet } from '@/lib/admin-client';
import type { Article } from '@longnhan/types';
import { Badge } from '@/components/ui/badge';

const PAGE_LIMIT = 30;

export default function ArticlesPageClient() {
  const queryClient = useQueryClient();
  const router = useRouter();
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

  const filterForm = useForm<AdminArticleListFilterValues>({
    resolver: zodResolver(adminArticleListFilterSchema),
    defaultValues: {
      q: params.q ?? '',
      tag: params.tag ?? '',
    },
  });

  useEffect(() => {
    filterForm.reset({
      q: params.q ?? '',
      tag: params.tag ?? '',
    });
  }, [params.q, params.tag, filterForm]);

  const {
    data: raw,
    isLoading,
    isError,
  } = useQuery({
    queryKey: adminQueryKeys.articles.list(queryString),
    queryFn: () => adminClientGet<unknown>(`/articles/admin?${queryString}`),
  });

  const { data: articles, pagination } = toPaginated<Article>(raw ?? null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminClientDelete(`/articles/${id}`);
    },
    onSuccess: async () => {
      toast.success('Đã xóa bài viết');
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.articles.root,
      });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
    },
  });

  const filterFields = {
    q: params.q,
    tag: params.tag,
  };

  const hasActiveFilters = Boolean(params.q) || Boolean(params.tag);

  function applyFilters(values: AdminArticleListFilterValues) {
    const next = new URLSearchParams();
    const q = values.q.trim();
    const tag = values.tag.trim();
    if (q) next.set('q', q);
    if (tag) next.set('tag', tag);
    next.set('page', '1');
    const qs = next.toString();
    router.push(qs ? `/articles?${qs}` : '/articles');
  }

  function clearFilters() {
    filterForm.reset({
      q: '',
      tag: '',
    });
    router.push('/articles');
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Bài viết" />
      <main className="flex flex-1 flex-col space-y-6 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...filterForm}>
              <form
                className="grid grid-cols-1 gap-4 md:grid-cols-4"
                onSubmit={filterForm.handleSubmit(applyFilters)}
              >
                <FormField
                  control={filterForm.control}
                  name="q"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tìm theo tiêu đề</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="search"
                          placeholder="Nhập từ khóa…"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={filterForm.control}
                  name="tag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tag</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Một tag"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel className="invisible">Submit</FormLabel>
                  <div className="flex h-10 items-center justify-end gap-2">
                    {hasActiveFilters ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearFilters}
                      >
                        Đặt lại
                      </Button>
                    ) : null}
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={filterForm.formState.isSubmitting}
                    >
                      {filterForm.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Tìm
                    </Button>
                  </div>
                </FormItem>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh sách bài viết</CardTitle>
            <Link
              href="/articles/new"
              className="inline-flex h-9 items-center rounded-md bg-white px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-150 hover:text-destructive"
            >
              Thêm bài viết
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
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead className="w-[1%] whitespace-nowrap text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => {
                  const rowDeleting =
                    deleteMutation.isPending &&
                    deleteMutation.variables === String(article.id);
                  return (
                    <TableRow key={article.id}>
                      <TableCell>{article.title}</TableCell>
                      <TableCell>
                        {article.tags.map((tag) => (
                          <Badge variant="outline" key={tag}>
                            {tag}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{article.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatDateShort(article.updatedAt)}
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
                            <Link href={`/articles/${article.id}/edit`}>
                              Sửa
                            </Link>
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
                                  'Xóa vĩnh viễn bài viết này? Hành động không hoàn tác.',
                                )
                              ) {
                                return;
                              }
                              deleteMutation.mutate(String(article.id));
                            }}
                          >
                            {rowDeleting ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : null}
                            {rowDeleting ? 'Đang xóa…' : 'Xóa'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {articles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
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
