export interface OffsetPaginatedData<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export function toOptionalStringArray(raw: FormDataEntryValue | null): string[] {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
