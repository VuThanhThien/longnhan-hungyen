'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const SW_PATH = '/sw.js';
const LOG_PREFIX = '[LongNhan SW]';

function isServiceWorkerEnabled() {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_ENABLE_SW === 'true'
  );
}

/**
 * Registers the service worker (prod or when NEXT_PUBLIC_ENABLE_SW=true),
 * shows offline/online toasts, and prompts SW update checks when back online.
 */
export function OfflineSupport() {
  const wasOffline = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let updateIntervalId: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const notifyOffline = () => {
      wasOffline.current = true;
      toast.warning(
        'Mất kết nối mạng. Trang chủ có thể vẫn xem được từ bản đã lưu; hãy kiểm tra kết nối để nhận nội dung mới nhất từ máy chủ.',
        {
          duration: 10_000,
          id: 'network-offline',
        },
      );
    };

    const notifyOnline = () => {
      if (wasOffline.current) {
        toast.success('Đã kết nối lại.', {
          duration: 4000,
          id: 'network-online',
        });
        wasOffline.current = false;
      }
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker
          .getRegistration()
          .then((reg) => reg?.update());
      }
    };

    const onOffline = () => notifyOffline();
    const onOnline = () => notifyOnline();

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    if (!navigator.onLine) {
      queueMicrotask(notifyOffline);
    }

    let onControllerChange: (() => void) | undefined;

    if (isServiceWorkerEnabled() && 'serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        console.log(
          `${LOG_PREFIX} page already controlled by`,
          navigator.serviceWorker.controller.scriptURL,
        );
      }

      const logWorkerStates = (
        worker: ServiceWorker | null | undefined,
        label: string,
      ) => {
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          console.log(`${LOG_PREFIX} ${label}:`, worker.state);
        });
      };

      console.log(`${LOG_PREFIX} registering…`, SW_PATH);

      onControllerChange = () => {
        console.log(
          `${LOG_PREFIX} controllerchange — new worker is active and controls this page`,
        );
      };
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        onControllerChange,
      );

      navigator.serviceWorker
        .register(SW_PATH, { scope: '/', updateViaCache: 'none' })
        .then((reg) => {
          if (cancelled) return;

          console.log(`${LOG_PREFIX} register() resolved`, {
            scope: reg.scope,
            active: reg.active?.state ?? null,
            installing: reg.installing?.state ?? null,
            waiting: reg.waiting?.state ?? null,
          });

          logWorkerStates(reg.installing, 'worker (initial)');
          logWorkerStates(reg.waiting, 'waiting worker');

          reg.addEventListener('updatefound', () => {
            console.log(`${LOG_PREFIX} update found — installing new version`);
            logWorkerStates(reg.installing, 'worker (update)');
          });

          updateIntervalId = setInterval(
            () => {
              void reg.update();
            },
            60 * 60 * 1000,
          );
        })
        .catch((err) => {
          console.error(`${LOG_PREFIX} registration failed`, err);
        });
    }

    return () => {
      cancelled = true;
      if (updateIntervalId !== undefined) {
        clearInterval(updateIntervalId);
      }
      if (onControllerChange) {
        navigator.serviceWorker.removeEventListener(
          'controllerchange',
          onControllerChange,
        );
      }
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  return null;
}
