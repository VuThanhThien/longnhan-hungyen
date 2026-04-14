import type { Product } from '@longnhan/types';

/**
 * Strip HTML to plain text using one code path on server and client.
 * (DOMParser on the client and regex on the server produced different spacing
 * and caused React hydration mismatches in product cards.)
 */
function htmlToPlainText(html: string) {
  if (!html) return '';

  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function getProductLandingDescription(product: Product) {
  const html = product.descriptionHtml ?? null;
  if (html) return htmlToPlainText(html);
  const summary = product.summary ?? null;
  if (summary && looksLikeHtml(summary)) return htmlToPlainText(summary);
  return summary ?? product.description ?? null;
}
