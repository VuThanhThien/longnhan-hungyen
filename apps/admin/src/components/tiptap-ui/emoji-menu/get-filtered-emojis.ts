import type { EmojiItem } from '@tiptap/extension-emoji';

const MAX_RESULTS = 100;

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function matches(query: string, emoji: EmojiItem): boolean {
  if (!query) return true;
  const q = normalize(query);
  if (normalize(emoji.name).includes(q)) return true;
  if (emoji.shortcodes.some((s) => normalize(s).includes(q))) return true;
  if (emoji.tags.some((t) => normalize(t).includes(q))) return true;
  return false;
}

export function getFilteredEmojis(props: {
  query: string;
  emojis: EmojiItem[];
}): EmojiItem[] {
  const { query, emojis } = props;
  const q = normalize(query);

  const filtered = q
    ? emojis.filter((e) => matches(q, e))
    : emojis.slice(0, MAX_RESULTS);

  const sorted = [...filtered].sort((a, b) =>
    a.name.localeCompare(b.name, 'en'),
  );

  return sorted.slice(0, MAX_RESULTS);
}
