import Image from 'next/image';
import Link from 'next/link';
import { CONTACT_PHONE } from '@/lib/constants';
import { LANDING_BRAND } from '@/data/landing-page-content';
import MobileNav from './mobile-nav';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/articles', label: 'Tin tức' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--brand-forest)]/10 bg-[var(--brand-cream)]/95 shadow-sm backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={LANDING_BRAND.logoSrc}
            alt={LANDING_BRAND.logoAlt}
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 object-contain"
          />
          <span className="hidden flex-col sm:flex">
            <span className="landing-heading text-base font-semibold leading-tight text-[var(--brand-forest)]">
              {LANDING_BRAND.name}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[var(--brand-gold-dark)]">
              {LANDING_BRAND.specialtyLine}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--brand-forest-muted)] transition hover:text-[var(--brand-leaf)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
            className="hidden items-center gap-1.5 text-sm font-semibold text-[var(--brand-forest)] sm:inline-flex"
          >
            <svg className="h-4 w-4 text-[var(--brand-leaf)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {CONTACT_PHONE}
          </a>
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  );
}
