// Geographic origin badge — "Hưng Yên · Phố Hiến" pill shown in hero/story section
export function LandingOriginBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-(--brand-gold)/40 bg-(--brand-gold)/15 px-3 py-1 text-xs font-medium text-(--brand-forest)">
      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Hưng Yên · Phố Hiến
    </span>
  );
}
