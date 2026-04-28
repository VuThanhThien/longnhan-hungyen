const STORAGE_KEY = 'web.headerSearch.recentQueries.v1';
const MAX_ITEMS = 8;

export type RecentQuery = {
  q: string;
  category?: string | null;
  at: number;
};

function dedupeKey(item: RecentQuery): string {
  return `${item.q.trim().toLowerCase()}|${item.category ?? ''}`;
}

export function readRecents(): RecentQuery[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecents(items: RecentQuery[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded — silently ignore
  }
}

export function addRecent(item: { q: string; category?: string | null }): void {
  const trimmed = item.q.trim();
  if (!trimmed) return;

  const entry: RecentQuery = {
    q: trimmed,
    category: item.category ?? null,
    at: Date.now(),
  };
  const key = dedupeKey(entry);
  const existing = readRecents().filter((r) => dedupeKey(r) !== key);
  writeRecents([entry, ...existing].slice(0, MAX_ITEMS));
}

export function removeRecent(item: RecentQuery): void {
  const key = dedupeKey(item);
  writeRecents(readRecents().filter((r) => dedupeKey(r) !== key));
}

export function clearRecents(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
