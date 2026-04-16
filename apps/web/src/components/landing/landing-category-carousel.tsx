import Image from 'next/image';
import Link from 'next/link';

import { LandingBannerCarousel } from '@/components/landing/landing-banner-carousel.client';
import { LANDING_BANNER_SLIDES } from '@/data/landing-page-content';
import type { LandingCategoryNavItem } from '@/lib/landing-category-nav';
import { cn } from '@/lib/utils';

export type { LandingCategoryNavItem };

export interface LandingCategoryCarouselProps {
  className?: string;
  /** From API categories or static fallback (built on the server). */
  navItems: LandingCategoryNavItem[];
}

export function LandingCategoryCarousel({
  className,
  navItems,
}: LandingCategoryCarouselProps) {
  return (
    <section
      className={cn(
        'landing-section border-b border-(--brand-gold)/20 bg-(--brand-cream)',
        className,
      )}
      aria-labelledby="home-category-carousel-title"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--brand-gold-dark)">
              Danh mục & ưu đãi
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          <nav
            aria-label="Danh mục sản phẩm"
            className={cn(
              [
                'w-full min-w-0 max-w-full',
                'relative overflow-hidden rounded-2xl',
                'bg-[#7b0000] text-white shadow-sm',
                'ring-1 ring-[#d7b25c]/45',
                'before:pointer-events-none before:absolute before:inset-2 before:rounded-[calc(var(--radius-2xl)-0.5rem)] before:border before:border-[#d7b25c]/30',
                'after:pointer-events-none after:absolute after:inset-4 after:rounded-[calc(var(--radius-2xl)-1rem)] after:border after:border-white/10',
              ].join(' '),
              'md:col-span-3',
            )}
          >
            <div className="border-b border-white/10 px-5 py-5">
              <p className="landing-heading text-xl font-semibold tracking-tight text-white">
                Danh mục sản phẩm
              </p>
            </div>

            {/* Mobile: chip-style quick nav */}
            <div className="md:hidden">
              <ul className="flex gap-2 overflow-x-auto px-5 py-4 [-webkit-tap-highlight-color:transparent]">
                {navItems.map((c) => (
                  <li key={c.href} className="shrink-0">
                    <Link
                      href={c.href}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white',
                        'hover:bg-white/10',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b25c]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#7b0000]',
                      )}
                    >
                      <Image
                        src={c.iconSrc}
                        alt={c.iconAlt ?? ''}
                        width={18}
                        height={18}
                        className="h-[18px] w-[18px] object-contain opacity-100 brightness-0 invert"
                      />
                      <span className="whitespace-nowrap">{c.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop: list */}
            <ul className="hidden md:block">
              {navItems.map((c) => (
                <li
                  key={c.href}
                  className="border-b border-white/10 last:border-b-0"
                >
                  <Link
                    href={c.href}
                    className={cn(
                      'group flex min-w-0 items-center gap-3 px-5 py-4 text-sm font-medium text-white',
                      'hover:bg-white/5',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b25c]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#7b0000]',
                    )}
                  >
                    <Image
                      src={c.iconSrc}
                      alt={c.iconAlt ?? ''}
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain opacity-100 brightness-0 invert"
                    />
                    <span className="min-w-0 truncate">{c.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 md:col-span-9">
            <LandingBannerCarousel slides={LANDING_BANNER_SLIDES} />
          </div>
        </div>
      </div>
    </section>
  );
}
