// Seasonal urgency strip — shown above hero when enabled in LANDING_URGENCY
import { LANDING_URGENCY } from '@/data/landing-page-content';

export function LandingUrgencyStrip() {
  if (!LANDING_URGENCY.enabled) return null;

  return (
    <div className="border-b border-(--brand-gold)/30 bg-(--brand-gold)/15 px-4 py-2 text-center text-sm text-(--brand-forest)">
      🌟 {LANDING_URGENCY.message}
    </div>
  );
}
