import {
  LANDING_TESTIMONIALS,
  LANDING_TRUST,
} from '@/data/landing-page-content';
import { SectionHeading } from './section-heading';

export function LandingTestimonialsTrust() {
  const hasTestimonials = LANDING_TESTIMONIALS.items.length > 0;

  return (
    <>
      {hasTestimonials ? (
        <section className="bg-white px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              title={LANDING_TESTIMONIALS.sectionTitle}
              subtitle={LANDING_TESTIMONIALS.sectionSubtitle}
            />
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {LANDING_TESTIMONIALS.items.map((t, i) => (
                <li
                  key={i}
                  className="rounded-sm border border-(--brand-forest)/10 bg-(--brand-cream)/40 p-8"
                >
                  <blockquote className="text-(--brand-forest-muted) leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <footer className="mt-4 text-sm font-semibold text-(--brand-forest)">
                    {t.author}
                    {t.location ? (
                      <span className="font-normal text-(--brand-forest-muted)">
                        {' '}
                        — {t.location}
                      </span>
                    ) : null}
                  </footer>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section className="bg-white px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-(--brand-gold-dark)">
              {LANDING_TESTIMONIALS.sectionTitle}
            </p>
            <p className="mt-2 text-(--brand-forest-muted)">
              {LANDING_TESTIMONIALS.sectionSubtitle}
            </p>
          </div>
        </section>
      )}
      <section className="border-t border-(--brand-forest)/10 bg-(--brand-cream) px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <SectionHeading title={LANDING_TRUST.sectionTitle} />
          <ul className="space-y-3 text-(--brand-forest-muted) leading-relaxed">
            {LANDING_TRUST.items.map((line) => (
              <li
                key={line}
                className="flex gap-2 before:text-(--brand-gold-dark) before:content-['✦']"
              >
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
