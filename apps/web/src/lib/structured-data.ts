// JSON-LD structured data generators for SEO
// Used on product pages, article pages, and all pages (organization + breadcrumb)

import type { Product, Article } from '@longnhan/types';
import { SITE_URL, SITE_NAME, CONTACT_PHONE, CONTACT_ADDRESS } from './constants';

/** Organization schema — included in root layout */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    telephone: CONTACT_PHONE,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hưng Yên',
      addressCountry: 'VN',
      streetAddress: CONTACT_ADDRESS,
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
  const variantsForPrice = activeVariants.length > 0 ? activeVariants : product.variants;
  const lowestPrice =
    variantsForPrice.length > 0 ? Math.min(...variantsForPrice.map((v) => v.price)) : product.basePrice;
  const highestPrice =
    variantsForPrice.length > 0 ? Math.max(...variantsForPrice.map((v) => v.price)) : product.basePrice;
  const imageList = product.images?.length
    ? product.images
    : product.imageUrls?.length
      ? product.imageUrls
      : product.featuredImageUrl
        ? [product.featuredImageUrl]
        : [];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: imageList,
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
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt ?? article.summary ?? undefined,
    image: article.featuredImageUrl ?? article.coverImageUrl ?? undefined,
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
