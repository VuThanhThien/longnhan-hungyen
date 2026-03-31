'use client';

// Product image gallery with thumbnail switcher — client component for interactivity

import { useState } from 'react';
import Image from 'next/image';

interface ProductImagesProps {
  images: string[];
  productName: string;
}

export default function ProductImages({ images, productName }: ProductImagesProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-7xl text-gray-300">
        🌿
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
        <Image
          src={images[activeIndex]}
          alt={`${productName} - ảnh ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority={activeIndex === 0}
        />
      </div>

      {/* Thumbnails — only show if more than 1 image */}
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((src, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              aria-label={`Xem ảnh ${index + 1}`}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === activeIndex ? 'border-green-600' : 'border-transparent hover:border-green-300'
              }`}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
