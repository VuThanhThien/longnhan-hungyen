import type { ProductVariant } from '@longnhan/types';

interface ProductPdpSpecTableProps {
  variants: ProductVariant[];
}

export default function ProductPdpSpecTable({ variants }: ProductPdpSpecTableProps) {
  if (variants.length === 0) return null;

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-bold text-green-950 mb-4">Bang quy cach</h2>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Loai</th>
              <th className="px-4 py-3 text-left">Khoi luong</th>
              <th className="px-4 py-3 text-left">Gia</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{variant.label ?? variant.name}</td>
                <td className="px-4 py-3 text-gray-700">
                  {variant.weightG ?? variant.weightGrams
                    ? `${variant.weightG ?? variant.weightGrams}g`
                    : 'Dang cap nhat'}
                </td>
                <td className="px-4 py-3 text-green-700 font-semibold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(variant.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
