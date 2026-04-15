'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LANDING_FAQ } from '@/data/landing-page-content';
import { SectionHeading } from './section-heading';

export function LandingFaq() {
  return (
    <section className="landing-section landing-section--decor-faq overflow-hidden border-y border-(--brand-gold)/20 bg-linear-to-b from-(--brand-cream) via-(--muted)/22 to-(--brand-cream) px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <SectionHeading title={LANDING_FAQ.sectionTitle} />
        <Accordion
          type="single"
          collapsible
          className="rounded-xl border border-(--brand-gold)/25 bg-(--surface) px-1 shadow-sm sm:px-2"
        >
          {LANDING_FAQ.items.map((item, index) => (
            <AccordionItem
              key={item.q}
              value={`faq-${index}`}
              className="border-(--brand-forest)/10 px-3 sm:px-4"
            >
              <AccordionTrigger className="text-left text-[15px] sm:text-base">
                {item.q}
              </AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
