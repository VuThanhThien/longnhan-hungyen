// Stats bar — order count, years experience, satisfaction rate
import { LANDING_STATS } from '@/data/landing-page-content';

export function LandingStatsBar() {
  return (
    <section className="bg-(--brand-forest) px-4 py-10">
      <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-10 md:gap-20">
        {LANDING_STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-bold text-(--brand-gold)">{stat.value}</p>
            <p className="mt-1 text-sm text-green-200">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
