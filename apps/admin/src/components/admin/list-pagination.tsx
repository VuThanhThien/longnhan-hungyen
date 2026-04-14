import Link from 'next/link';

interface ListPaginationProps {
  /** Pathname only, e.g. /products */
  basePath: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  };
  /** Active filters to preserve in links (page is overwritten). */
  filters: Record<string, string | undefined>;
  limit?: number;
}

export function ListPagination({
  basePath,
  pagination,
  filters,
  limit,
}: ListPaginationProps) {
  const { currentPage, totalPages, totalRecords } = pagination;

  const href = (page: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== '') sp.set(k, v);
    }
    sp.set('page', String(page));
    if (limit !== undefined) sp.set('limit', String(limit));
    const q = sp.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  if (totalPages <= 1 && totalRecords === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600">
        Trang {currentPage} / {Math.max(totalPages, 1)} — {totalRecords} mục
      </p>
      <div className="flex gap-3">
        {currentPage > 1 ? (
          <Link
            href={href(currentPage - 1)}
            className="text-sm font-medium text-green-700 hover:underline"
          >
            Trước
          </Link>
        ) : (
          <span className="text-sm text-gray-400">Trước</span>
        )}
        {totalPages > 0 && currentPage < totalPages ? (
          <Link
            href={href(currentPage + 1)}
            className="text-sm font-medium text-green-700 hover:underline"
          >
            Sau
          </Link>
        ) : (
          <span className="text-sm text-gray-400">Sau</span>
        )}
      </div>
    </div>
  );
}
