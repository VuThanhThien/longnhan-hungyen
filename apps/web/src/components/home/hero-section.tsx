// Hero banner section — full-width landing with tagline and CTA

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-green-800 to-green-600 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center gap-6">
        <span className="text-5xl md:text-7xl" aria-hidden="true">🌿</span>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-2xl">
          Long Nhãn Hưng Yên<br />
          <span className="text-yellow-300">Đặc Sản Chính Gốc</span>
        </h1>
        <p className="text-lg md:text-xl text-green-100 max-w-xl leading-relaxed">
          Nhãn lồng Hưng Yên tươi ngon, long nhãn sấy khô thơm dịu.
          Thu hái tự nhiên, không hóa chất. Giao hàng toàn quốc.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Link
            href="/products"
            className="bg-yellow-400 text-green-900 font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors text-base"
          >
            Xem sản phẩm
          </Link>
          <a
            href="#video"
            className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors text-base"
          >
            Tìm hiểu thêm
          </a>
        </div>
      </div>

      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-white" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
    </section>
  );
}
