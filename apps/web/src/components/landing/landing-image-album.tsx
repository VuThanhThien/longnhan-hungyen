'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface LandingImageAlbumItem {
  src: string;
  alt: string;
}

interface LandingImageAlbumProps {
  sectionTitle: string;
  sectionSubtitle?: string;
  items: LandingImageAlbumItem[];
  className?: string;
}

export function LandingImageAlbum({
  sectionTitle,
  sectionSubtitle,
  items,
  className,
}: LandingImageAlbumProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  if (items.length === 0) return null;

  const activeItem = items[active] ?? items[0];

  return (
    <section
      className={cn(
        'border-t border-(--brand-gold)/15 bg-(--brand-cream) px-4 py-14 md:py-16',
        className,
      )}
      aria-labelledby="landing-image-album-title"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center md:mb-10">
          <h2
            id="landing-image-album-title"
            className="landing-heading text-balance text-2xl font-semibold text-(--brand-forest) not-italic md:text-3xl"
          >
            {sectionTitle}
          </h2>
          {sectionSubtitle ? (
            <p className="mt-2 text-sm text-(--brand-forest-muted) md:text-base">
              {sectionSubtitle}
            </p>
          ) : null}
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {items.map((item, idx) => (
            <li key={`${item.src}-${idx}`} className="min-w-0">
              <button
                type="button"
                onClick={() => {
                  setActive(idx);
                  setOpen(true);
                }}
                className={cn(
                  'group relative aspect-square w-full overflow-hidden rounded-xl border border-(--brand-forest)/10 bg-white shadow-sm',
                  'transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold)/50',
                )}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="sr-only">Phóng to: {item.alt}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[min(100vw-2rem,56rem)] border-(--brand-forest)/10 bg-(--brand-cream) p-2 sm:p-4"
          showClose
        >
          <DialogTitle className="sr-only">{activeItem.alt}</DialogTitle>
          <div className="relative h-[min(85vh,720px)] w-full overflow-hidden rounded-lg bg-black/5">
            <Image
              src={activeItem.src}
              alt={activeItem.alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
