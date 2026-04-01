'use client';

// Hero banner carousel — auto-rotates every 5s, manual prev/next, dot indicators
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LANDING_HERO_SLIDES } from '@/data/landing-page-content';
import { CONTACT_PHONE } from '@/lib/constants';

const tel = `tel:${CONTACT_PHONE.replace(/\s/g, '')}`;

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const count = LANDING_HERO_SLIDES.length;

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setActive((prev) => (prev + 1) % count), 5000);
    return () => clearInterval(id);
  }, [count]);

  const prev = () => setActive((a) => (a - 1 + count) % count);
  const next = () => setActive((a) => (a + 1) % count);

  const slide = LANDING_HERO_SLIDES[active];
  const lines = slide.headline.split('\n');

  return (
    <section className="relative overflow-hidden border-b border-(--brand-gold)/25 bg-linear-to-b from-(--brand-cream) via-[#eef4ec] to-(--brand-cream)">
      {/* Background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23145232' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center md:py-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-(--brand-gold-dark)">
          Tinh hoa Phố Hiến
        </p>
        <h1 className="landing-heading max-w-xl text-4xl font-semibold leading-tight text-(--brand-forest) sm:text-5xl lg:text-[3.25rem] transition-opacity duration-500">
          {lines.map((line, i) => <span key={i} className="block">{line}</span>)}
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-(--brand-forest-muted)">
          {slide.subhead}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href={slide.ctaHref}
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-(--brand-forest) px-8 text-sm font-semibold tracking-wide text-(--brand-cream) shadow-md transition hover:bg-(--brand-forest-soft)"
          >
            {slide.ctaLabel}
          </Link>
          <a
            href={tel}
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-(--brand-gold)/60 bg-(--brand-gold)/10 px-8 text-sm font-semibold text-(--brand-forest) transition hover:bg-(--brand-gold)/20"
          >
            Gọi tư vấn
          </a>
        </div>

        {/* Dot indicators */}
        {count > 1 && (
          <div className="mt-8 flex items-center gap-4">
            <button type="button" onClick={prev} aria-label="Slide trước" className="rounded-full p-1 text-(--brand-forest-muted) transition hover:text-(--brand-forest)">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex gap-2">
              {LANDING_HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-(--brand-forest)' : 'w-2 bg-(--brand-forest)/30'}`}
                />
              ))}
            </div>
            <button type="button" onClick={next} aria-label="Slide tiếp" className="rounded-full p-1 text-(--brand-forest-muted) transition hover:text-(--brand-forest)">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
