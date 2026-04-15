export function requireNonEmptyString(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (typeof v !== 'string') {
    throw new Error('Dữ liệu đơn hàng không hợp lệ');
  }
  const trimmed = v.trim();
  if (!trimmed) {
    throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
  }
  return trimmed;
}

export function optionalString(
  formData: FormData,
  key: string,
): string | undefined {
  const v = formData.get(key);
  if (typeof v !== 'string') return undefined;
  const trimmed = v.trim();
  return trimmed ? trimmed : undefined;
}

export function requireJsonString(formData: FormData, key: string): unknown {
  const raw = formData.get(key);
  if (!raw) {
    throw new Error('Thiếu dữ liệu');
  }
  if (typeof raw !== 'string') {
    throw new Error('Dữ liệu không hợp lệ');
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Dữ liệu không hợp lệ');
  }
}
