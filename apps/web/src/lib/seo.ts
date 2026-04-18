import { SITE_NAME, SITE_URL } from '@/lib/constants';
import type { Metadata } from 'next';
import { PWA_CONFIG } from './pwa-config';

type OgImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

type SeoBuilderCore = {
  title: string;
  description?: string;
  canonicalPath: string;
  ogImage?: OgImage;
  ogImages?: OgImage[];
  /** Use `article` for blog posts so crawlers get the right OG type. */
  openGraphType?: 'website' | 'article';
};

/** Core SEO fields plus any optional Next.js `Metadata` fields (merged shallowly; OG/Twitter/canonical are composed on top). */
export type BuildSeoMetadataInput = SeoBuilderCore & Partial<Metadata>;

const DEFAULT_OG_IMAGE: Required<Pick<OgImage, 'url'>> & Partial<OgImage> = {
  url: '/banner-web2.png',
  width: 1200,
  height: 630,
  alt: 'Long Nhãn Tống Trân',
};

/** Resolves image and page URLs for OG/Twitter; Facebook requires absolute https URLs. */
export function toAbsoluteUrl(pathOrUrl: string): string {
  const s = pathOrUrl.trim();
  if (s.startsWith('https://')) return s;
  if (s.startsWith('http://')) return s;
  if (s.startsWith('//')) return `https:${s}`;
  if (s.startsWith('/')) return `${SITE_URL}${s}`;
  return `${SITE_URL}/${s}`;
}

function normalizeCanonicalPath(path: string): string {
  const p = path.trim();
  if (!p || p === '/') return '/';
  return p.startsWith('/') ? p : `/${p}`;
}

export function buildSeoMetadata(input: BuildSeoMetadataInput): Metadata {
  const {
    title,
    description,
    canonicalPath,
    ogImage,
    ogImages,
    openGraphType,
    alternates: inputAlternates,
    openGraph: inputOpenGraph,
    twitter: inputTwitter,
    ...metadataRest
  } = input;

  const pathname = normalizeCanonicalPath(canonicalPath);
  const pageUrl = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;

  const images = (ogImages ?? (ogImage ? [ogImage] : [DEFAULT_OG_IMAGE]))
    .filter(Boolean)
    .map((img) => ({
      ...img,
      url: toAbsoluteUrl(img.url),
    }));

  const imageUrls = images.map((i) => i.url);

  const userOg = inputOpenGraph as
    | (NonNullable<typeof inputOpenGraph> & { type?: 'website' | 'article' })
    | undefined;
  const ogType = openGraphType ?? userOg?.type ?? 'website';

  const userTw = inputTwitter as
    | (NonNullable<typeof inputTwitter> & {
        card?: 'summary' | 'summary_large_image' | 'app' | 'player';
      })
    | undefined;

  return {
    ...metadataRest,
    title,
    description,
    alternates: {
      ...inputAlternates,
      canonical: pageUrl,
    },
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    generator: 'Next.js',
    applicationName: SITE_NAME,
    category: 'food',
    metadataBase: new URL(SITE_URL),
    openGraph: {
      ...inputOpenGraph,
      type: ogType,
      locale: userOg?.locale ?? 'vi_VN',
      siteName: userOg?.siteName ?? SITE_NAME,
      url: userOg?.url ?? pageUrl,
      title,
      description,
      images,
    },
    twitter: {
      ...inputTwitter,
      card: userTw?.card ?? 'summary_large_image',
      title,
      description,
      images: imageUrls,
    },
    icons: {
      icon: [{ url: '/favicon.ico', sizes: 'any' }],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    classification: 'food',
    other: {
      google: 'notranslate',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': SITE_NAME,
      'application-name': SITE_NAME,
      'msapplication-TileColor': PWA_CONFIG.themeColor,
      'msapplication-config': '/browserconfig.xml',
      'theme-color': PWA_CONFIG.themeColor,
      'color-scheme': 'dark light',
      referrer: 'origin-when-cross-origin',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: SITE_NAME,
      startupImage: [
        {
          url: '/apple-touch-startup-image-768x1004.png',
          media: '(device-width: 768px) and (device-height: 1024px)',
        },
      ],
    },
    referrer: 'origin-when-cross-origin',
  };
}
