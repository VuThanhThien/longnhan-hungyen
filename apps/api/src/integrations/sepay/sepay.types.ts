export type SepayEnv = 'sandbox' | 'production';

export type SepayIpnPayload = {
  timestamp: number;
  notification_type: 'ORDER_PAID' | string;
  order: {
    order_invoice_number: string;
    order_amount?: string;
    order_currency?: string;
    order_status?: string;
    [k: string]: unknown;
  };
  transaction: {
    id: string;
    transaction_id: string;
    transaction_status: 'APPROVED' | string;
    transaction_amount?: string;
    transaction_currency?: string;
    transaction_date?: string;
    payment_method?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
};

export type SepayCheckoutFields = Record<string, string | number | undefined>;

export type SepayCheckoutResponse = {
  url: string;
  fields: Record<string, string>;
};

export type SepayVerifiedPayment = {
  status: 'APPROVED' | 'DECLINED' | 'PENDING' | string;
  amount: number;
  currency: string;
  paidAt?: Date;
  sepayTransactionId?: string;
};
