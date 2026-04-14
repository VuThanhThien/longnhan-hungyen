import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

export const CART_STORAGE_KEY = 'longnhan-cart-v1';

export type CartLine = {
  variantId: string;
  quantity: number;
  unitPriceVnd: number;
};

type CartState = {
  lines: CartLine[];
  setLines: (lines: CartLine[]) => void;
  upsertLine: (line: CartLine) => void;
  removeLine: (variantId: string) => void;
  clear: () => void;
};

function totalsFromLines(lines: CartLine[]): {
  itemCount: number;
  totalVnd: number;
} {
  let itemCount = 0;
  let totalVnd = 0;
  for (const line of lines) {
    itemCount += line.quantity;
    totalVnd += line.quantity * line.unitPriceVnd;
  }
  return { itemCount, totalVnd };
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      setLines: (lines) => set({ lines }),
      upsertLine: (line) =>
        set((s) => {
          const idx = s.lines.findIndex((l) => l.variantId === line.variantId);
          if (idx === -1) {
            return { lines: [...s.lines, line] };
          }
          const next = [...s.lines];
          const merged = next[idx];
          next[idx] = {
            ...merged,
            quantity: merged.quantity + line.quantity,
            unitPriceVnd: line.unitPriceVnd,
          };
          return { lines: next };
        }),
      removeLine: (variantId) =>
        set((s) => ({
          lines: s.lines.filter((l) => l.variantId !== variantId),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: CART_STORAGE_KEY },
  ),
);

export function getCartTotals(lines: CartLine[]): {
  itemCount: number;
  totalVnd: number;
} {
  return totalsFromLines(lines);
}

export function useCartTotals(): { itemCount: number; totalVnd: number } {
  return useCartStore(useShallow((s) => totalsFromLines(s.lines)));
}
