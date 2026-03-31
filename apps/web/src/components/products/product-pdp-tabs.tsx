'use client';

import { useMemo, useState } from 'react';
import type { Product } from '@longnhan/types';

interface ProductPdpTabsProps {
  product: Product;
}

type TabId = 'description' | 'extra' | 'reviews';

function buildSpecRows(product: Product): Array<{ key: string; value: string }> {
  const minWeight = Math.min(
    ...product.variants
      .map((variant) => variant.weightG ?? variant.weightGrams ?? 0)
      .filter((weight) => weight > 0),
  );
  const maxWeight = Math.max(
    ...product.variants
      .map((variant) => variant.weightG ?? variant.weightGrams ?? 0)
      .filter((weight) => weight > 0),
  );

  return [
    { key: 'Danh muc', value: product.category || 'Long nhan' },
    {
      key: 'Khoi luong',
      value: Number.isFinite(minWeight) && Number.isFinite(maxWeight) && minWeight > 0
        ? minWeight === maxWeight
          ? `${minWeight}g`
          : `${minWeight}g - ${maxWeight}g`
        : 'Nhieu quy cach',
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
          { id: 'description' as const, label: 'Mo ta' },
          { id: 'extra' as const, label: 'Thong tin bo sung' },
          { id: 'reviews' as const, label: 'Danh gia' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'text-green-800 border-b-2 border-green-700'
                : 'text-gray-500 hover:text-green-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {activeTab === 'description' ? (
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description ?? 'Dang cap nhat.'}
          </p>
        ) : null}

        {activeTab === 'extra' ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-b border-gray-100 last:border-b-0">
                    <th className="w-44 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700">
                      {row.key}
                    </th>
                    <td className="px-4 py-3 text-gray-700">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {activeTab === 'reviews' ? (
          <p className="text-sm text-gray-600">Tinh nang danh gia se cap nhat trong phien ban tiep theo.</p>
        ) : null}
      </div>
    </section>
  );
}
