'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryForm } from '@/components/categories/category-form';
import type { CategoryFormValues } from '@/components/categories/category-form.constant';
import { adminClientGet, adminClientPut } from '@/lib/admin-client';
import type { Category } from '@longnhan/types';

export default function CategoryEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['categories', 'admin'],
    queryFn: () => adminClientGet<Category[]>('/categories/admin'),
    enabled: Boolean(id),
  });

  const category = id ? categories.find((c) => c.id === id) : undefined;

  const mutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      if (!id) throw new Error('Missing id');
      await adminClientPut(`/categories/${id}`, {
        name: values.name,
        slug: values.slug,
        sortOrder: values.sortOrder,
        active: values.active,
      });
    },
    onSuccess: async () => {
      toast.success('Đã cập nhật danh mục');
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.push('/categories');
      router.refresh();
    },
    onError: () => {
      toast.error('Cập nhật thất bại');
    },
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title={category ? `Sửa: ${category.name}` : 'Sửa danh mục'} />
      <main className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="text-sm text-gray-500">Đang tải…</div>
        ) : null}
        {isError ? (
          <div className="text-sm text-red-600">Không tải được danh sách</div>
        ) : null}
        {!isLoading && id && !category ? (
          <div className="text-sm text-red-600">Không tìm thấy danh mục</div>
        ) : null}
        {category ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cập nhật danh mục</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryForm
                key={category.id}
                initial={category}
                submitLabel="Lưu thay đổi"
                isSubmitting={mutation.isPending}
                onSubmit={(v) => mutation.mutateAsync(v)}
              />
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
