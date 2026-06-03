import FeaturedProducts from '@/components/home/featured-products';
import { LandingArticlesPreview } from '@/components/landing/landing-articles-preview';
import { LandingStory } from '@/components/landing/landing-story';
import { LandingTestimonialsTrust } from '@/components/landing/landing-testimonials-trust';
import ScrollReveal from '@/components/ui/scroll-reveal';
import {
  LANDING_IMAGE_ALBUM,
  LANDING_VIDEO_ALBUM_URLS,
} from '@/data/landing-page-content';
import { fetchPaginated } from '@/lib/api-client';
import { homeContentTags } from '@/lib/content-cache-tags';
import { captureHomeContentFetchError } from '@/lib/observability/api-fetch-sentry';
import type { Article, Product } from '@longnhan/types';
import { cacheLife, cacheTag } from 'next/cache';
import dynamic from 'next/dynamic';

const VideoSection = dynamic(() => import('@/components/home/video-section'));
const LandingFaq = dynamic(() =>
  import('@/components/landing/landing-faq').then((m) => ({
    default: m.LandingFaq,
  })),
);
const LandingImageAlbum = dynamic(() =>
  import('@/components/landing/landing-image-album').then((m) => ({
    default: m.LandingImageAlbum,
  })),
);

async function getHomeProducts(): Promise<Product[]> {
  'use cache';
  cacheTag(homeContentTags.featuredProducts);
  cacheLife({ revalidate: 300 });
  try {
    const response = await fetchPaginated<Product>('/products', { limit: 8 });
    return response.data;
  } catch (error) {
    captureHomeContentFetchError('products', error);
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
  } catch (error) {
    captureHomeContentFetchError('articles', error);
    return [];
  }
}

export async function LandingHomeBelowFold() {
  const [products, articles] = await Promise.all([
    getHomeProducts(),
    getHomeArticles(),
  ]);
  const productVideos = products
    .map((p) => p.videoUrl)
    .filter(Boolean) as string[];

  return (
    <>
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
    </>
  );
}
