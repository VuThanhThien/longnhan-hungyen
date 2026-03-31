import Image from 'next/image';
import { CONTACT_PHONE } from '@/lib/constants';
import {
  LANDING_BRAND,
  LANDING_CHANNELS,
  LANDING_HERO,
} from '@/data/landing-page-content';

const tel = CONTACT_PHONE.replace(/\s/g, '');

export function LandingHero() {
  const lines = LANDING_HERO.headline.split('\n');

  return (
    <section className="relative overflow-hidden border-b border-(--brand-gold)/25 bg-linear-to-b from-(--brand-cream) via-[#eef4ec] to-(--brand-cream)">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23145232' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 md:flex-row md:items-center md:py-24 lg:gap-16">
        <div className="flex flex-1 flex-col items-center md:items-start md:text-left text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-(--brand-gold-dark)">
            {LANDING_HERO.eyebrow}
          </p>
          <h1 className="landing-heading max-w-xl text-4xl font-semibold leading-tight text-(--brand-forest) sm:text-5xl lg:text-[3.25rem]">
            {lines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-(--brand-forest-muted)">
            {LANDING_HERO.subhead}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
            <a
              href={`tel:${tel}`}
              className="inline-flex min-h-12 items-center justify-center rounded-sm bg-(--brand-forest) px-8 text-sm font-semibold tracking-wide text-[var(--brand-cream)] shadow-md transition hover:bg-[var(--brand-forest-soft)]"
            >
              {LANDING_HERO.primaryCta}
            </a>
            {LANDING_CHANNELS.shopee.href ? (
              <a
                href={LANDING_CHANNELS.shopee.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-sm border-2 border-(--brand-forest) bg-transparent px-8 text-sm font-semibold text-(--brand-forest) transition hover:bg-(--brand-forest)/5"
              >
                {LANDING_HERO.secondaryCta}
              </a>
            ) : null}
            {LANDING_CHANNELS.zalo.href ? (
              <a
                href={LANDING_CHANNELS.zalo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-sm border border-(--brand-gold)/60 bg-(--brand-gold)/10 px-8 text-sm font-semibold text-(--brand-forest) transition hover:bg-(--brand-gold)/20"
              >
                {LANDING_HERO.tertiaryCta}
              </a>
            ) : (
              <a
                href={`tel:${tel}`}
                className="inline-flex min-h-12 items-center justify-center rounded-sm border border-(--brand-gold)/60 bg-(--brand-gold)/10 px-8 text-sm font-semibold text-(--brand-forest) transition hover:bg-(--brand-gold)/20"
              >
                {LANDING_HERO.tertiaryCta}
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-1 justify-center md:justify-end">
          <div className="relative aspect-square w-full max-w-[min(100%,320px)] sm:max-w-sm">
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-(--brand-gold)/30 to-transparent blur-2xl" />
            <div className="relative flex h-full items-center justify-center rounded-full border-4 border-(--brand-gold)/40 bg-(--brand-cream) p-6 shadow-xl ring-1 ring-(--brand-forest)/10">
              <Image
                src={LANDING_BRAND.logoSrc}
                alt={LANDING_BRAND.logoAlt}
                width={280}
                height={280}
                className="h-auto w-[85%] object-contain drop-shadow-md"
                priority
              />
            </div>
          </div>
        </div>
      </div>
      <p className="pb-8 text-center text-sm italic text-(--brand-forest-muted)">
        {LANDING_BRAND.tagline}
      </p>
    </section>
  );
}
