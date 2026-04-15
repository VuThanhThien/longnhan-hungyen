import Image from 'next/image';
import {
  LANDING_BRAND,
  LANDING_CHANNELS,
  LANDING_HERO,
} from '@/data/landing-page-content';
import { SectionTitleLinkButton } from '@/components/ui/section-title-link-button';

export function LandingHero() {
  const lines = LANDING_HERO.headline.split('\n');

  return (
    <section className="relative overflow-hidden border-b border-(--brand-gold)/25 bg-linear-to-b from-(--brand-cream) via-[#eef4ec] to-(--brand-cream)">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url('/bg-body-pattern.svg')`,
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
            <SectionTitleLinkButton
              actionLabel={LANDING_HERO.primaryCta}
              type="primary"
              ariaLabel={
                typeof LANDING_HERO.primaryCta === 'string'
                  ? LANDING_HERO.primaryCta
                  : undefined
              }
              href="/products"
            />
            {LANDING_CHANNELS.shopee.href ? (
              <SectionTitleLinkButton
                actionLabel={LANDING_HERO.secondaryCta}
                ariaLabel={
                  typeof LANDING_HERO.secondaryCta === 'string'
                    ? LANDING_HERO.secondaryCta
                    : undefined
                }
                href={LANDING_CHANNELS.shopee.href}
              />
            ) : null}
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
