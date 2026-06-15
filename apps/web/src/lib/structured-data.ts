// JSON-LD structured data generators for SEO
// Used on product pages, article pages, and all pages (organization + breadcrumb)

import { LANDING_BRAND } from '@/data/landing-page-content';
import type { Product, Article } from '@longnhan/types';
import {
  SITE_URL,
  SITE_NAME,
  CONTACT_PHONE,
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  SOCIAL_LINKS,
} from './constants';
import { SCHEMA_ALTERNATE_NAMES } from './seo-keywords';
import { toAbsoluteUrl } from './seo';

/** Organization schema — included in root layout */
export function buildOrganizationSchema() {
  const sameAs = [
    SOCIAL_LINKS.facebook,
    SOCIAL_LINKS.zalo,
    SOCIAL_LINKS.shopee,
    SOCIAL_LINKS.tiktok,
  ].filter((url): url is string => Boolean(url));

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: [...SCHEMA_ALTERNATE_NAMES],
    url: SITE_URL,
    logo: toAbsoluteUrl(LANDING_BRAND.logoSrc),
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hưng Yên',
      addressRegion: 'Hưng Yên',
      addressCountry: 'VN',
      streetAddress: CONTACT_ADDRESS,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: CONTACT_PHONE,
      contactType: 'customer service',
      areaServed: 'VN',
      availableLanguage: ['Vietnamese'],
    },
  };
}

/** WebSite schema with on-site product search — root layout */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: [...SCHEMA_ALTERNATE_NAMES],
    url: SITE_URL,
    inLanguage: 'vi-VN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** BreadcrumbList schema */
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Product schema with VND pricing */
export function buildProductSchema(product: Product) {
  const activeVariants = product.variants.filter((v) => v.active || v.isActive);
  const variantsForPrice =
    activeVariants.length > 0 ? activeVariants : product.variants;
  const lowestPrice =
    variantsForPrice.length > 0
      ? Math.min(...variantsForPrice.map((v) => v.price))
      : product.basePrice;
  const highestPrice =
    variantsForPrice.length > 0
      ? Math.max(...variantsForPrice.map((v) => v.price))
      : product.basePrice;
  const imageList = product.images?.length
    ? product.images
    : product.imageUrls?.length
      ? product.imageUrls
      : product.featuredImageUrl
        ? [product.featuredImageUrl]
        : [];
  const absoluteImages = imageList.map((src) => toAbsoluteUrl(src));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    category: 'Nhãn Hưng Yên / Long nhãn sấy khô',
    description: product.summary ?? product.description ?? undefined,
    image: absoluteImages.length > 0 ? absoluteImages : undefined,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    url: `${SITE_URL}/products/${product.slug}`,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'VND',
      lowPrice: lowestPrice,
      highPrice: highestPrice,
      offerCount: variantsForPrice.length,
      availability: 'https://schema.org/InStock',
    },
  };
}

/** NewsArticle schema */
export function buildArticleSchema(article: Article) {
  const rawImage =
    article.featuredImageUrl ?? article.coverImageUrl ?? undefined;
  const image = rawImage ? toAbsoluteUrl(rawImage) : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt ?? article.summary ?? undefined,
    image,
    inLanguage: 'vi-VN',
    mainEntityOfPage: `${SITE_URL}/articles/${article.slug}`,
    datePublished: article.publishedAt ?? article.createdAt,
    dateModified: article.updatedAt,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    url: `${SITE_URL}/articles/${article.slug}`,
  };
}
