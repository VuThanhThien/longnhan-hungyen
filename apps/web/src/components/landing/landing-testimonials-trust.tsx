import {
  LANDING_TESTIMONIALS,
  LANDING_TRUST,
} from '@/data/landing-page-content';
import { SectionHeading } from './section-heading';

const testimonialCardClass =
  'rounded-xl border border-(--brand-gold)/25 bg-(--surface) p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7';

const trustCardClass =
  'rounded-xl border border-(--brand-gold)/25 bg-(--surface) p-5 shadow-sm sm:p-6';

export function LandingTestimonialsTrust() {
  const hasTestimonials = LANDING_TESTIMONIALS.items.length > 0;

  return (
    <>
      {hasTestimonials ? (
        <section className="border-b border-(--brand-gold)/15 bg-linear-to-b from-(--brand-cream) via-transparent to-(--brand-cream) px-4 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              title={LANDING_TESTIMONIALS.sectionTitle}
              subtitle={LANDING_TESTIMONIALS.sectionSubtitle}
            />
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {LANDING_TESTIMONIALS.items.map((t, i) => (
                <li key={i} className={testimonialCardClass}>
                  <blockquote className="text-[15px] leading-relaxed text-(--brand-forest-muted) sm:text-base">
                    <span className="text-(--brand-gold-dark)" aria-hidden>
                      &ldquo;
                    </span>
                    {t.quote}
                    <span className="text-(--brand-gold-dark)" aria-hidden>
                      &rdquo;
                    </span>
                  </blockquote>
                  <footer className="mt-5 border-t border-(--brand-forest)/10 pt-4 text-sm font-semibold text-(--brand-forest)">
                    {t.author}
                    {t.location ? (
                      <span className="mt-0.5 block font-normal text-(--brand-forest-muted) sm:mt-0 sm:inline sm:before:content-['—_']">
                        {t.location}
                      </span>
                    ) : null}
                  </footer>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section className="border-b border-(--brand-gold)/15 bg-linear-to-b from-(--brand-cream) via-(--muted)/12 to-(--brand-cream) px-4 py-14 md:py-16">
          <div className="mx-auto max-w-2xl">
            <SectionHeading
              title={LANDING_TESTIMONIALS.sectionTitle}
              subtitle={LANDING_TESTIMONIALS.sectionSubtitle}
            />
            <div className="rounded-xl border border-dashed border-(--brand-gold)/35 bg-(--surface)/90 px-6 py-10 text-center shadow-sm">
              <p className="text-[15px] leading-relaxed text-(--brand-forest-muted) sm:text-base">
                Chúng tôi đang cập nhật nhận xét từ khách hàng tại đây. Cảm ơn
                bạn đã tin chọn Long Nhãn Tống Trân.
              </p>
            </div>
          </div>
        </section>
      )}
      <section className="overflow-hidden border-t border-(--brand-gold)/20 bg-linear-to-b from-(--brand-cream) via-(--muted)/18 to-(--brand-cream) px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading title={LANDING_TRUST.sectionTitle} />
          <ul className="grid gap-4 sm:gap-5 md:grid-cols-2">
            {LANDING_TRUST.items.map((item) => (
              <li key={item.title} className={trustCardClass}>
                <div className="flex gap-3 sm:gap-4">
                  <span
                    className="mt-0.5 shrink-0 text-lg leading-none text-(--brand-gold-dark)"
                    aria-hidden
                  >
                    ✦
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-(--brand-forest)">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-(--brand-forest-muted) sm:text-base">
                      {item.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
