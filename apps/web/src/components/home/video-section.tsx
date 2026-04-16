'use client';

// YouTube embed section — featured video + thumbnail carousel

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

interface VideoSectionProps {
  videoUrls?: (string | null | undefined)[] | null;
}

function getYouTubeId(url: string): string | null {
  // Supported:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  const patterns = [
    /[?&]v=([^"&?/\s]{11})/i,
    /youtu\.be\/([^"&?/\s]{11})/i,
    /youtube\.com\/embed\/([^"&?/\s]{11})/i,
    /youtube\.com\/shorts\/([^"&?/\s]{11})/i,
    /youtube\.com\/v\/([^"&?/\s]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export default function VideoSection({ videoUrls }: VideoSectionProps) {
  const urls = useMemo(
    () => (videoUrls ?? []).filter(Boolean) as string[],
    [videoUrls],
  );
  const [active, setActive] = useState(0);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const videoIds = useMemo(() => {
    const ids = urls.map((u) => getYouTubeId(u)).filter(Boolean) as string[];
    return Array.from(new Set(ids));
  }, [urls]);

  const safeActive = Math.min(active, Math.max(0, videoIds.length - 1));
  const activeId = videoIds[safeActive];

  useEffect(() => {
    if (!videoIds[safeActive]) return;
    thumbRefs.current[safeActive]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [safeActive, videoIds]);

  const prev = () =>
    setActive((a) => (a - 1 + videoIds.length) % videoIds.length);
  const next = () => setActive((a) => (a + 1) % videoIds.length);

  if (urls.length === 0 || videoIds.length === 0 || !activeId) return null;

  return (
    <section id="video" className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
          Quy Trình Sản Xuất
        </h2>
        <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
          <iframe
            key={activeId}
            src={`https://www.youtube.com/embed/${activeId}?rel=0&modestbranding=1`}
            title="Video giới thiệu Long Nhãn Hưng Yên"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>

        {videoIds.length > 1 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Video {safeActive + 1}/{videoIds.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Video trước"
                  className="rounded-full border border-border/60 bg-white px-3 py-2 text-sm text-foreground shadow-sm transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  Trước
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Video tiếp"
                  className="rounded-full border border-border/60 bg-white px-3 py-2 text-sm text-foreground shadow-sm transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  Tiếp
                </button>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {videoIds.map((id, idx) => {
                const isActive = idx === safeActive;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActive(idx)}
                    aria-label={`Chọn video ${idx + 1}`}
                    aria-current={isActive ? 'true' : undefined}
                    ref={(el) => {
                      thumbRefs.current[idx] = el;
                    }}
                    className={[
                      'relative shrink-0 overflow-hidden rounded-lg border shadow-sm transition',
                      'w-40 sm:w-44',
                      'snap-start',
                      isActive
                        ? 'border-ring ring-2 ring-ring/15'
                        : 'border-border/50 hover:border-border/80',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                    ].join(' ')}
                  >
                    <Image
                      src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                      alt={`Video thumbnail ${idx + 1}`}
                      width={480}
                      height={360}
                      sizes="(max-width: 640px) 160px, 176px"
                      className="aspect-video w-full object-cover"
                    />
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
                        {isActive ? 'Đang xem' : 'Xem'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
