import { SITE_URL } from '@/lib/constants';
import { buildBreadcrumbSchema } from '@/lib/structured-data';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

function toAbsoluteUrl(input: string, baseUrl: string) {
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input;
  }

  if (input.startsWith('/')) {
    return `${baseUrl}${input}`;
  }

  return `${baseUrl}/${input}`;
}

export function buildBreadcrumb({
  items,
  currentUrl,
  baseUrl = SITE_URL,
}: {
  items: BreadcrumbItem[];
  currentUrl?: string;
  baseUrl?: string;
}) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const lastIndex = Math.max(0, items.length - 1);

  return {
    items,
    schema: (() => {
      const resolved = items.map((item, index) => {
        const isLast = index === lastIndex;
        return {
          name: item.label,
          url: item.url ?? (isLast ? currentUrl : undefined),
        };
      });

      if (resolved.some((item) => !item.url)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[breadcrumb] Missing url for non-current item; skipping JSON-LD schema.',
            resolved,
          );
        }
        return null;
      }

      return buildBreadcrumbSchema(
        resolved.map((item) => ({
          name: item.name,
          url: toAbsoluteUrl(item.url!, normalizedBaseUrl),
        })),
      );
    })(),
  };
}
