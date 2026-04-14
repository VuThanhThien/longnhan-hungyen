import {
  LANDING_NUTRITION,
  LANDING_PRICING,
  LANDING_SEASON,
} from '@/data/landing-page-content';
import { SectionHeading } from './section-heading';

export function LandingNutritionSeason() {
  return (
    <section className="bg-gradient-to-b from-[#e8efe4] to-[var(--brand-cream)] px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionHeading
              align="left"
              title={LANDING_NUTRITION.sectionTitle}
              subtitle={LANDING_NUTRITION.sectionSubtitle}
            />
            <p className="mb-6 text-[var(--brand-forest-muted)] leading-relaxed">
              {LANDING_NUTRITION.intro}
            </p>
            <ul className="space-y-4">
              {LANDING_NUTRITION.bullets.map((line) => (
                <li
                  key={line}
                  className="border-l-2 border-[var(--brand-gold)] pl-4 text-[var(--brand-forest-muted)] leading-relaxed"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-10">
            <div className="rounded-sm border border-[var(--brand-forest)]/15 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
              <h3 className="landing-heading text-2xl font-semibold text-[var(--brand-forest)]">
                {LANDING_SEASON.sectionTitle}
              </h3>
              <p className="mt-4 text-[var(--brand-forest-muted)] leading-relaxed">
                {LANDING_SEASON.body}
              </p>
            </div>
            <div className="rounded-sm border border-[var(--brand-gold)]/35 bg-[var(--brand-forest)] p-8 text-[var(--brand-cream)] shadow-lg">
              <h3 className="landing-heading text-2xl font-semibold text-[var(--brand-cream)]">
                {LANDING_PRICING.sectionTitle}
              </h3>
              <p className="mt-4 text-green-100/90 leading-relaxed">
                {LANDING_PRICING.body}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
