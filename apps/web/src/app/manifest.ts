import type { MetadataRoute } from 'next';
import { PWA_CONFIG, PWA_MANIFEST_SCREENSHOTS } from '@/lib/pwa-config';

/**
 * Web App Manifest — install name, description, icons, theme, optional screenshots.
 * Copy and assets are defined in `@/lib/pwa-config`.
 */
export default function manifest(): MetadataRoute.Manifest {
  const base = new URL('/', PWA_CONFIG.siteUrl).href;
  const { icons } = PWA_CONFIG;

  return {
    id: base,
    name: PWA_CONFIG.name,
    short_name: PWA_CONFIG.shortName,
    description: PWA_CONFIG.description,
    lang: PWA_CONFIG.lang,
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'browser'],
    orientation: 'any',
    background_color: PWA_CONFIG.backgroundColor,
    theme_color: PWA_CONFIG.themeColor,
    categories: ['food', 'shopping'],
    icons: [
      {
        src: icons.src,
        sizes: icons.sizes.small,
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: icons.src,
        sizes: icons.sizes.large,
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: icons.src,
        sizes: icons.sizes.large,
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [...PWA_MANIFEST_SCREENSHOTS],
  };
}
