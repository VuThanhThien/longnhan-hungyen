export interface OffsetPaginationMeta {
  limit: number;
  currentPage: number;
  nextPage?: number;
  previousPage?: number;
  totalRecords: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: OffsetPaginationMeta;
}
