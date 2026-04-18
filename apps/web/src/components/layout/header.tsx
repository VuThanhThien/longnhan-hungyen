import Image from 'next/image';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { CONTACT_PHONE } from '@/lib/constants';
import { formatPhoneDisplay } from '@/lib/format-phone-display';
import { LANDING_BRAND } from '@/data/landing-page-content';
import HeaderCartButton from './header-cart-button';
import HeaderSearchBar from './header-search-bar';
import MobileNav from './mobile-nav';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/articles', label: 'Bài viết' },
];

export default function Header() {
  const tel = CONTACT_PHONE.replace(/\s/g, '');
  const phoneDisplay = formatPhoneDisplay(CONTACT_PHONE);

  return (
    <header className="sticky top-0 z-50 border-b border-(--brand-forest)/10 bg-(--brand-cream)/95 shadow-sm backdrop-blur-md">
      <div className="relative mx-auto flex min-h-17 max-w-6xl items-center gap-3 px-4 py-2 md:min-h-18 md:gap-4">
        <Link href="/" className="relative z-10 flex shrink-0 items-center">
          <Image
            src={LANDING_BRAND.logoSrc}
            alt={LANDING_BRAND.logoAlt}
            width={72}
            height={72}
            className="h-14 w-14 object-contain md:h-18 md:w-18"
            priority
          />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <HeaderSearchBar className="w-full max-w-xl" />
        </div>

        <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={`tel:${tel}`}
            className="hidden items-center gap-2.5 rounded-full border-2 border-(--brand-gold)/55 bg-linear-to-br from-(--brand-gold)/20 via-(--brand-cream) to-(--brand-gold)/10 px-3 py-1.5 text-(--brand-forest) shadow-sm transition hover:border-(--brand-gold) hover:shadow-md sm:inline-flex sm:px-4 sm:py-2"
          >
            <Phone className="h-4 w-4" strokeWidth={2} aria-hidden />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-(--brand-forest-muted) sm:text-[11px]">
                Giao hàng tận nơi
              </span>
              <span className="text-sm font-bold tabular-nums">
                {phoneDisplay}
              </span>
            </span>
          </a>

          <div
            className="hidden h-8 w-px bg-(--brand-forest)/15 sm:block"
            aria-hidden
          />

          <HeaderCartButton />

          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  );
}
