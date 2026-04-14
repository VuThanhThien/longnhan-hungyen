// Floating sticky contact widget — desktop left pill panel + mobile bottom bar
// Always visible, provides quick access to phone/Zalo/Facebook

import { CONTACT_PHONE, SOCIAL_LINKS } from '@/lib/constants';

const tel = `tel:${CONTACT_PHONE.replace(/\s/g, '')}`;

const contacts = [
  {
    href: tel,
    label: 'Gọi điện',
    aria: 'Gọi điện thoại',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    ),
  },
  {
    href: SOCIAL_LINKS.zalo || tel,
    label: 'Chat Zalo',
    aria: 'Chat qua Zalo',
    external: true,
    icon: (
      <svg
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
      </svg>
    ),
  },
  {
    href: SOCIAL_LINKS.facebook || tel,
    label: 'Facebook',
    aria: 'Nhắn tin Facebook',
    external: true,
    icon: (
      <svg
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
];

export default function FloatingContactWidget() {
  return (
    <>
      {/* Desktop: fixed left pill panel */}
      <div className="fixed left-4 bottom-24 z-50 hidden flex-col gap-2 md:flex">
        {contacts.map((c) => (
          <a
            key={c.label}
            href={c.href}
            aria-label={c.aria}
            {...(c.external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            className="flex items-center gap-2 rounded-full border border-(--brand-gold)/40 bg-(--brand-cream) px-3 py-2 text-xs font-semibold text-(--brand-forest) shadow-md transition hover:bg-(--brand-gold)/10 hover:text-white"
          >
            {c.icon}
            <span>{c.label}</span>
          </a>
        ))}
      </div>

      {/* Mobile: fixed bottom bar */}
      <div
        className="fixed bottom-0 inset-x-0 z-50 flex justify-around border-t border-(--brand-gold)/25 bg-(--brand-cream) py-2 shadow-lg md:hidden"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
      >
        {contacts.map((c) => (
          <a
            key={c.label}
            href={c.href}
            aria-label={c.aria}
            {...(c.external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            className="flex flex-col items-center gap-0.5 px-4 text-(--brand-forest)"
          >
            {c.icon}
            <span className="text-[10px] font-medium">{c.label}</span>
          </a>
        ))}
      </div>
    </>
  );
}
