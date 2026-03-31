import { LANDING_PRODUCT_TYPES, LANDING_QUALITY } from '@/data/landing-page-content';
import { SectionHeading } from './section-heading';

export function LandingProductQuality() {
  return (
    <section className="border-y border-[var(--brand-forest)]/10 bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title={LANDING_PRODUCT_TYPES.sectionTitle}
          subtitle={LANDING_PRODUCT_TYPES.sectionSubtitle}
        />
        <ul className="mb-24 grid gap-6 sm:grid-cols-3">
          {LANDING_PRODUCT_TYPES.items.map((item) => (
            <li
              key={item.title}
              className="rounded-sm border border-[var(--brand-forest)]/12 bg-[var(--brand-cream)]/50 p-8 shadow-sm transition hover:border-[var(--brand-gold)]/40 hover:shadow-md"
            >
              <h3 className="landing-heading text-xl font-semibold text-[var(--brand-forest)]">{item.title}</h3>
              <p className="mt-3 text-[var(--brand-forest-muted)] leading-relaxed">{item.description}</p>
            </li>
          ))}
        </ul>
        <SectionHeading
          title={LANDING_QUALITY.sectionTitle}
          subtitle={LANDING_QUALITY.sectionSubtitle}
        />
        <ul className="mx-auto max-w-3xl space-y-4">
          {LANDING_QUALITY.bullets.map((line) => (
            <li
              key={line}
              className="flex gap-3 text-[var(--brand-forest-muted)] leading-relaxed before:mt-2 before:h-2 before:w-2 before:shrink-0 before:rounded-full before:bg-[var(--brand-leaf)] before:content-['']"
            >
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
