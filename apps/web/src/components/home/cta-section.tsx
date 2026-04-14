// Call-to-action section — "Đặt hàng ngay" banner at bottom of home page

import Link from 'next/link';
import { CONTACT_PHONE } from '@/lib/constants';

export default function CtaSection() {
  return (
    <section className="bg-linear-to-r from-(--brand-forest) via-(--brand-gold-dark) to-(--brand-forest) py-14 text-(--brand-cream)">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Đặt hàng ngay hôm nay
        </h2>
        <p className="text-(--brand-cream)/85 text-base md:text-lg mb-8 max-w-xl mx-auto">
          Giao hàng toàn quốc. Đảm bảo chất lượng, hoàn tiền nếu không hài lòng.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="bg-(--brand-gold) text-(--brand-forest) font-bold px-8 py-3 rounded-full shadow-sm transition hover:bg-(--brand-gold)/90 hover:shadow-md"
          >
            Xem sản phẩm
          </Link>
          <a
            href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
            className="border-2 border-(--brand-cream)/90 text-(--brand-cream) font-semibold px-8 py-3 rounded-full transition hover:bg-(--brand-cream)/10"
          >
            Gọi {CONTACT_PHONE}
          </a>
        </div>
      </div>
    </section>
  );
}
