// QR payment info — shown when customer selects bank_transfer payment method

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
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
      <h4 className="font-semibold text-blue-900 mb-3">
        Thông tin chuyển khoản
      </h4>
      <ul className="space-y-1 text-blue-800">
        <li>
          <span className="font-medium">Ngân hàng:</span> Vietcombank
        </li>
        <li>
          <span className="font-medium">Số tài khoản:</span> 1234567890
        </li>
        <li>
          <span className="font-medium">Chủ tài khoản:</span> NGUYEN VAN A
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
      <p className="mt-3 text-xs text-blue-600">
        Vui lòng chuyển khoản trong vòng 24 giờ. Đơn hàng sẽ được xác nhận sau
        khi nhận thanh toán.
      </p>
    </div>
  );
}
