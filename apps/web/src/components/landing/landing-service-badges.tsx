// Service badges strip — shows delivery/consult/COD trust signals below hero
import { LANDING_SERVICE_BADGES } from '@/data/landing-page-content';

const icons: Record<string, React.ReactNode> = {
  truck: (
    <svg
      className="h-6 w-6 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h1m8-1V8l4 4h2a1 1 0 011 1v3l-1 1h-1m-6 0h6"
      />
    </svg>
  ),
  chat: (
    <svg
      className="h-6 w-6 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  cash: (
    <svg
      className="h-6 w-6 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
};

export function LandingServiceBadges() {
  return (
    <section className="border-b border-(--brand-gold)/20 bg-(--brand-cream) px-4 py-8">
      <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-6 md:gap-12">
        {LANDING_SERVICE_BADGES.map((badge) => (
          <div
            key={badge.label}
            className="flex items-center gap-3 text-(--brand-forest)"
          >
            <div className="text-(--brand-leaf)">{icons[badge.icon]}</div>
            <div>
              <p className="text-sm font-semibold">{badge.label}</p>
              <p className="text-xs text-(--brand-forest-muted)">
                {badge.sublabel}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
