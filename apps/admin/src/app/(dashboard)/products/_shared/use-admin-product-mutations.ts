import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseProductPayload } from '@/lib/admin-form-parsers';
import {
  adminClientDelete,
  adminClientPost,
  adminClientPut,
} from '@/lib/admin-client';
import {
  PRODUCTS_ADMIN_PATHS,
  PRODUCTS_ADMIN_TOAST,
} from './products.constant';
import { adminProductQueryKey } from './products.utils';

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

export function useUpdateProductMutation(
  productId?: string,
  options?: { onDone?: () => void },
) {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!productId) {
        throw new Error('Missing productId');
      }
      const payload = parseProductPayload(formData);
      // Variants are updated via a separate UI block / endpoint.
      // Avoid accidental variant wipe/replacement when saving product fields.
      delete (payload as { variants?: unknown }).variants;
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

export function useUpdateProductVariantSkuMutation(productId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { variantId: string; skuCode: string }) => {
      if (!productId) {
        throw new Error('Missing productId');
      }
      await adminClientPut(
        `/products/${productId}/variants/${input.variantId}`,
        {
          skuCode: input.skuCode,
        },
      );
    },
    onSuccess: async () => {
      toast.success(PRODUCTS_ADMIN_TOAST.updateVariantSuccess);
      if (productId) {
        await queryClient.invalidateQueries({
          queryKey: adminProductQueryKey(productId),
        });
      }
    },
    onError: () => {
      toast.error(PRODUCTS_ADMIN_TOAST.updateVariantError);
    },
  });
}

export function useCreateProductVariantMutation(productId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      label: string;
      price: number;
      stock: number;
      weightG?: number | null;
      skuCode?: string;
      sortOrder?: number;
      active?: boolean;
    }) => {
      if (!productId) {
        throw new Error('Missing productId');
      }
      await adminClientPost(`/products/${productId}/variants`, input);
    },
    onSuccess: async () => {
      toast.success(PRODUCTS_ADMIN_TOAST.createVariantSuccess);
      if (productId) {
        await queryClient.invalidateQueries({
          queryKey: adminProductQueryKey(productId),
        });
      }
    },
    onError: () => {
      toast.error(PRODUCTS_ADMIN_TOAST.createVariantError);
    },
  });
}

export function useUpdateProductVariantMutation(productId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      variantId: string;
      patch: {
        label?: string;
        price?: number;
        stock?: number;
        weightG?: number | null;
        skuCode?: string;
        sortOrder?: number;
        active?: boolean;
      };
    }) => {
      if (!productId) {
        throw new Error('Missing productId');
      }
      await adminClientPut(
        `/products/${productId}/variants/${input.variantId}`,
        input.patch,
      );
    },
    onSuccess: async () => {
      toast.success(PRODUCTS_ADMIN_TOAST.updateVariantSuccess);
      if (productId) {
        await queryClient.invalidateQueries({
          queryKey: adminProductQueryKey(productId),
        });
      }
    },
    onError: () => {
      toast.error(PRODUCTS_ADMIN_TOAST.updateVariantError);
    },
  });
}

export function useDeleteProductVariantMutation(productId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variantId: string) => {
      if (!productId) {
        throw new Error('Missing productId');
      }
      await adminClientDelete(`/products/${productId}/variants/${variantId}`);
    },
    onSuccess: async () => {
      toast.success(PRODUCTS_ADMIN_TOAST.deleteVariantSuccess);
      if (productId) {
        await queryClient.invalidateQueries({
          queryKey: adminProductQueryKey(productId),
        });
      }
    },
    onError: () => {
      toast.error(PRODUCTS_ADMIN_TOAST.deleteVariantError);
    },
  });
}

export function onProductsAdminDone(router: {
  push: (href: string) => void;
  refresh: () => void;
}) {
  router.push(PRODUCTS_ADMIN_PATHS.list);
  router.refresh();
}
