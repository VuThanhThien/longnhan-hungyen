'use client';

// Mobile navigation drawer — hamburger menu for small screens

import { useState } from 'react';
import Link from 'next/link';

interface NavLink {
  href: string;
  label: string;
}

interface MobileNavProps {
  links: NavLink[];
}

export default function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
        className="rounded p-2 text-[var(--brand-forest)] hover:text-[var(--brand-leaf)]"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-[var(--brand-forest)]/10 bg-[var(--brand-cream)] shadow-lg">
          <nav className="flex flex-col gap-4 p-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="border-b border-[var(--brand-forest)]/5 py-2 text-base font-medium text-[var(--brand-forest-muted)] last:border-0 hover:text-[var(--brand-leaf)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
