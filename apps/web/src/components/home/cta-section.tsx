// Call-to-action section — "Đặt hàng ngay" banner at bottom of home page

import Link from 'next/link';
import { CONTACT_PHONE } from '@/lib/constants';

export default function CtaSection() {
  return (
    <section className="bg-gradient-to-r from-green-700 to-green-600 text-white py-14">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Đặt hàng ngay hôm nay
        </h2>
        <p className="text-green-100 text-base md:text-lg mb-8 max-w-xl mx-auto">
          Giao hàng toàn quốc. Đảm bảo chất lượng, hoàn tiền nếu không hài lòng.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="bg-yellow-400 text-green-900 font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors"
          >
            Xem sản phẩm
          </Link>
          <a
            href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
            className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
          >
            Gọi {CONTACT_PHONE}
          </a>
        </div>
      </div>
    </section>
  );
}
