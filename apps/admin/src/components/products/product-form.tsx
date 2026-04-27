'use client';

import { useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { Category } from '@longnhan/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2 } from 'lucide-react';
import { useFieldArray, useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import { adminClientGet } from '@/lib/admin-client';
import { adminQueryKeys } from '@/lib/query-keys';
import { extractErrorMessage } from '@/lib/http/extract-error-message';
import { TiptapHtmlEditor } from '@/components/articles/tiptap-html-editor';
import { MediaUrlPicker } from '@/components/media/media-url-picker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
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
  const { data: categories = [] } = useQuery({
    queryKey: adminQueryKeys.categories.root,
    queryFn: () => adminClientGet<Category[]>('/categories/admin'),
  });

  const initialSummary =
    initialProduct?.summary || initialProduct?.description || '';
  const initialVariants = useMemo<VariantDraft[] | undefined>(() => {
    if (!showVariants) return undefined;
    const fromProduct =
      initialProduct?.variants?.map((variant) => ({
        label: variant.label,
        price: variant.price,
        stock: variant.stock,
        weightG: variant.weightG || undefined,
        skuCode: variant.skuCode || undefined,
        sortOrder: variant.sortOrder,
        active: variant.active,
      })) ?? [];
    return fromProduct.length > 0
      ? fromProduct
      : [{ label: '', price: 0, stock: 0, sortOrder: 0, active: true }];
  }, [initialProduct?.variants, showVariants]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(
      productFormSchema,
    ) as unknown as Resolver<ProductFormValues>,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      name: initialProduct?.name ?? '',
      categoryId: initialProduct?.categoryBrief?.id ?? '',
      basePrice: initialProduct?.basePrice ?? 0,
      videoUrl: initialProduct?.videoUrl ?? '',
      active: initialProduct?.active ?? true,
      images: initialProduct?.images?.join('\n') ?? '',
      summary: initialSummary ? coerceToHtml(initialSummary) : '',
      descriptionHtml: initialProduct?.descriptionHtml ?? '',
      featuredImageUrl: initialProduct?.featuredImageUrl ?? '',
      variants: showVariants ? initialVariants : [],
    },
  });

  const variantsArray = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      await onSubmit(formData);
    },
    onSuccess: () => {
      toast.success('Đã lưu sản phẩm');
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
    },
  });

  const submitting = isSubmitting ?? submitMutation.isPending;

  return (
    <Form {...form}>
      <form
        id={formId}
        className="space-y-5"
        onSubmit={form.handleSubmit(async (data) => {
          const formData = new FormData();
          formData.set('name', data.name);
          formData.set('categoryId', data.categoryId);
          formData.set('basePrice', String(data.basePrice ?? 0));
          if (data.videoUrl) formData.set('videoUrl', data.videoUrl);
          if (data.active) formData.set('active', 'on');
          formData.set('summary', data.summary || '');
          formData.set('descriptionHtml', data.descriptionHtml || '');
          formData.set('featuredImageUrl', data.featuredImageUrl || '');
          formData.set('images', data.images || '');
          if (showVariants) {
            const variants = (data.variants ?? []).map((v, i) => ({
              ...v,
              sortOrder: i,
            }));
            formData.set('variantsJson', JSON.stringify(variants));
          }
          await submitMutation.mutateAsync(formData);
        })}
      >
        <Accordion
          type="single"
          collapsible
          defaultValue="basic"
          className="w-full rounded-lg border border-border px-4"
        >
          <AccordionItem value="basic">
            <AccordionTrigger>Thông tin cơ bản</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="VD: Long nhãn Hưng Yên"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="— Chọn danh mục —" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                              {!c.active ? ' (đã tắt)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá gốc</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1000}
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? 0
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL (tuỳ chọn)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://…" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex h-9 mt-2 items-end">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(next: boolean | 'indeterminate') =>
                            field.onChange(Boolean(next))
                          }
                        />
                        <span>Kích hoạt sản phẩm</span>
                      </label>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="summary">
            <AccordionTrigger>Tóm tắt</AccordionTrigger>
            <AccordionContent className="space-y-1">
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Tóm tắt</FormLabel>
                    <FormControl>
                      <TiptapHtmlEditor
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        placeholder="Viết tóm tắt ngắn…"
                        className="rounded-md border border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="description">
            <AccordionTrigger>Mô tả chi tiết</AccordionTrigger>
            <AccordionContent className="space-y-1">
              <FormField
                control={form.control}
                name="descriptionHtml"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Mô tả</FormLabel>
                    <FormControl>
                      <TiptapHtmlEditor
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        placeholder="Viết mô tả chi tiết… Gõ / để chèn khối."
                        className="rounded-md border border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="media">
            <AccordionTrigger>Ảnh & thư viện</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <FormField
                control={form.control}
                name="featuredImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh đại diện</FormLabel>
                    <FormControl>
                      <MediaUrlPicker
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        folder="products"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh sách ảnh (mỗi dòng 1 URL)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="https://...\nhttps://..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {showVariants ? (
            <AccordionItem value="variants">
              <AccordionTrigger>Biến thể sản phẩm</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      variantsArray.append({
                        label: '',
                        price: 0,
                        stock: 0,
                        weightG: undefined,
                        skuCode: undefined,
                        sortOrder: variantsArray.fields.length,
                        active: true,
                      })
                    }
                  >
                    + Thêm biến thể
                  </Button>
                </div>

                <div className="overflow-hidden rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[26%]">Tên biến thể</TableHead>
                        <TableHead className="w-[14%]">Giá</TableHead>
                        <TableHead className="w-[12%]">Tồn kho</TableHead>
                        <TableHead className="w-[14%]">
                          Khối lượng (g)
                        </TableHead>
                        <TableHead className="w-[20%]">SKU</TableHead>
                        <TableHead className="w-[8%]">Active</TableHead>
                        <TableHead className="w-[1%] whitespace-nowrap text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variantsArray.fields.map((row, index) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`variants.${index}.label`}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Tên biến thể"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`variants.${index}.price`}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step={1000}
                                      value={field.value ?? 0}
                                      onChange={(e) =>
                                        field.onChange(
                                          e.target.value === ''
                                            ? 0
                                            : Number(e.target.value),
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`variants.${index}.stock`}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step={1}
                                      value={field.value ?? 0}
                                      onChange={(e) =>
                                        field.onChange(
                                          e.target.value === ''
                                            ? 0
                                            : Number(e.target.value),
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`variants.${index}.weightG`}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step={1}
                                      value={field.value ?? ''}
                                      onChange={(e) =>
                                        field.onChange(
                                          e.target.value === ''
                                            ? undefined
                                            : Number(e.target.value),
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`variants.${index}.skuCode`}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value ?? ''}
                                      placeholder="SKU"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`variants.${index}.active`}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <label className="inline-flex h-9 items-center gap-2 text-sm">
                                    <Checkbox
                                      checked={Boolean(field.value)}
                                      onCheckedChange={(
                                        next: boolean | 'indeterminate',
                                      ) => field.onChange(Boolean(next))}
                                    />
                                    <span className="sr-only">Active</span>
                                  </label>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => variantsArray.remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Xóa</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {variantsArray.fields.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-6 text-center text-sm text-muted-foreground"
                          >
                            Chưa có biến thể
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ) : null}
        </Accordion>

        {hideSubmitButton ? null : (
          <Button type="submit" disabled={submitting} className="w-fit">
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {submitting ? 'Đang lưu…' : submitLabel}
          </Button>
        )}
      </form>
    </Form>
  );
}
