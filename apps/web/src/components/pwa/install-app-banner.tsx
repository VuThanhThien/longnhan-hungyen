'use client';

import { X } from 'lucide-react';
import { useCallback, useLayoutEffect, useState } from 'react';
import { PWA_CONFIG } from '@/lib/pwa-config';

const STORAGE_KEY = 'longnhan-pwa-install-banner-dismissed';

const INSTALL_AVAILABLE = 'longnhan:pwa-install-available';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isBiPE(e: Event): e is BeforeInstallPromptEvent {
  return (
    'prompt' in e &&
    typeof (e as BeforeInstallPromptEvent).prompt === 'function'
  );
}

function isInstallDismissedInStorage(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Last captured prompt; cleared after prompt() or dismiss. */
let deferredPrompt: BeforeInstallPromptEvent | null = null;

let listenerAttached = false;

/**
 * Attach as soon as this client chunk loads so we do not miss a synchronous
 * `beforeinstallprompt` before React effects run.
 */
function ensureBeforeInstallListener() {
  if (typeof window === 'undefined' || listenerAttached) return;
  listenerAttached = true;

  window.addEventListener('beforeinstallprompt', (e) => {
    if (!isBiPE(e)) return;

    // User asked to hide our banner: do NOT preventDefault so Chrome can still
    // show its default install affordance; avoids "preventDefault but no prompt()" warning.
    if (isInstallDismissedInStorage()) {
      deferredPrompt = null;
      return;
    }

    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent(INSTALL_AVAILABLE));
  });
}

ensureBeforeInstallListener();

/**
 * Chromium: custom install banner when `beforeinstallprompt` fires.
 * Safari/iOS: use Share → Add to Home Screen.
 */
export function InstallAppBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(true);

  useLayoutEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        setDismissed(isInstallDismissedInStorage());
      } catch {
        setDismissed(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const sync = () => {
      if (deferredPrompt && !isInstallDismissedInStorage()) {
        setDeferred(deferredPrompt);
      }
    };

    sync();
    window.addEventListener(INSTALL_AVAILABLE, sync);
    return () => window.removeEventListener(INSTALL_AVAILABLE, sync);
  }, []);

  const dismiss = useCallback(() => {
    deferredPrompt = null;
    setDismissed(true);
    setDeferred(null);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const install = useCallback(async () => {
    const p = deferredPrompt ?? deferred;
    if (!p) return;
    await p.prompt();
    try {
      await p.userChoice;
    } catch {
      /* ignore */
    }
    deferredPrompt = null;
    setDeferred(null);
  }, [deferred]);

  if (dismissed || !deferred) return null;

  return (
    <div
      className="fixed bottom-20 left-3 right-3 z-[100] md:bottom-6 md:left-auto md:right-6 md:max-w-sm"
      role="dialog"
      aria-label="Cài đặt ứng dụng"
    >
      <div className="flex items-start gap-3 rounded-xl border border-(--border) bg-(--surface) p-4 shadow-lg">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-(--foreground)">
            Cài đặt {PWA_CONFIG.name}
          </p>
          <p className="mt-1 text-xs leading-snug text-(--muted-foreground)">
            Thêm vào màn hình chính để mở nhanh và xem nội dung khi mạng yếu.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={install}
              className="rounded-lg bg-(--primary) px-3 py-1.5 text-xs font-semibold text-(--primary-foreground) hover:opacity-90"
            >
              Cài đặt
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg border border-(--border) px-3 py-1.5 text-xs font-medium text-(--foreground) hover:bg-(--muted)"
            >
              Để sau
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
          aria-label="Đóng"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
