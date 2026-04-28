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
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { formatCurrency } from '@/lib/utils';
import {
  ADMIN_FILTER_ALL,
  adminProductListFilterSchema,
  type AdminProductListFilterValues,
} from '@/lib/validation/admin-list-filter-schemas';
import { adminClientDelete, adminClientGet } from '@/lib/admin-client';
import type { Product } from '@longnhan/types';

const PAGE_LIMIT = 30;

export default function ProductsPageClient() {
  const queryClient = useQueryClient();
  const router = useRouter();
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
    queryKey: adminQueryKeys.categories.root,
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
    queryKey: adminQueryKeys.products.list(queryString),
    queryFn: () => adminClientGet<unknown>(`/products/admin?${queryString}`),
  });

  const { data: products, pagination } = toPaginated<Product>(raw ?? null);

  const filterForm = useForm<AdminProductListFilterValues>({
    resolver: zodResolver(adminProductListFilterSchema),
    defaultValues: {
      q: params.q ?? '',
      category: params.category ?? ADMIN_FILTER_ALL,
    },
  });

  useEffect(() => {
    filterForm.reset({
      q: params.q ?? '',
      category: params.category ?? ADMIN_FILTER_ALL,
    });
  }, [params.q, params.category, filterForm]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminClientDelete(`/products/${id}`);
    },
    onSuccess: async () => {
      toast.success('Đã xóa sản phẩm');
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.products.root,
      });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
    },
  });

  const filterFields = {
    q: params.q,
    category: params.category,
  };

  const hasActiveFilters = Boolean(params.q) || Boolean(params.category);

  function applyFilters(values: AdminProductListFilterValues) {
    const next = new URLSearchParams();
    const q = values.q.trim();
    if (q) next.set('q', q);
    if (values.category && values.category !== ADMIN_FILTER_ALL) {
      next.set('category', values.category);
    }
    next.set('page', '1');
    const qs = next.toString();
    router.push(qs ? `/products?${qs}` : '/products');
  }

  function clearFilters() {
    filterForm.reset({
      q: '',
      category: ADMIN_FILTER_ALL,
    });
    router.push('/products');
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Sản phẩm" />
      <main className="flex flex-1 flex-col space-y-6 overflow-y-auto p-4 lg:p-6">
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
                      <FormLabel>Tìm theo tên</FormLabel>
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tất cả" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ADMIN_FILTER_ALL}>
                            Tất cả
                          </SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.slug}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      disabled={filterForm.formState.isSubmitting}
                    >
                      {filterForm.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Lọc
                    </Button>
                  </div>
                </FormItem>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh sách sản phẩm</CardTitle>
            <Link
              href="/products/new"
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-150 hover:text-destructive"
            >
              + Thêm sản phẩm
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
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead className="w-[1%] whitespace-nowrap text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const rowDeleting =
                    deleteMutation.isPending &&
                    deleteMutation.variables === String(product.id);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        {product.categoryBrief?.name ?? product.category}
                      </TableCell>
                      <TableCell>{formatCurrency(product.basePrice)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={product.active ? 'success' : 'secondary'}
                        >
                          {product.active ? 'active' : 'inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.variants.length}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                          >
                            <Link href={`/products/${product.id}/edit`}>
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
                                  'Xóa vĩnh viễn sản phẩm này? Hành động không hoàn tác.',
                                )
                              ) {
                                return;
                              }
                              deleteMutation.mutate(String(product.id));
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
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
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
