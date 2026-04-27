'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { adminClientDelete, adminClientGet } from '@/lib/admin-client';
import { extractErrorMessage } from '@/lib/http/extract-error-message';
import { httpClient } from '@/lib/http-client';
import { adminQueryKeys } from '@/lib/query-keys';

type ReviewStatus = 'pending' | 'published' | 'rejected';
type ReviewFilter = 'all' | ReviewStatus;

type ProductReview = {
  id: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: string;
  isAnonymous?: boolean;
  variantLabelSnapshot?: string | null;
  publicReviewerLabel?: string | null;
};

export default function ReviewsPageClient() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ReviewFilter>('all');

  const listParams = useMemo(
    () => (status === 'all' ? undefined : { status }),
    [status],
  );

  const {
    data: reviews,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: adminQueryKeys.reviews.list(status),
    queryFn: () =>
      adminClientGet<ProductReview[]>(`/reviews/admin`, listParams),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminClientDelete(`/reviews/admin/${id}`);
    },
    onSuccess: async () => {
      toast.success('Đã xóa đánh giá');
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.reviews.root,
      });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: ReviewStatus }) => {
      await httpClient.patch(`/reviews/admin/${id}`, { status: next });
    },
    onSuccess: async () => {
      toast.success('Đã cập nhật trạng thái');
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.reviews.root,
      });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
    },
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Đánh giá" />
      <main className="flex flex-1 flex-col space-y-6 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">Trạng thái</span>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ReviewFilter)}
            >
              <SelectTrigger className="h-10 w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">pending</SelectItem>
                <SelectItem value="published">published</SelectItem>
                <SelectItem value="rejected">rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              {isFetching && !isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Làm mới
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách đánh giá</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tối đa 50 mục gần nhất (theo API).
            </p>
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
                  <TableHead>Sao</TableHead>
                  <TableHead>Hiển thị</TableHead>
                  <TableHead>Quy cách</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[1%] whitespace-nowrap text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(reviews ?? []).map((r) => {
                  const rowUpdating =
                    updateStatusMutation.isPending &&
                    updateStatusMutation.variables?.id === r.id;
                  const rowDeleting =
                    deleteMutation.isPending &&
                    deleteMutation.variables === r.id;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-semibold">
                        {r.rating}/5
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {r.publicReviewerLabel ?? (
                          <span className="text-muted-foreground/70">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                        {r.variantLabelSnapshot ?? '—'}
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate">
                        {r.comment || (
                          <span className="text-muted-foreground/70">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="cursor-pointer"
                            disabled={
                              r.status === 'published' ||
                              updateStatusMutation.isPending
                            }
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: r.id,
                                next: 'published',
                              })
                            }
                          >
                            {rowUpdating &&
                            updateStatusMutation.variables?.next ===
                              'published' ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : null}
                            Duyệt
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                            disabled={
                              r.status === 'rejected' ||
                              updateStatusMutation.isPending
                            }
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: r.id,
                                next: 'rejected',
                              })
                            }
                          >
                            {rowUpdating &&
                            updateStatusMutation.variables?.next ===
                              'rejected' ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : null}
                            Từ chối
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="cursor-pointer"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              if (
                                !window.confirm(
                                  'Xóa vĩnh viễn đánh giá này? Hành động không hoàn tác.',
                                )
                              ) {
                                return;
                              }
                              deleteMutation.mutate(r.id);
                            }}
                          >
                            {rowDeleting ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : null}
                            Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(reviews ?? []).length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
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
