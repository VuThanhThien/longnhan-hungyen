'use client';

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { forwardRef, useImperativeHandle, useRef } from 'react';

export type CheckoutTurnstileRef = {
  reset: () => void;
};

type CheckoutTurnstileProps = {
  onToken: (token: string) => void;
  onExpire?: () => void;
};

export const CheckoutTurnstile = forwardRef<
  CheckoutTurnstileRef,
  CheckoutTurnstileProps
>(function CheckoutTurnstile({ onToken, onExpire }, ref) {
  const turnstileRef = useRef<TurnstileInstance>(null);

  useImperativeHandle(ref, () => ({
    reset: () => turnstileRef.current?.reset(),
  }));

  return (
    <Turnstile
      ref={turnstileRef}
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
      onSuccess={onToken}
      onExpire={onExpire}
      options={{ theme: 'light', size: 'flexible' }}
    />
  );
});
