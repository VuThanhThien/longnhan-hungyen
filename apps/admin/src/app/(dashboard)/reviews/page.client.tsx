'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminClientGet } from '@/lib/admin-client';
import { httpClient } from '@/lib/http-client';

type ReviewStatus = 'pending' | 'published' | 'rejected';

type ProductReview = {
  id: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: string;
};

export default function ReviewsPageClient() {
  const [status, setStatus] = useState<ReviewStatus>('pending');
  const query = useMemo(() => ({ status }), [status]);

  const {
    data: reviews,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['reviews-admin', query],
    queryFn: () =>
      adminClientGet<ProductReview[]>(`/reviews/admin`, { status }),
  });

  async function updateStatus(id: string, next: ReviewStatus) {
    await httpClient.patch(`/reviews/admin/${id}`, { status: next });
    await refetch();
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Đánh giá" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-gray-600" htmlFor="review-status">
              Trạng thái
            </label>
            <select
              id="review-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ReviewStatus)}
              className="h-10 rounded-md border border-gray-200 px-3 text-sm"
            >
              <option value="pending">pending</option>
              <option value="published">published</option>
              <option value="rejected">rejected</option>
            </select>
            <Button type="button" variant="outline" onClick={() => refetch()}>
              Làm mới
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách đánh giá</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-sm text-gray-500">Đang tải…</div>
            ) : null}
            {isError ? (
              <div className="py-8 text-sm text-red-600">
                Tải dữ liệu thất bại
              </div>
            ) : null}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sao</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(reviews ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold">
                      {r.rating}/5
                    </TableCell>
                    <TableCell className="max-w-[480px] truncate">
                      {r.comment || <span className="text-gray-400">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => updateStatus(r.id, 'published')}
                        disabled={r.status === 'published'}
                      >
                        Duyệt
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(r.id, 'rejected')}
                        disabled={r.status === 'rejected'}
                      >
                        Từ chối
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(reviews ?? []).length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-gray-500"
                    >
                      Không có đánh giá
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
