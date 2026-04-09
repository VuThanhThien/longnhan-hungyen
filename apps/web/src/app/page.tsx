import type { Product } from '@longnhan/types';
import FeaturedProducts from '@/components/home/featured-products';
import VideoSection from '@/components/home/video-section';
import CtaSection from '@/components/home/cta-section';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingStory } from '@/components/landing/landing-story';
import { LandingProductQuality } from '@/components/landing/landing-product-quality';
import { LandingNutritionSeason } from '@/components/landing/landing-nutrition-season';
import { LandingChannels } from '@/components/landing/landing-channels';
import { LandingTestimonialsTrust } from '@/components/landing/landing-testimonials-trust';
import { LandingFaq } from '@/components/landing/landing-faq';
import ScrollReveal from '@/components/ui/scroll-reveal';
import { fetchPaginated } from '@/lib/api-client';

export const revalidate = 300;

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
  const productVideos = products.map((p) => p.videoUrl).filter(Boolean) as string[];

  return (
    <div className="landing-page bg-(--brand-cream) text-(--brand-forest)">
      <ScrollReveal>
        <LandingHero />
      </ScrollReveal>
      <ScrollReveal delayMs={80}>
        <LandingStory />
      </ScrollReveal>
      <ScrollReveal delayMs={120}>
        <LandingProductQuality />
      </ScrollReveal>
      <ScrollReveal delayMs={160}>
        <LandingNutritionSeason />
      </ScrollReveal>
      <ScrollReveal delayMs={200}>
        <LandingChannels />
      </ScrollReveal>
      <ScrollReveal delayMs={220}>
        <LandingTestimonialsTrust />
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
