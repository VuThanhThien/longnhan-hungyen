import { LANDING_FOOTER_TAGLINE } from '@/data/landing-page-content';
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  SITE_NAME,
  SOCIAL_LINKS,
} from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import { connection } from 'next/server';

export default async function Footer() {
  await connection();
  const year = new Date().getFullYear();
  // Prefer a no-key embed that works with just an address query.
  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(CONTACT_ADDRESS)}&output=embed`;

  return (
    <footer className="mt-auto border-t border-(--brand-gold)/25 bg-(--brand-forest) text-(--brand-cream)">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div>
            <h2 className="landing-heading text-lg font-semibold text-(--brand-cream)">
              {SITE_NAME}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-(--brand-cream)/80">
              {LANDING_FOOTER_TAGLINE}
            </p>
          </div>

          <div className="text-sm text-(--brand-cream)/80">
            <div className="font-semibold text-(--brand-cream)">
              Về chúng tôi
            </div>
            <div className="mt-2 space-y-1">
              <div>
                <span className="text-(--brand-cream)/60">Điện thoại: </span>
                <a
                  href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
                  className="transition hover:text-(--brand-cream)"
                >
                  {CONTACT_PHONE}
                </a>
              </div>
              <div>
                <span className="text-(--brand-cream)/60">Email: </span>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="transition hover:text-(--brand-cream)"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
              <div>
                <span className="text-(--brand-cream)/60">Địa chỉ: </span>
                <span>{CONTACT_ADDRESS}</span>
              </div>
            </div>
          </div>

          <div
            className="pt-1"
            style={{
              contentVisibility: 'auto',
              containIntrinsicSize: '98px 260px',
            }}
          >
            <Image
              src="/logo-da-thong-bao-bo-cong-thuong-mau-xanh-1.png"
              alt="Đã thông báo Bộ Công Thương"
              width={260}
              height={98}
              className="h-auto w-[220px] max-w-full"
              loading="lazy"
              fetchPriority="low"
              decoding="async"
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-(--brand-gold)">
            Hỗ trợ khách hàng
          </h3>
          <ul className="space-y-2 text-sm text-(--brand-cream)/80">
            <li>Chính sách khách hàng thân thiết</li>
            <li>Chính sách bảo mật thông tin</li>
            <li>Chính sách vận chuyển</li>
            <li>Chính sách đổi - trả hàng</li>
            <li>Chính sách thanh toán</li>
            <li>
              <Link href="/" className="transition hover:text-(--brand-cream)">
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-(--brand-gold)">
            Liên kết
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-(--brand-cream)/80 transition hover:text-(--brand-cream)"
              >
                Trang chủ
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="text-(--brand-cream)/80 transition hover:text-(--brand-cream)"
              >
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link
                href="/articles"
                className="text-(--brand-cream)/80 transition hover:text-(--brand-cream)"
              >
                Tin tức
              </Link>
            </li>
            <li className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--brand-cream)/80 transition hover:text-(--brand-cream)"
              >
                Facebook
              </a>
              <a
                href={SOCIAL_LINKS.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--brand-cream)/80 transition hover:text-(--brand-cream)"
              >
                Zalo
              </a>
              {SOCIAL_LINKS.shopee ? (
                <a
                  href={SOCIAL_LINKS.shopee}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--brand-cream)/80 transition hover:text-(--brand-cream)"
                >
                  Shopee
                </a>
              ) : null}
              {SOCIAL_LINKS.tiktok ? (
                <a
                  href={SOCIAL_LINKS.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--brand-cream)/80 transition hover:text-(--brand-cream)"
                >
                  TikTok
                </a>
              ) : null}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-(--brand-gold)">
            Chỉ đường
          </h3>
          <div className="overflow-hidden rounded-lg border border-(--brand-cream)/15 bg-(--brand-cream)">
            <iframe
              title="Google Map"
              src={mapEmbedSrc}
              width="100%"
              height="214"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block w-full"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-(--brand-cream)/15 py-4 text-center text-xs text-(--brand-cream)/60">
        © {year} {SITE_NAME}. Bảo lưu mọi quyền.
      </div>
    </footer>
  );
}
