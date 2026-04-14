import type { Product } from '@longnhan/types';
import type { Metadata } from 'next';
import FeaturedProducts from '@/components/home/featured-products';
import VideoSection from '@/components/home/video-section';
import CtaSection from '@/components/home/cta-section';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingStory } from '@/components/landing/landing-story';
import { LandingTestimonialsTrust } from '@/components/landing/landing-testimonials-trust';
import { LandingFaq } from '@/components/landing/landing-faq';
import ScrollReveal from '@/components/ui/scroll-reveal';
import { fetchPaginated } from '@/lib/api-client';
import { LANDING_SEO } from '@/data/landing-page-content';
import { buildSeoMetadata } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = buildSeoMetadata({
  title: LANDING_SEO.title,
  description: LANDING_SEO.description,
  canonicalPath: '/',
  ogImage: {
    url: '/banner-web2.png',
    width: 1200,
    height: 630,
    alt: LANDING_SEO.ogImageAlt,
  },
});

async function getHomeProducts(): Promise<Product[]> {
  try {
    const response = await fetchPaginated<Product>('/products', { limit: 8 });
    return response.data;
  } catch {
    return [];
  }
}

export default async function Home() {
  const products = await getHomeProducts();
  const productVideos = products
    .map((p) => p.videoUrl)
    .filter(Boolean) as string[];

  return (
    <div className="landing-page bg-(--brand-cream) text-(--brand-forest)">
      <ScrollReveal>
        <LandingHero />
      </ScrollReveal>
      <ScrollReveal delayMs={80}>
        <LandingStory />
      </ScrollReveal>
      <ScrollReveal delayMs={220}>
        <section className="landing-section landing-section--decor-cta">
          <LandingTestimonialsTrust />
        </section>
      </ScrollReveal>
      <ScrollReveal delayMs={240}>
        <LandingFaq />
      </ScrollReveal>
      <ScrollReveal delayMs={260}>
        <FeaturedProducts products={products} />
      </ScrollReveal>
      <ScrollReveal delayMs={280}>
        <VideoSection videoUrls={productVideos} />
      </ScrollReveal>
      <ScrollReveal delayMs={300}>
        <CtaSection />
      </ScrollReveal>
    </div>
  );
}
