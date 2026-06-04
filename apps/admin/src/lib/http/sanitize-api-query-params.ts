export type ApiQueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

/** Drops blank strings so optional API query fields are omitted instead of sent as `key=`. */
export function sanitizeApiQueryParams(
  params?: ApiQueryParams,
): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;

  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') continue;
      out[key] = trimmed;
      continue;
    }
    out[key] = value;
  }

  return Object.keys(out).length > 0 ? out : undefined;
}
