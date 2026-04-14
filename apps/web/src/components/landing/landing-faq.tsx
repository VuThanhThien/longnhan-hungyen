import { LANDING_FAQ } from '@/data/landing-page-content';
import { SectionHeading } from './section-heading';

export function LandingFaq() {
  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <SectionHeading title={LANDING_FAQ.sectionTitle} />
        <dl className="space-y-6">
          {LANDING_FAQ.items.map((item) => (
            <div
              key={item.q}
              className="rounded-sm border border-[var(--brand-forest)]/10 bg-[var(--brand-cream)]/30 p-6"
            >
              <dt className="landing-heading text-lg font-semibold text-[var(--brand-forest)]">
                {item.q}
              </dt>
              <dd className="mt-3 text-[var(--brand-forest-muted)] leading-relaxed">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
