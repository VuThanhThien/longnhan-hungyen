/**
 * Central SEO keyword lists — Vietnamese + ASCII (no diacritics) for search coverage.
 * Used in meta keywords, JSON-LD alternateName, and copy templates.
 */

/** Use-case keywords — chè dưỡng nhan, nấu chè (có nội dung landing/FAQ hỗ trợ) */
export const CHE_SEO_KEYWORDS = [
  'chè dưỡng nhan',
  'long nhãn nấu chè',
  'hạt sen long nhãn',
  'che duong nhan',
  'long nhan nau che',
  'hat sen long nhan',
] as const;

/** Full keyword set for home / layout */
export const CORE_SEO_KEYWORDS = [
  'nhanhunguyen.com',
  'Nhãn Hưng Yên',
  'Long nhãn Hưng Yên',
  'long nhãn Hưng Yên',
  'nhãn lồng Hưng Yên',
  'Long Nhãn Tống Trân',
  'Nhãn Tống Trân',
  'đặc sản nhãn Hưng Yên',
  'đặc sản Hưng Yên',
  'mua nhãn Hưng Yên',
  'long nhãn sấy khô',
  'long nhãn sấy khô Hưng Yên',
  'long nhãn quà tặng',
  'Long nhãn giao COD',
  'Long nhãn Shopee',
  'Long nhãn TikTok',
  ...CHE_SEO_KEYWORDS,
  // ASCII — không dấu (gõ không dấu, tìm kiếm giọng nói)
  'nhan hung yen',
  'nhan long hung yen',
  'long nhan hung yen',
  'nhan long',
  'nhan long say kho',
  'mua nhan hung yen',
  'dac san nhan hung yen',
  'nhan tong tran',
] as const;

/** Shorter subset for product listing / PDP */
export const PAGE_SEO_KEYWORDS = [
  'Nhãn Hưng Yên',
  'Long nhãn Hưng Yên',
  'nhãn lồng Hưng Yên',
  'long nhãn sấy khô',
  'nhan hung yen',
  'long nhan hung yen',
  'nhanhunguyen.com',
] as const;

/** Articles hub — core + chè dưỡng nhan intent */
export const ARTICLE_SEO_KEYWORDS = [
  ...PAGE_SEO_KEYWORDS,
  'chè dưỡng nhan',
  'long nhãn nấu chè',
  'hạt sen long nhãn',
  'che duong nhan',
] as const;

/** Schema.org alternateName values */
export const SCHEMA_ALTERNATE_NAMES = [
  'Nhãn Hưng Yên',
  'Long Nhãn Hưng Yên',
  'Long Nhãn Tống Trân',
  'nhan hung yen',
  'long nhan hung yen',
  'nhan long hung yen',
  'nhanhunguyen.com',
] as const;
