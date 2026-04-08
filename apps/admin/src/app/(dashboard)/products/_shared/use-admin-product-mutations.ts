import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseProductPayload } from '@/lib/admin-form-parsers';
import { adminClientPost, adminClientPut } from '@/lib/admin-client';
import { PRODUCTS_ADMIN_PATHS, PRODUCTS_ADMIN_TOAST } from './products.constant';

export function useCreateProductMutation(options: { onDone: () => void }) {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const payload = parseProductPayload(formData);
      await adminClientPost('/products', payload);
    },
    onSuccess: () => {
      toast.success(PRODUCTS_ADMIN_TOAST.createSuccess);
      options.onDone();
    },
    onError: () => {
      toast.error(PRODUCTS_ADMIN_TOAST.createError);
    },
  });
}

export function useUpdateProductMutation(productId?: string, options?: { onDone?: () => void }) {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!productId) {
        throw new Error('Missing productId');
      }
      const payload = parseProductPayload(formData);
      await adminClientPut(`/products/${productId}`, payload);
    },
    onSuccess: () => {
      toast.success(PRODUCTS_ADMIN_TOAST.updateSuccess);
      options?.onDone?.();
    },
    onError: () => {
      toast.error(PRODUCTS_ADMIN_TOAST.updateError);
    },
  });
}

export function onProductsAdminDone(router: { push: (href: string) => void; refresh: () => void }) {
  router.push(PRODUCTS_ADMIN_PATHS.list);
  router.refresh();
}

