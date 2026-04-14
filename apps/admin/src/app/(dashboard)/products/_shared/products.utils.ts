export function adminProductQueryKey(productId?: string) {
  return ['products', 'admin', productId] as const;
}
