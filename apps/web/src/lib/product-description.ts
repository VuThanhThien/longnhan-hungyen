import type { Product } from '@longnhan/types';

function htmlToPlainText(html: string) {
  if (!html) return '';

  // Client-side: most accurate.
  if (typeof window !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  }

  // Server-side fallback: best-effort stripping.
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

