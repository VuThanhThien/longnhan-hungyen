import { LandingCategoryCarousel } from '@/components/landing/landing-category-carousel';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingHomeBelowFold } from '@/components/landing/landing-home-below-fold';
import { LandingHomeBelowFoldFallback } from '@/components/landing/landing-home-below-fold-fallback';
import ScrollReveal from '@/components/ui/scroll-reveal';
import { fetchApi } from '@/lib/api-client';
import { homeContentTags } from '@/lib/content-cache-tags';
import { captureHomeContentFetchError } from '@/lib/observability/api-fetch-sentry';
import { buildLandingCategoryNav } from '@/lib/landing-category-nav';
import type { Category } from '@longnhan/types';
import { cacheLife, cacheTag } from 'next/cache';
import { connection } from 'next/server';
import { Suspense } from 'react';

async function getHomeCategories(): Promise<Category[]> {
  'use cache';
  cacheTag(homeContentTags.categories);
  cacheLife({ revalidate: 300 });
  try {
    return await fetchApi<Category[]>('/categories');
  } catch (error) {
    captureHomeContentFetchError('categories', error);
    return [];
  }
}

export default async function Home() {
  await connection();
  const categories = await getHomeCategories();
  const categoryNavItems = buildLandingCategoryNav(categories);

  return (
    <div className="landing-page bg-(--brand-cream) text-(--brand-forest)">
      <LandingHero />
      <ScrollReveal delayMs={60}>
        <LandingCategoryCarousel navItems={categoryNavItems} />
      </ScrollReveal>
      <Suspense fallback={<LandingHomeBelowFoldFallback />}>
        <LandingHomeBelowFold />
      </Suspense>
    </div>
  );
}
