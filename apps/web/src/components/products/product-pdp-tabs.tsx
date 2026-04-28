'use client';

import { useMemo, useState } from 'react';
import type { Product } from '@longnhan/types';

interface ProductPdpTabsProps {
  product: Product;
}

type TabId = 'description' | 'extra';

function buildSpecRows(
  product: Product,
): Array<{ key: string; value: string }> {
  const weights = product.variants
    .map((variant) => variant.weightG ?? variant.weightGrams ?? 0)
    .filter((weight) => weight > 0);
  const minWeight = weights.length > 0 ? Math.min(...weights) : 0;
  const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;

  return [
    { key: 'Danh mục', value: product.category || 'Long nhãn' },
    {
      key: 'Khối lượng',
      value:
        Number.isFinite(minWeight) &&
        Number.isFinite(maxWeight) &&
        minWeight > 0
          ? minWeight === maxWeight
            ? `${minWeight}g`
            : `${minWeight}g - ${maxWeight}g`
          : 'Nhiều quy cách',
    },
  ];
}

export default function ProductPdpTabs({ product }: ProductPdpTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('description');
  const rows = useMemo(() => buildSpecRows(product), [product]);

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-wrap border-b border-gray-200">
        {[
          { id: 'description' as const, label: 'Mô tả' },
          { id: 'extra' as const, label: 'Thông tin bổ sung' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-gray-500 hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {activeTab === 'description'
          ? product.descriptionHtml && (
              <div
                className="article-body tiptap ProseMirror simple-editor max-w-none"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            )
          : null}

        {activeTab === 'extra' ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <th className="w-28 bg-gray-50 px-3 py-3 text-left sm:w-44 sm:px-4">
                      {row.key}
                    </th>
                    <td className="px-4 py-3 text-gray-700">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
