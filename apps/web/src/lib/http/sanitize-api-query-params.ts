export type ApiQueryParams = Record<string, string | number | undefined>;

/** Drops empty strings so optional API query fields are omitted instead of sent as `q=`. */
export function sanitizeApiQueryParams(
  params?: ApiQueryParams,
): ApiQueryParams | undefined {
  if (!params) return undefined;

  const out: ApiQueryParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
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
