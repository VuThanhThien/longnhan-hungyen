'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@longnhan/types';
import { fetchApi } from '@/lib/api-client';
import { captureApiFetchError } from '@/lib/observability/api-fetch-sentry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductPdpTabsProps {
  product: Product;
}

type TabId = 'description' | 'extra' | 'reviews';

type ProductReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

type ProductReviewsList = {
  ratingAvg: number;
  ratingCount: number;
  items: ProductReview[];
};

function buildSpecRows(
  product: Product,
): Array<{ key: string; value: string }> {
  const weights = product.variants
    .map((variant) => variant.weightG ?? variant.weightGrams ?? 0)
    .filter((weight) => weight > 0);
  const minWeight = weights.length > 0 ? Math.min(...weights) : 0;
  const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;

  return [
    { key: 'Danh mục', value: product.category || 'Long nhãn' },
    {
      key: 'Khối lượng',
      value:
        Number.isFinite(minWeight) &&
        Number.isFinite(maxWeight) &&
        minWeight > 0
          ? minWeight === maxWeight
            ? `${minWeight}g`
            : `${minWeight}g - ${maxWeight}g`
          : 'Nhiều quy cách',
    },
  ];
}

export default function ProductPdpTabs({ product }: ProductPdpTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('description');
  const rows = useMemo(() => buildSpecRows(product), [product]);

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-wrap border-b border-gray-200">
        {[
          { id: 'description' as const, label: 'Mô tả' },
          { id: 'extra' as const, label: 'Thông tin bổ sung' },
          { id: 'reviews' as const, label: 'Đánh giá' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'text-green-800 border-b-2 border-green-700'
                : 'text-gray-500 hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {activeTab === 'description'
          ? product.descriptionHtml && (
              <div
                className="article-body tiptap ProseMirror simple-editor max-w-none"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            )
          : null}

        {activeTab === 'extra' ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <th className="w-44 bg-gray-50 px-4 py-3 text-left">
                      {row.key}
                    </th>
                    <td className="px-4 py-3 text-gray-700">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {activeTab === 'reviews' ? (
          <ProductReviewsTab productId={product.id as string} />
        ) : null}
      </div>
    </section>
  );
}

function ProductReviewsTab({ productId }: { productId: string }) {
  const [data, setData] = useState<ProductReviewsList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<ProductReviewsList>(
        `/products/${encodeURIComponent(productId)}/reviews`,
      );
      setData(res);
    } catch (error) {
      captureApiFetchError(error, {
        route: '/products/pdp',
        section: 'reviews_list',
        extra: { productId },
      });
      setError('Không thể tải đánh giá.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function submitReview() {
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      await fetchApi(`/products/${encodeURIComponent(productId)}/reviews`, {
        method: 'POST',
        body: {
          orderId: orderId.trim(),
          phone: phone.trim(),
          rating,
          comment: comment.trim() ? comment.trim() : undefined,
        },
      });
      setSubmitMessage('Cảm ơn bạn! Đánh giá đang chờ duyệt.');
      setComment('');
      await load();
    } catch (error) {
      captureApiFetchError(error, {
        route: '/products/pdp',
        section: 'reviews_submit',
        extra: { productId },
      });
      setSubmitMessage(
        'Không thể gửi đánh giá. Hãy kiểm tra đơn đã giao, đúng số điện thoại, và đơn có chứa sản phẩm.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">Đánh giá</div>
            <div className="mt-1 text-sm text-gray-600">
              {loading ? (
                'Đang tải…'
              ) : error ? (
                error
              ) : (
                <>
                  <span className="font-semibold text-gray-900">
                    {(data?.ratingAvg ?? 0).toFixed(1)}
                  </span>
                  <span className="text-gray-600"> / 5</span> ·{' '}
                  <span className="font-semibold text-gray-900">
                    {data?.ratingCount ?? 0}
                  </span>{' '}
                  <span className="text-gray-600">đánh giá</span>
                </>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={load}
          >
            Làm mới
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <div className="text-sm font-semibold text-gray-900">Viết đánh giá</div>
        <p className="mt-1 text-sm text-gray-600">
          Chỉ áp dụng cho đơn hàng đã giao thành công.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="review-order-id">
              Order ID
            </label>
            <Input
              id="review-order-id"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="UUID đơn hàng"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="review-phone">
              Số điện thoại
            </label>
            <Input
              id="review-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0901234567"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="review-rating">
              Sao (1–5)
            </label>
            <Input
              id="review-rating"
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="review-comment">
              Nhận xét (tuỳ chọn)
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              placeholder="Chia sẻ trải nghiệm của bạn…"
              maxLength={2000}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" disabled={submitting} onClick={submitReview}>
            {submitting ? 'Đang gửi…' : 'Gửi đánh giá'}
          </Button>
          {submitMessage ? (
            <p className="text-sm text-gray-600">{submitMessage}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {(data?.items ?? []).length === 0 && !loading ? (
          <p className="text-sm text-gray-600">Chưa có đánh giá nào.</p>
        ) : null}
        {(data?.items ?? []).map((r) => (
          <div key={r.id} className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-gray-900">
                {r.rating} / 5
              </div>
              <div className="text-xs text-gray-500">
                {new Date(r.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
            {r.comment ? (
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                {r.comment}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
