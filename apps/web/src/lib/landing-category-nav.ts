import type { Category } from '@longnhan/types';

import { LANDING_CATEGORIES } from '@/data/landing-page-content';

const ICONS = ['/icon-menu-pho-hien-36x36.webp', '/cate-icon-2.webp'] as const;

export interface LandingCategoryNavItem {
  label: string;
  href: string;
  iconSrc: string;
  iconAlt?: string;
}

/** Prefer API categories; fall back to static nav when the API returns none. */
export function buildLandingCategoryNav(
  apiCategories: Category[],
): LandingCategoryNavItem[] {
  if (apiCategories.length > 0) {
    return apiCategories.map((c, i) => ({
      label: c.name,
      href: `/products?category=${encodeURIComponent(c.slug)}`,
      iconSrc: ICONS[i % ICONS.length],
      iconAlt: '',
    }));
  }
  return LANDING_CATEGORIES.map((c) => ({
    label: c.label,
    href: c.href,
    iconSrc: c.iconSrc,
    iconAlt: c.iconAlt,
  }));
}
