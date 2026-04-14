export function formatVnd(amount: number): string {
  return (
    new Intl.NumberFormat('vi-VN').format(Math.max(0, Math.round(amount))) +
    ' ₫'
  );
}
