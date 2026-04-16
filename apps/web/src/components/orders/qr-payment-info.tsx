'use client';

import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';

interface QrPaymentInfoProps {
  totalAmount?: number;
  orderCode?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export default function QrPaymentInfo({
  totalAmount,
  orderCode,
}: QrPaymentInfoProps) {
  const accountNumberDisplay = useMemo(() => '1903 7998 4020 11', []);
  const accountNumberRaw = useMemo(
    () => accountNumberDisplay.replace(/\s+/g, ''),
    [accountNumberDisplay],
  );
  const [didCopyAccount, setDidCopyAccount] = useState(false);

  const copyAccountNumber = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(accountNumberRaw);
      setDidCopyAccount(true);
      window.setTimeout(() => setDidCopyAccount(false), 1200);
    } catch {
      // ignore; clipboard may be blocked
    }
  }, [accountNumberRaw]);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm flex flex-col lg:flex-row gap-5">
      <div className="flex flex-col gap-2">
        <h4 className="font-semibold text-blue-900 mb-3">
          Thông tin chuyển khoản
        </h4>

        <ul className="space-y-1 text-blue-800">
          <li>
            <span className="font-medium">Ngân hàng:</span> Techcombank
          </li>
          <li>
            <span className="font-medium">Số tài khoản:</span>{' '}
            <button
              type="button"
              onClick={copyAccountNumber}
              className="group relative inline-flex items-center rounded-lg px-2 py-1 font-mono font-semibold text-blue-900 underline decoration-blue-300 underline-offset-4 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
              aria-label="Sao chép số tài khoản"
              title="Nhấn để sao chép"
            >
              {accountNumberDisplay}
              <span className="pointer-events-none absolute -top-2 left-1/2 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-sm group-hover:block group-focus-visible:block">
                {didCopyAccount ? 'Đã sao chép' : 'Sap chép'}
              </span>
            </button>
          </li>
          <li>
            <span className="font-medium">Chủ tài khoản:</span> VU THANH THIEN
          </li>
          {totalAmount != null && (
            <li>
              <span className="font-medium">Số tiền:</span>{' '}
              {formatPrice(totalAmount)}
            </li>
          )}
          {orderCode && (
            <li>
              <span className="font-medium">Nội dung CK:</span>{' '}
              <span className="font-mono font-bold">{orderCode}</span>
            </li>
          )}
        </ul>
        <p className="mt-3 text-xs text-blue-600 max-w-xs whitespace-normal">
          Vui lòng chuyển khoản trong vòng 24 giờ. Đơn hàng sẽ được xác nhận sau
          khi nhận thanh toán.
        </p>
      </div>
      <div className="mb-4 flex justify-center">
        <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
          <Image
            src="/my-qr.jpeg"
            alt="Mã QR chuyển khoản Techcombank"
            width={920}
            height={920}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
    </div>
  );
}
