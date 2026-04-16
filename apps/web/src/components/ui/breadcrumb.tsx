import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbItem } from '@/lib/breadcrumb';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-(--brand-forest-muted)">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {index > 0 ? (
                <ChevronRight
                  className="mx-1 h-4 w-4 text-(--brand-forest)/35"
                  strokeWidth={2}
                  aria-hidden
                />
              ) : null}

              {item.url && !isCurrent ? (
                <Link
                  href={item.url}
                  className="rounded-sm transition-colors hover:text-(--brand-forest) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold)/60 focus-visible:ring-offset-2 focus-visible:ring-offset-(--brand-cream)"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? 'page' : undefined}
                  className={
                    isCurrent
                      ? 'font-semibold text-(--brand-forest)'
                      : 'text-(--brand-forest-muted)'
                  }
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
