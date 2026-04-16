'use client';

import { useMemo, useState, useEffect } from 'react';
import { TiptapHtmlEditor } from '@/components/articles/tiptap-html-editor';
import { MediaUrlPicker } from '@/components/media/media-url-picker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { ProductFormProps, VariantDraft } from './product-form.interface';
import {
  productFormSchema,
  type ProductFormValues,
} from './product-form.constant';
import { coerceToHtml } from './product-form.utils';

export function ProductForm({
  initialProduct,
  submitLabel,
  onSubmit,
  isSubmitting,
  showVariants = true,
  formId,
  hideSubmitButton = false,
}: ProductFormProps) {
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    initialProduct?.featuredImageUrl || '',
  );
  const [descriptionHtml, setDescriptionHtml] = useState(
    initialProduct?.descriptionHtml || '',
  );
  const initialSummary =
    initialProduct?.summary || initialProduct?.description || '';
  const [summaryHtml, setSummaryHtml] = useState(
    initialSummary ? coerceToHtml(initialSummary) : '',
  );
  const [variants, setVariants] = useState<VariantDraft[] | null>(() => {
    if (!showVariants) return null;
    return (
      initialProduct?.variants?.map((variant) => ({
        label: variant.label,
        price: variant.price,
        stock: variant.stock,
        weightG: variant.weightG || undefined,
        skuCode: variant.skuCode || undefined,
        sortOrder: variant.sortOrder,
        active: variant.active,
      })) || [{ label: '', price: 0, stock: 0, sortOrder: 0, active: true }]
    );
  });

  const variantsJson = useMemo(
    () => (variants ? JSON.stringify(variants) : ''),
    [variants],
  );

  function updateVariant(
    index: number,
    key: keyof VariantDraft,
    value: string | number | boolean,
  ) {
    setVariants((prev) => {
      if (!prev) return prev;
      return prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      );
    });
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: yupResolver(
      productFormSchema,
    ) as unknown as Resolver<ProductFormValues>,
    defaultValues: {
      name: initialProduct?.name || '',
      category: initialProduct?.category || 'long-nhan',
      basePrice: initialProduct?.basePrice || 0,
      videoUrl: initialProduct?.videoUrl || '',
      active: initialProduct?.active ?? true,
      images: initialProduct?.images?.join('\n') || '',
      summary: summaryHtml,
      descriptionHtml: descriptionHtml,
      featuredImageUrl: featuredImageUrl,
      variantsJson: showVariants ? variantsJson : undefined,
    },
  });

  useEffect(() => {
    setValue('featuredImageUrl', featuredImageUrl, { shouldValidate: true });
  }, [featuredImageUrl, setValue]);

  useEffect(() => {
    setValue('summary', summaryHtml, { shouldValidate: true });
  }, [summaryHtml, setValue]);

  useEffect(() => {
    setValue('descriptionHtml', descriptionHtml, { shouldValidate: true });
  }, [descriptionHtml, setValue]);

  useEffect(() => {
    if (!showVariants) return;
    setValue('variantsJson', variantsJson, { shouldValidate: true });
  }, [showVariants, variantsJson, setValue]);

  return (
    <form
      id={formId}
      className="space-y-4"
      onSubmit={handleSubmit(async (data: ProductFormValues) => {
        const formData = new FormData();
        formData.set('name', data.name);
        formData.set('category', data.category);
        formData.set('basePrice', String(data.basePrice ?? 0));
        if (data.videoUrl) formData.set('videoUrl', data.videoUrl);
        if (data.active) formData.set('active', 'on');
        formData.set('summary', data.summary || '');
        formData.set('descriptionHtml', data.descriptionHtml || '');
        formData.set('featuredImageUrl', data.featuredImageUrl || '');
        formData.set('images', data.images || '');
        if (showVariants) {
          formData.set('variantsJson', data.variantsJson || '[]');
        }
        await onSubmit(formData);
      })}
    >
      <Accordion
        type="single"
        collapsible
        defaultValue="basic"
        className="w-full rounded-lg border border-gray-200 px-4"
      >
        <AccordionItem value="basic">
          <AccordionTrigger>Thông tin cơ bản</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Tên sản phẩm</label>
                <input
                  {...register('name')}
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                  required
                />
                {errors.name?.message ? (
                  <p className="text-xs text-red-600">{errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Danh mục</label>
                <input
                  {...register('category')}
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                  required
                />
                {errors.category?.message ? (
                  <p className="text-xs text-red-600">
                    {errors.category.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Giá gốc</label>
                <input
                  type="number"
                  min={0}
                  {...register('basePrice', { valueAsNumber: true })}
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                  required
                />
                {errors.basePrice?.message ? (
                  <p className="text-xs text-red-600">
                    {errors.basePrice.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Video URL</label>
                <input
                  {...register('videoUrl')}
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                />
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" {...register('active')} />
                  Kích hoạt sản phẩm
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="summary">
          <AccordionTrigger>Tóm tắt</AccordionTrigger>
          <AccordionContent className="space-y-1">
            <label className="sr-only">Tóm tắt</label>
            <TiptapHtmlEditor
              value={summaryHtml}
              onChange={setSummaryHtml}
              placeholder="Viết tóm tắt ngắn…"
              className="rounded-md border border-gray-200"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="description">
          <AccordionTrigger>Mô tả chi tiết</AccordionTrigger>
          <AccordionContent className="space-y-1">
            <label className="sr-only">Mô tả</label>
            <TiptapHtmlEditor
              value={descriptionHtml}
              onChange={setDescriptionHtml}
              placeholder="Viết mô tả chi tiết… Gõ / để chèn khối."
              className="rounded-md border border-gray-200"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="media">
          <AccordionTrigger>Ảnh & thư viện</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Ảnh đại diện</label>
              <MediaUrlPicker
                value={featuredImageUrl}
                onChange={setFeaturedImageUrl}
                folder="products"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">
                Danh sách ảnh (mỗi dòng 1 URL)
              </label>
              <textarea
                rows={4}
                {...register('images')}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {showVariants && variants ? (
          <AccordionItem value="variants">
            <AccordionTrigger>Biến thể sản phẩm</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="rounded-md border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50"
                  onClick={() =>
                    setVariants((prev) => [
                      ...(prev ?? []),
                      {
                        label: '',
                        price: 0,
                        stock: 0,
                        sortOrder: (prev ?? []).length,
                        active: true,
                      },
                    ])
                  }
                >
                  + Thêm biến thể
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-6">
                <div className="col-span-2">Tên biến thể</div>
                <div className="col-span-1">Giá</div>
                <div className="col-span-1">Tồn kho</div>
                <div className="col-span-1">Khối lượng(g)</div>
                <div className="col-span-1">SKU</div>
              </div>

              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-6"
                >
                  <input
                    placeholder="Tên biến thể"
                    value={variant.label}
                    onChange={(event) =>
                      updateVariant(index, 'label', event.target.value)
                    }
                    className="h-9 rounded-md border border-gray-200 px-2 text-sm md:col-span-2"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Giá"
                    value={variant.price}
                    onChange={(event) =>
                      updateVariant(
                        index,
                        'price',
                        Number(event.target.value || 0),
                      )
                    }
                    className="h-9 rounded-md border border-gray-200 px-2 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Tồn kho"
                    value={variant.stock}
                    onChange={(event) =>
                      updateVariant(
                        index,
                        'stock',
                        Number(event.target.value || 0),
                      )
                    }
                    className="h-9 rounded-md border border-gray-200 px-2 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Khối lượng(g)"
                    value={variant.weightG || ''}
                    onChange={(event) =>
                      updateVariant(
                        index,
                        'weightG',
                        Number(event.target.value || 0),
                      )
                    }
                    className="h-9 rounded-md border border-gray-200 px-2 text-sm"
                  />
                  <input
                    placeholder="SKU"
                    value={variant.skuCode || ''}
                    onChange={(event) =>
                      updateVariant(index, 'skuCode', event.target.value)
                    }
                    className="h-9 rounded-md border border-gray-200 px-2 text-sm"
                  />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ) : null}
      </Accordion>

      <input type="hidden" {...register('featuredImageUrl')} />
      <input type="hidden" {...register('summary')} />
      <input type="hidden" {...register('descriptionHtml')} />
      {showVariants ? (
        <input type="hidden" {...register('variantsJson')} />
      ) : null}

      {hideSubmitButton ? null : (
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Đang lưu…' : submitLabel}
        </button>
      )}
    </form>
  );
}
