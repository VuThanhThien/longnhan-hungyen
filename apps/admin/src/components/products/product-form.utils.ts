export function coerceToHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (looksLikeHtml) return trimmed;

  const escaped = trimmed
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  return `<p>${escaped.replaceAll('\n', '<br />')}</p>`;
}
