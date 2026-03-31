import Link from 'next/link';
import {
  SITE_NAME,
  CONTACT_PHONE,
  CONTACT_EMAIL,
  CONTACT_ADDRESS,
  SOCIAL_LINKS,
} from '@/lib/constants';
import { LANDING_FOOTER_TAGLINE } from '@/data/landing-page-content';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--brand-gold)]/25 bg-[var(--brand-forest)] text-green-100">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <h2 className="landing-heading text-lg font-semibold text-[var(--brand-cream)]">{SITE_NAME}</h2>
          <p className="mt-3 text-sm leading-relaxed text-green-200/90">{LANDING_FOOTER_TAGLINE}</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--brand-gold)]">Liên kết</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="text-green-200 transition hover:text-white">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/products" className="text-green-200 transition hover:text-white">
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/articles" className="text-green-200 transition hover:text-white">
                Tin tức
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--brand-gold)]">Liên hệ</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="text-green-200 transition hover:text-white">
                {CONTACT_PHONE}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-200 transition hover:text-white">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li className="text-green-200/90">{CONTACT_ADDRESS}</li>
            <li className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-green-200 transition hover:text-white">
                Facebook
              </a>
              <a href={SOCIAL_LINKS.zalo} target="_blank" rel="noopener noreferrer" className="text-green-200 transition hover:text-white">
                Zalo
              </a>
              {SOCIAL_LINKS.shopee ? (
                <a href={SOCIAL_LINKS.shopee} target="_blank" rel="noopener noreferrer" className="text-green-200 transition hover:text-white">
                  Shopee
                </a>
              ) : null}
              {SOCIAL_LINKS.tiktok ? (
                <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="text-green-200 transition hover:text-white">
                  TikTok
                </a>
              ) : null}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-green-800/80 py-4 text-center text-xs text-green-400/90">
        © {new Date().getFullYear()} {SITE_NAME}. Bảo lưu mọi quyền.
      </div>
    </footer>
  );
}
