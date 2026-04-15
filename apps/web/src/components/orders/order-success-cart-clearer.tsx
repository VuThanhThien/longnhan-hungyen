'use client';

import { useEffect } from 'react';

import { useCartStore } from '@/services/cart/cart-store';

export function OrderSuccessCartClearer() {
  useEffect(() => {
    useCartStore.getState().clear();
  }, []);

  return null;
}
