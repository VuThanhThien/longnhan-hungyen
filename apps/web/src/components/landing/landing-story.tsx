import { LANDING_ORIGIN } from '@/data/landing-page-content';
import { SectionHeading } from './section-heading';

export function LandingStory() {
  return (
    <section className="bg-[var(--brand-cream)] px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          title={LANDING_ORIGIN.sectionTitle}
          subtitle={LANDING_ORIGIN.sectionSubtitle}
        />
        <div className="space-y-6 text-lg leading-[1.85] text-[var(--brand-forest-muted)]">
          {LANDING_ORIGIN.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
