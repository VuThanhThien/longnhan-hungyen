'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Star } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

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
import LoadingSpinner from '@/components/ui/loading-spinner';
import { StarRatingInput } from '@/components/ui/star-rating-input';
import { Textarea } from '@/components/ui/textarea';
import { fetchApi } from '@/lib/api-client';
import { extractErrorMessage } from '@/lib/http/extract-error-message';
import { captureApiFetchError } from '@/lib/observability/api-fetch-sentry';
import { queryKeys } from '@/lib/query-keys';
import {
  readSavedOrders,
  savedOrdersForProduct,
  type SavedOrderV1,
} from '@/lib/saved-orders';
import {
  productReviewFormSchema,
  type ProductReviewFormValues,
} from '@/lib/validation/product-review-form-schema';
import { cn } from '@/lib/utils';

type ProductReviewItem = {
  id: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerLabel: string;
  variantLabel: string;
};

type ProductReviewsList = {
  ratingAvg: number;
  ratingCount: number;
  items: ProductReviewItem[];
};

const productReviewDefaultValues: ProductReviewFormValues = {
  savedOrderCode: '',
  manualOrderCode: '',
  phone: '',
  rating: 5,
  isAnonymous: false,
  displayName: '',
  comment: '',
};

function ReviewStarsRow({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} trên 5 sao`}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            'size-4',
            rating >= s
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-gray-200',
          )}
          strokeWidth={rating >= s ? 0 : 1.25}
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function ProductReviewsSection({
  productId,
  productName,
}: {
  productId: string;
  /** Optional: richer empty-state / helper copy */
  productName?: string;
}) {
  const queryClient = useQueryClient();
  const reviewsQueryKey = queryKeys.products.reviews(productId);

  const {
    data,
    error: queryError,
    isPending: reviewsLoading,
    isFetching: reviewsFetching,
    refetch,
  } = useQuery({
    queryKey: reviewsQueryKey,
    queryFn: async () =>
      fetchApi<ProductReviewsList>(
        `/products/${encodeURIComponent(productId)}/reviews`,
      ),
  });

  const reviewsError = queryError != null ? 'Không thể tải đánh giá.' : null;

  /** Empty until after mount so SSR + first client paint match (localStorage differs). */
  const [savedOrders, setSavedOrders] = useState<SavedOrderV1[]>([]);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    setSavedOrders(readSavedOrders());
  }, []);

  const ordersForProduct = useMemo(
    () => savedOrdersForProduct(productId, savedOrders),
    [productId, savedOrders],
  );

  const form = useForm<ProductReviewFormValues>({
    resolver: zodResolver(productReviewFormSchema),
    defaultValues: productReviewDefaultValues,
  });

  const isAnonymous = useWatch({
    control: form.control,
    name: 'isAnonymous',
  });

  useEffect(() => {
    form.reset(productReviewDefaultValues);
    // Intentionally only when the PDP product changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form.reset is stable; avoid re-running on unrelated formState updates
  }, [productId]);

  useEffect(() => {
    if (queryError) {
      captureApiFetchError(queryError, {
        route: '/products/pdp',
        section: 'reviews_list',
        extra: { productId },
      });
    }
  }, [queryError, productId]);

  const submitMutation = useMutation({
    mutationFn: async (values: ProductReviewFormValues) => {
      const orderCode =
        values.savedOrderCode.trim() || values.manualOrderCode.trim();
      await fetchApi(`/products/${encodeURIComponent(productId)}/reviews`, {
        method: 'POST',
        body: {
          orderCode,
          phone: values.phone.trim(),
          rating: values.rating,
          isAnonymous: values.isAnonymous,
          ...(values.isAnonymous
            ? {}
            : { displayName: values.displayName.trim().slice(0, 80) }),
          comment: values.comment.trim() ? values.comment.trim() : undefined,
        },
      });
    },
    onSuccess: async () => {
      setSubmitMessage('Cảm ơn bạn! Đánh giá đang chờ duyệt.');
      form.setValue('comment', '');
      await queryClient.invalidateQueries({ queryKey: reviewsQueryKey });
    },
    onError: (err) => {
      captureApiFetchError(err, {
        route: '/products/pdp',
        section: 'reviews_submit',
        extra: { productId },
      });
      const fromApi = extractErrorMessage(err).trim();
      setSubmitMessage(
        fromApi ||
          'Không thể gửi đánh giá. Hãy kiểm tra đơn đã giao, đúng số điện thoại, và đơn có chứa sản phẩm.',
      );
    },
  });

  const submitting = submitMutation.isPending;

  function onReviewSubmit(values: ProductReviewFormValues) {
    setSubmitMessage(null);
    submitMutation.mutate(values);
  }

  return (
    <section
      id="reviews"
      className="mt-10 scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
      aria-labelledby="reviews-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2
            id="reviews-heading"
            className="text-lg font-semibold text-gray-900"
          >
            Đánh giá từ khách hàng
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            {reviewsLoading ? (
              <>
                <Loader2
                  className="size-4 shrink-0 animate-spin text-gray-400"
                  aria-hidden
                />
                <span>Đang tải…</span>
              </>
            ) : reviewsError ? (
              reviewsError
            ) : (
              <>
                <span className="font-semibold text-gray-900">
                  {(data?.ratingAvg ?? 0).toFixed(1)}
                </span>
                <span className="text-gray-600"> / 5</span>
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="font-semibold text-gray-900">
                  {data?.ratingCount ?? 0}
                </span>{' '}
                <span className="text-gray-600">đánh giá</span>
                {reviewsFetching ? (
                  <Loader2
                    className="size-3.5 shrink-0 animate-spin text-gray-400"
                    aria-label="Đang cập nhật"
                  />
                ) : null}
              </>
            )}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={reviewsFetching}
          onClick={() => void refetch()}
        >
          {reviewsFetching ? (
            <>
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              Đang tải…
            </>
          ) : (
            'Làm mới'
          )}
        </Button>
      </div>

      <div
        className={cn(
          'mt-6 space-y-4',
          reviewsFetching && !reviewsLoading && 'opacity-80 transition-opacity',
        )}
        aria-busy={reviewsLoading}
      >
        {reviewsLoading ? (
          <LoadingSpinner size="md" label="Đang tải đánh giá…" />
        ) : reviewsError ? (
          <p className="text-sm text-gray-600">
            {reviewsError} Bạn có thể nhấn &quot;Làm mới&quot; để thử lại.
          </p>
        ) : (
          <>
            {(data?.items ?? []).length === 0 ? (
              <p className="text-sm text-gray-600">Chưa có đánh giá nào.</p>
            ) : null}
            {(data?.items ?? []).map((r) => (
              <article
                key={r.id}
                className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <ReviewStarsRow rating={r.rating} />
                    <p className="text-sm font-medium text-gray-900">
                      {r.reviewerLabel}
                    </p>
                    <p className="text-xs text-gray-500">
                      Loại:{' '}
                      <span className="font-medium text-gray-700">
                        {r.variantLabel}
                      </span>
                    </p>
                  </div>
                  <time
                    className="text-xs text-gray-500"
                    dateTime={r.createdAt}
                  >
                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </time>
                </div>
                {r.comment ? (
                  <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {r.comment}
                  </p>
                ) : null}
              </article>
            ))}
          </>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 p-4 md:p-5">
        <h3 className="text-base font-semibold text-gray-900">Viết đánh giá</h3>
        <p className="mt-1 text-sm text-gray-600">
          Chỉ áp dụng khi đơn đã được giao thành công. Thông tin hiển thị công
          khai sẽ được che một phần để bảo vệ quyền riêng tư.
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onReviewSubmit)}
            className="mt-5 space-y-4"
          >
            {ordersForProduct.length > 0 ? (
              <FormField
                control={form.control}
                name="savedOrderCode"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Đơn hàng</FormLabel>
                    <FormControl>
                      <select
                        ref={field.ref}
                        name={field.name}
                        onBlur={field.onBlur}
                        className={cn(
                          'flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          fieldState.error &&
                            'border-destructive focus-visible:ring-destructive/40',
                        )}
                        value={field.value}
                        onChange={(e) => {
                          const code = e.target.value;
                          field.onChange(code);
                          form.setValue('manualOrderCode', '');
                          const o = ordersForProduct.find(
                            (x) => x.orderCode === code,
                          );
                          if (o) form.setValue('phone', o.phone);
                        }}
                      >
                        <option value="">Chọn đơn hàng</option>
                        {ordersForProduct.map((o) => (
                          <option key={o.orderId} value={o.orderCode}>
                            {o.orderCode}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <p className="text-sm text-gray-600">
                Chưa có đơn đã lưu
                {productName ? ` cho ${productName}` : ' cho sản phẩm này'}. Sau
                khi đặt hàng, dùng nút{' '}
                <span className="font-medium">Lưu đơn để đánh giá sau</span> ở
                trang đặt hàng thành công, hoặc nhập mã đơn bên dưới. Trang{' '}
                <span className="font-medium">Lịch sử đơn</span> sẽ bổ sung sau.
              </p>
            )}

            <details className="text-sm">
              <summary className="cursor-pointer text-gray-500 underline-offset-2 hover:underline">
                Không thấy đơn đã lưu? Nhập mã đơn hàng
              </summary>
              <div className="mt-2 space-y-1.5">
                <FormField
                  control={form.control}
                  name="manualOrderCode"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Mã đơn hàng</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: LN-260329-1234"
                          autoComplete="off"
                          className={cn(
                            fieldState.error &&
                              'border-destructive focus-visible:ring-destructive/40',
                          )}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            if (e.target.value.trim()) {
                              form.setValue('savedOrderCode', '');
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </details>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại đặt hàng</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: 0901234567"
                        inputMode="tel"
                        autoComplete="tel"
                        className={cn(
                          fieldState.error &&
                            'border-destructive focus-visible:ring-destructive/40',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <span
                      id="review-stars-label"
                      className="text-sm font-medium leading-none"
                    >
                      Sao
                    </span>
                    <FormControl>
                      <div>
                        <StarRatingInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={submitting}
                          labelledBy="review-stars-label"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-0 gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="mt-1 size-4 rounded border-gray-300"
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        void form.trigger('displayName');
                      }}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    Bình luận ẩn danh
                  </FormLabel>
                </FormItem>
              )}
            />

            {!isAnonymous ? (
              <FormField
                control={form.control}
                name="displayName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Tên hiển thị</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tên hiển thị trên đánh giá"
                        maxLength={80}
                        autoComplete="name"
                        className={cn(
                          fieldState.error &&
                            'border-destructive focus-visible:ring-destructive/40',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="comment"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Nhận xét (tuỳ chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Chia sẻ trải nghiệm của bạn…"
                      maxLength={2000}
                      className={cn(
                        fieldState.error &&
                          'border-destructive focus-visible:ring-destructive/40',
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2
                      className="size-4 shrink-0 animate-spin"
                      aria-hidden
                    />
                    Đang gửi…
                  </>
                ) : (
                  'Gửi đánh giá'
                )}
              </Button>
              {submitMessage ? (
                <p className="text-sm text-gray-600">{submitMessage}</p>
              ) : null}
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
