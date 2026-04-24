import { OrderEntity } from '@/api/orders/entities/order.entity';
import { AllConfigType } from '@/config/config.type';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SePayPgClient } from 'sepay-pg-node';
import { SepayCheckoutResponse, SepayVerifiedPayment } from './sepay.types';

@Injectable()
export class SepayService {
  private client: SePayPgClient;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    const env = this.configService.getOrThrow('sepay.env', { infer: true });
    const merchant_id = this.configService.getOrThrow('sepay.merchantId', {
      infer: true,
    });
    const secret_key = this.configService.getOrThrow('sepay.secretKey', {
      infer: true,
    });

    this.client = new SePayPgClient({
      env,
      merchant_id,
      secret_key,
    });
  }

  getCheckoutUrl(): string {
    return this.client.checkout.initCheckoutUrl();
  }

  buildCheckoutFields(order: OrderEntity): SepayCheckoutResponse {
    const webBaseUrl = this.configService.getOrThrow('sepay.webBaseUrl', {
      infer: true,
    });

    const fields = this.client.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: order.code,
      order_amount: order.total,
      currency: 'VND',
      order_description: `Thanh toan don hang ${order.code}`,
      success_url: `${webBaseUrl}/checkout/success?orderCode=${order.code}`,
      error_url: `${webBaseUrl}/checkout/error?orderCode=${order.code}`,
      cancel_url: `${webBaseUrl}/checkout/cancel?orderCode=${order.code}`,
    });

    return {
      url: this.getCheckoutUrl(),
      fields: Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, v == null ? '' : String(v)]),
      ),
    };
  }

  /**
   * The official SDK does not expose transaction lookup by transaction ID.
   * We verify payment by pulling order detail from SePay gateway API and
   * normalizing the response.
   */
  async verifyOrderPayment(
    orderInvoiceNumber: string,
  ): Promise<SepayVerifiedPayment> {
    const res = await this.client.order.retrieve(orderInvoiceNumber);
    const payload: any = res?.data;

    const data = payload?.data ?? payload;
    const order = data?.order ?? data?.data?.order ?? data;

    const status =
      order?.order_status ??
      order?.status ??
      data?.order_status ??
      data?.status ??
      'UNKNOWN';

    const amountRaw =
      order?.order_amount ??
      order?.amount ??
      data?.order_amount ??
      data?.amount ??
      null;

    const currency =
      order?.order_currency ??
      order?.currency ??
      data?.order_currency ??
      data?.currency ??
      'VND';

    const amount =
      typeof amountRaw === 'number' ? amountRaw : Number(amountRaw);

    return {
      status,
      amount: Number.isFinite(amount) ? amount : NaN,
      currency,
    };
  }
}
