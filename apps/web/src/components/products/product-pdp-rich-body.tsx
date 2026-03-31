interface ProductPdpRichBodyProps {
  html: string | null | undefined;
}

export default function ProductPdpRichBody({ html }: ProductPdpRichBodyProps) {
  if (!html) return null;

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-bold text-green-950 mb-4">Cau chuyen san pham</h2>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{html}</p>
    </section>
  );
}
