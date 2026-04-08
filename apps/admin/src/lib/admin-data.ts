/** Matches Nest `OffsetPaginationDto` JSON shape from the API */
export interface ApiOffsetPagination {
  limit: number;
  currentPage: number;
  nextPage?: number;
  previousPage?: number;
  totalRecords: number;
  totalPages: number;
}

export interface OffsetPaginatedData<T> {
  data: T[];
  pagination?: ApiOffsetPagination;
}

export function toList<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === 'object' && Array.isArray((value as OffsetPaginatedData<T>).data)) {
    return (value as OffsetPaginatedData<T>).data;
  }

  return [];
}

export function toPaginated<T>(value: unknown): {
  data: T[];
  pagination: ApiOffsetPagination;
} {
  if (
    value &&
    typeof value === 'object' &&
    'pagination' in value &&
    'data' in value &&
    Array.isArray((value as OffsetPaginatedData<T>).data) &&
    (value as OffsetPaginatedData<T>).pagination
  ) {
    const v = value as OffsetPaginatedData<T>;
    return { data: v.data, pagination: v.pagination! };
  }

  const data = toList<T>(value);
  return {
    data,
    pagination: {
      limit: data.length || 1,
      currentPage: 1,
      totalRecords: data.length,
      totalPages: data.length === 0 ? 0 : 1,
    },
  };
}

export function toOptionalStringArray(raw: FormDataEntryValue | null): string[] {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
