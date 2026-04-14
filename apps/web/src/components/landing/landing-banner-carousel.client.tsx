'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  A11y,
  Autoplay,
  Keyboard,
  Navigation,
  Pagination,
} from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';
import './landing-banner-carousel.css';

type Slide = {
  id: string;
  imageSrc: string;
  alt: string;
  href?: string;
};

export interface LandingBannerCarouselProps {
  slides: readonly Slide[];
  className?: string;
  autoPlay?: boolean;
  intervalMs?: number;
  priorityFirstImage?: boolean;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}

export function LandingBannerCarousel({
  slides,
  className,
  autoPlay = true,
  intervalMs = 7000,
  priorityFirstImage = true,
}: LandingBannerCarouselProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isPlaying, setIsPlaying] = React.useState(autoPlay);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [announce, setAnnounce] = React.useState(false);
  const swiperRef = React.useRef<import('swiper').Swiper | null>(null);

  const count = slides.length;
  const canLoop = count > 1;

  React.useEffect(() => setIsPlaying(autoPlay), [autoPlay]);

  const slideLabel = `Slide ${activeIndex + 1} of ${count}`;

  return (
    <div
      className={cn(
        'relative h-[260px] overflow-hidden rounded-2xl border border-(--brand-gold)/25 bg-(--brand-cream) shadow-sm',
        'sm:h-[300px] md:h-[340px]',
        className,
      )}
      aria-roledescription="carousel"
      aria-label="Banner khuyến mại"
    >
      <Swiper
        modules={[Autoplay, A11y, Keyboard, Navigation, Pagination]}
        loop={canLoop}
        slidesPerView={1}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true }}
        a11y={{
          enabled: true,
          containerMessage: 'Banner khuyến mại',
          prevSlideMessage: 'Banner trước',
          nextSlideMessage: 'Banner sau',
          firstSlideMessage: 'Banner đầu tiên',
          lastSlideMessage: 'Banner cuối cùng',
          paginationBulletMessage: 'Tới {{index}}',
        }}
        autoplay={
          canLoop && isPlaying && !prefersReducedMotion
            ? {
                delay: intervalMs,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          // realIndex stays stable when looping
          setActiveIndex(swiper.realIndex ?? swiper.activeIndex ?? 0);
          // announce only for user-initiated actions (buttons/dots)
          // autoplay keeps announce=false to avoid chatty SR output
          if (!swiper.autoplay?.running) setAnnounce(false);
        }}
        className="landing-banner-carousel h-full w-full"
      >
        {slides.map((s, i) => (
          <SwiperSlide key={s.id} className="h-full">
            <div className="relative h-full w-full">
              {s.href ? (
                <Link
                  href={s.href}
                  className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--brand-cream)"
                  aria-label={`${s.alt} — mở liên kết`}
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={s.imageSrc}
                      alt={s.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 75vw"
                      priority={priorityFirstImage && i === 0}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-black/40 via-black/10 to-transparent" />
                  </div>
                </Link>
              ) : (
                <>
                  <Image
                    src={s.imageSrc}
                    alt={s.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 75vw"
                    priority={priorityFirstImage && i === 0}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-black/40 via-black/10 to-transparent" />
                </>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <span
        className="sr-only"
        aria-live={announce ? 'polite' : 'off'}
        aria-atomic="true"
      >
        {slideLabel}
      </span>
    </div>
  );
}
