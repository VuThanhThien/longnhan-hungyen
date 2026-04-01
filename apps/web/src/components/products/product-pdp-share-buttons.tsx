// Social share buttons for product detail page — Zalo and Facebook
interface ProductPdpShareButtonsProps {
  productName: string;
  productUrl: string;
}

export default function ProductPdpShareButtons({ productName, productUrl }: ProductPdpShareButtonsProps) {
  const encodedUrl = encodeURIComponent(productUrl);
  const encodedTitle = encodeURIComponent(productName);

  const zaloHref = `https://zalo.me/share/url?url=${encodedUrl}&title=${encodedTitle}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Chia sẻ:</span>
      <a
        href={zaloHref}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
      >
        Zalo
      </a>
      <a
        href={fbHref}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-blue-300 bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
      >
        Facebook
      </a>
    </div>
  );
}
