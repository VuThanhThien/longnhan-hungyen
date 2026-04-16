'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryForm } from '@/components/categories/category-form';
import type { CategoryFormValues } from '@/components/categories/category-form.constant';
import { adminClientPost } from '@/lib/admin-client';

export default function CategoryCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      await adminClientPost('/categories', {
        name: values.name,
        slug: values.slug,
        sortOrder: values.sortOrder,
        active: values.active,
      });
    },
    onSuccess: async () => {
      toast.success('Đã tạo danh mục');
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.push('/categories');
      router.refresh();
    },
    onError: () => {
      toast.error('Tạo danh mục thất bại (kiểm tra slug trùng)');
    },
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Tạo danh mục" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm
              submitLabel="Tạo danh mục"
              isSubmitting={mutation.isPending}
              onSubmit={(v) => mutation.mutateAsync(v)}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
