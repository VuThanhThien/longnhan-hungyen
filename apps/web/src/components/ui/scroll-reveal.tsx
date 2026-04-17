'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isRoughlyInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh * 0.92 && rect.bottom > vh * 0.08;
}

/**
 * Fade/slide-in when the block enters the viewport. SSR and the first HTML
 * response stay fully visible so text remains available to crawlers; below-the-fold
 * blocks switch to the hidden state before paint (layout effect) to avoid a flash.
 */
export default function ScrollReveal({
  children,
  delayMs = 0,
  className = '',
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(true);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element || prefersReducedMotion()) {
      return;
    }
    if (isRoughlyInViewport(element)) {
      return;
    }
    queueMicrotask(() => {
      setRevealed(false);
    });
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    if (prefersReducedMotion() || isRoughlyInViewport(element)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties = { transitionDelay: `${delayMs}ms` };

  return (
    <div
      ref={containerRef}
      style={style}
      className={`transform-gpu transition-all duration-700 ease-out will-change-transform ${
        revealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}
