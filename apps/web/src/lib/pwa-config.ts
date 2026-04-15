import { LANDING_BRAND, LANDING_SEO } from '@/data/landing-page-content';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

/**
 * Single source of truth for PWA + install UI metadata (manifest, layout, OG/Twitter).
 * Update copy and asset paths here only.
 */
export const PWA_CONFIG = {
  /** Full app name (install dialog, manifest `name`) */
  name: SITE_NAME,

  /** Short label (home screen icon caption, manifest `short_name`) */
  shortName: 'Long Nhãn Tống Trân',

  /**
   * Install / store listing description (manifest `description`, default meta description).
   * Kept aligned with landing SEO.
   */
  description: LANDING_SEO.description,

  /** Page `<title>` default (longer SEO title) */
  documentTitle: LANDING_SEO.title,

  /** `<html lang>` + manifest `lang` */
  lang: 'vi',

  siteUrl: SITE_URL,

  themeColor: '#201d18',
  backgroundColor: '#fdfdf9',

  /** App icon (PNG; same file may be listed at 192 + 512 for installability) */
  icons: {
    /** Primary / maskable — path under `public/` */
    src: '/icons/pwa-icon.png',
    /** Declared sizes in manifest (adjust if you add real 192×192 asset) */
    sizes: {
      small: '192x192',
      large: '512x512',
    },
  },

  /** Brand mark (header, optional narrow screenshot) */
  logo: {
    path: LANDING_BRAND.logoSrc,
    alt: LANDING_BRAND.logoAlt,
  },

  /** Hero / marketing image for Open Graph, Twitter, manifest screenshots */
  heroImage: {
    path: '/banner-web2.png',
    width: 1200,
    height: 630,
    alt: LANDING_SEO.ogImageAlt,
  },
} as const;

/**
 * Rich install UI (Chrome): optional screenshots in the Web App Manifest.
 * @see https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/screenshots
 */
export const PWA_MANIFEST_SCREENSHOTS = [
  {
    src: PWA_CONFIG.heroImage.path,
    sizes: `${PWA_CONFIG.heroImage.width}x${PWA_CONFIG.heroImage.height}`,
    type: 'image/png',
    form_factor: 'wide' as const,
    label: `${PWA_CONFIG.shortName} — trang chủ`,
  },
] as const;
