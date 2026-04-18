import FeaturedProducts from '@/components/home/featured-products';
import VideoSection from '@/components/home/video-section';
import { LandingArticlesPreview } from '@/components/landing/landing-articles-preview';
import { LandingCategoryCarousel } from '@/components/landing/landing-category-carousel';
import { LandingFaq } from '@/components/landing/landing-faq';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingImageAlbum } from '@/components/landing/landing-image-album';
import { LandingStory } from '@/components/landing/landing-story';
import { LandingTestimonialsTrust } from '@/components/landing/landing-testimonials-trust';
import ScrollReveal from '@/components/ui/scroll-reveal';
import {
  LANDING_IMAGE_ALBUM,
  LANDING_VIDEO_ALBUM_URLS,
} from '@/data/landing-page-content';
import { fetchApi, fetchPaginated } from '@/lib/api-client';
import { homeContentTags } from '@/lib/content-cache-tags';
import { buildLandingCategoryNav } from '@/lib/landing-category-nav';
import type { Article, Category, Product } from '@longnhan/types';
import { cacheLife, cacheTag } from 'next/cache';
import { connection } from 'next/server';

async function getHomeProducts(): Promise<Product[]> {
  'use cache';
  cacheTag(homeContentTags.featuredProducts);
  cacheLife({ revalidate: 300 });
  try {
    const response = await fetchPaginated<Product>('/products', { limit: 8 });
    return response.data;
  } catch {
    return [];
  }
}

async function getHomeCategories(): Promise<Category[]> {
  'use cache';
  cacheTag(homeContentTags.categories);
  cacheLife({ revalidate: 300 });
  try {
    return await fetchApi<Category[]>('/categories');
  } catch {
    return [];
  }
}

async function getHomeArticles(): Promise<Article[]> {
  'use cache';
  cacheTag(homeContentTags.articles);
  cacheLife({ revalidate: 300 });
  try {
    const response = await fetchPaginated<Article>('/articles', {
      limit: 4,
      page: 1,
    });
    return response.data;
  } catch {
    return [];
  }
}

export default async function Home() {
  // Ensure home data is fetched at request time. `next build` in Docker has no API,
  // so prerendering would cache empty products/articles; `/products` is dynamic via searchParams.
  await connection();
  const [categories, products, articles] = await Promise.all([
    getHomeCategories(),
    getHomeProducts(),
    getHomeArticles(),
  ]);
  const categoryNavItems = buildLandingCategoryNav(categories);
  const productVideos = products
    .map((p) => p.videoUrl)
    .filter(Boolean) as string[];

  return (
    <div className="landing-page bg-(--brand-cream) text-(--brand-forest)">
      <ScrollReveal>
        <LandingHero />
      </ScrollReveal>
      <ScrollReveal delayMs={60}>
        <LandingCategoryCarousel navItems={categoryNavItems} />
      </ScrollReveal>
      <ScrollReveal delayMs={80}>
        <FeaturedProducts products={products} />
      </ScrollReveal>
      <ScrollReveal delayMs={100}>
        <LandingArticlesPreview articles={articles} />
      </ScrollReveal>
      <ScrollReveal delayMs={220}>
        <LandingStory />
      </ScrollReveal>
      <ScrollReveal delayMs={240}>
        <LandingFaq />
      </ScrollReveal>
      {LANDING_VIDEO_ALBUM_URLS.length > 0 ? (
        <ScrollReveal delayMs={248}>
          <VideoSection
            videoUrls={[...LANDING_VIDEO_ALBUM_URLS]}
            title="Video chia sẻ"
            sectionId="video-album"
          />
        </ScrollReveal>
      ) : null}
      <ScrollReveal delayMs={252}>
        <LandingImageAlbum
          sectionTitle="Hình ảnh & không gian"
          sectionSubtitle="Hình ảnh minh họa từ vườn nhãn và sản phẩm"
          items={LANDING_IMAGE_ALBUM}
        />
      </ScrollReveal>
      <ScrollReveal delayMs={260}>
        <VideoSection videoUrls={productVideos} />
      </ScrollReveal>
      <ScrollReveal delayMs={280}>
        <section className="landing-section landing-section--decor-cta">
          <LandingTestimonialsTrust />
        </section>
      </ScrollReveal>
    </div>
  );
}
