import { CONTACT_PHONE } from '@/lib/constants';
import { LANDING_CHANNELS } from '@/data/landing-page-content';
import { SectionHeading } from './section-heading';

const tel = CONTACT_PHONE.replace(/\s/g, '');

function ChannelCard({
  title,
  description,
  href,
  ctaLabel,
}: {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}) {
  if (!href) {
    return (
      <div className="flex flex-col rounded-sm border border-dashed border-[var(--brand-forest)]/25 bg-[var(--brand-cream)]/40 p-6">
        <h3 className="landing-heading text-lg font-semibold text-[var(--brand-forest)]">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-[var(--brand-forest-muted)] leading-relaxed">
          {description}
        </p>
        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[var(--brand-gold-dark)]">
          Đang cập nhật liên kết
        </p>
      </div>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-sm border border-[var(--brand-forest)]/15 bg-white p-6 shadow-sm transition hover:border-[var(--brand-leaf)] hover:shadow-md"
    >
      <h3 className="landing-heading text-lg font-semibold text-[var(--brand-forest)] group-hover:text-[var(--brand-leaf)]">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-[var(--brand-forest-muted)] leading-relaxed">
        {description}
      </p>
      <span className="mt-4 text-sm font-semibold text-[var(--brand-gold-dark)]">
        {ctaLabel} →
      </span>
    </a>
  );
}

export function LandingChannels() {
  return (
    <section className="bg-[var(--brand-cream)] px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title={LANDING_CHANNELS.sectionTitle}
          subtitle={LANDING_CHANNELS.sectionSubtitle}
        />
        <div className="mb-10 rounded-sm border border-[var(--brand-forest)]/12 bg-white p-8 shadow-sm md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <h3 className="landing-heading text-xl font-semibold text-[var(--brand-forest)]">
              {LANDING_CHANNELS.codLabel}
            </h3>
            <p className="mt-2 max-w-xl text-[var(--brand-forest-muted)]">
              {LANDING_CHANNELS.codDescription}
            </p>
          </div>
          <div className="mt-6 flex shrink-0 flex-col gap-3 sm:flex-row md:mt-0">
            <a
              href={`tel:${tel}`}
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-[var(--brand-forest)] px-6 text-sm font-semibold text-[var(--brand-cream)] transition hover:bg-[var(--brand-forest-soft)]"
            >
              {LANDING_CHANNELS.phoneCta}
            </a>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <ChannelCard
            title={LANDING_CHANNELS.shopee.label}
            description={LANDING_CHANNELS.shopee.description}
            href={LANDING_CHANNELS.shopee.href}
            ctaLabel="Mở Shopee"
          />
          <ChannelCard
            title={LANDING_CHANNELS.tiktok.label}
            description={LANDING_CHANNELS.tiktok.description}
            href={LANDING_CHANNELS.tiktok.href}
            ctaLabel="Mở TikTok"
          />
          <ChannelCard
            title={LANDING_CHANNELS.zalo.label}
            description={LANDING_CHANNELS.zalo.description}
            href={LANDING_CHANNELS.zalo.href}
            ctaLabel="Mở Zalo"
          />
        </div>
      </div>
    </section>
  );
}
