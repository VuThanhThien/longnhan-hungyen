// Category navigation cards — 3 link cards below hero
import Image from 'next/image';
import Link from 'next/link';
import { LANDING_CATEGORIES } from '@/data/landing-page-content';

export function CategoryNavCards() {
  return (
    <section className="bg-(--brand-cream) px-4 py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-3">
        {LANDING_CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group flex items-center gap-4 rounded-xl border border-(--brand-forest)/10 bg-white px-5 py-4 shadow-sm transition hover:border-(--brand-gold)/50 hover:shadow-md"
          >
            <Image
              src={cat.iconSrc}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <span className="flex-1 text-sm font-semibold text-(--brand-forest) group-hover:text-(--brand-leaf)">
              {cat.label}
            </span>
            <svg
              className="h-4 w-4 shrink-0 text-(--brand-forest-muted) transition group-hover:translate-x-0.5 group-hover:text-(--brand-leaf)"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ))}
      </div>
    </section>
  );
}
