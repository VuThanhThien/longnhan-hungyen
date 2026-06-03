import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

const PRIVATE_PATHS = [
  '/cart',
  '/checkout',
  '/checkout/',
  '/order-success',
  '/track-order',
  '/service-unavailable',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
