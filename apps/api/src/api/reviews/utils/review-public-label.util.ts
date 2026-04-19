const ANONYMOUS_REVIEWER_LABEL = 'Ẩn danh';

export function normalizeVietnamPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('84')) return `0${digits.slice(2)}`;
  if (digits.startsWith('+84')) return `0${digits.slice(2)}`;
  return digits;
}

export function looksLikeVietnamPhoneNumber(input: string): boolean {
  const digits = input.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 12;
}

export function maskDisplayNameForReview(raw: string): string {
  const name = raw.trim();
  if (!name) return '';
  if (name.length <= 4) {
    const last = name.slice(-1);
    return `***${last}`;
  }
  const prefix = name.slice(0, 3);
  const suffix = name.slice(-2);
  return `${prefix}***${suffix}`;
}

/** VN display: first 3 digits + *** + last 3 digits (normalized 0… form). */
export function maskPhoneForReviewDisplay(phone: string): string {
  const n = normalizeVietnamPhone(phone);
  if (n.length < 6) return '***';
  const head = n.slice(0, 3);
  const tail = n.slice(-3);
  return `${head}***${tail}`;
}

export function buildPublicReviewerLabel(params: {
  isAnonymous: boolean;
  displayName: string | undefined;
  orderPhone: string;
}): string {
  if (params.isAnonymous) {
    return ANONYMOUS_REVIEWER_LABEL;
  }
  const maskedName = maskDisplayNameForReview(params.displayName ?? '');
  const maskedPhone = maskPhoneForReviewDisplay(params.orderPhone);
  if (!maskedName) {
    return `${maskedPhone}`;
  }
  return `${maskedName} (${maskedPhone})`;
}
