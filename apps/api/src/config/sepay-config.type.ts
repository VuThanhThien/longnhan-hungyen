export type SepayConfig = {
  env: 'sandbox' | 'production';
  merchantId: string;
  secretKey: string;
  webBaseUrl: string;
  ipnPath: string;
};
