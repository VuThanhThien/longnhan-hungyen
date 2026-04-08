/**
 * Build URLSearchParams for admin list pages (filters + pagination).
 * Omits empty strings; always sets page (default 1) and limit when provided.
 */
export function buildAdminListQuery(
  entries: Record<string, string | undefined>,
  options?: { limit?: number; defaultPage?: number },
): string {
  const sp = new URLSearchParams();
  const limit = options?.limit;
  const defaultPage = options?.defaultPage ?? 1;

  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined || value === '') continue;
    sp.set(key, value);
  }

  if (!sp.has('page')) {
    sp.set('page', String(defaultPage));
  }
  if (limit !== undefined && !sp.has('limit')) {
    sp.set('limit', String(limit));
  }

  return sp.toString();
}
