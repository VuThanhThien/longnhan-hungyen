import { SITE_URL } from '@/lib/constants';
import type { Metadata } from 'next';

type OgImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

const DEFAULT_OG_IMAGE: Required<Pick<OgImage, 'url'>> & Partial<OgImage> = {
  url: '/banner-web2.png',
  width: 1200,
  height: 630,
  alt: 'Long Nhãn Tống Trân',
};

function toAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://'))
    return pathOrUrl;
  if (!pathOrUrl.startsWith('/')) return `${SITE_URL}/${pathOrUrl}`;
  return `${SITE_URL}${pathOrUrl}`;
}

export function buildSeoMetadata(input: {
  title: string;
  description?: string;
  canonicalPath: string;
  ogImage?: OgImage;
  ogImages?: OgImage[];
}): Metadata {
  const canonicalPath = input.canonicalPath.startsWith('/')
    ? input.canonicalPath
    : `/${input.canonicalPath}`;
  const canonicalUrl = toAbsoluteUrl(canonicalPath);

  const images = (
    input.ogImages ?? (input.ogImage ? [input.ogImage] : [DEFAULT_OG_IMAGE])
  )
    .filter(Boolean)
    .map((img) => ({
      ...img,
      url: toAbsoluteUrl(img.url),
    }));

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: input.title,
      description: input.description,
      images,
    },
  };
}
