'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ProductVariant } from '@longnhan/types';
import { useState, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { submitOrder } from '@/actions/order-actions';
import VariantSelector from '@/components/products/variant-selector';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PAYMENT_METHODS, PROVINCES } from '@/lib/constants';
import {
  orderCustomerSchema as orderFormSchema,
  type OrderFormValues,
} from '@/lib/validation/order/order-schemas';
import QrPaymentInfo from './qr-payment-info';

interface OrderFormProps {
  variants: ProductVariant[];
  productName: string;
}

export default function OrderForm({ variants, productName }: OrderFormProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.find(
      (v) => (v.active || v.isActive) && (v.stock ?? v.stockQuantity ?? 0) > 0,
    )?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [variantError, setVariantError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: '',
      phone: '',
      email: '',
      address: '',
      province: '',
      paymentMethod: 'cod',
      notes: '',
    },
  });

  const paymentMethod = useWatch({
    control: form.control,
    name: 'paymentMethod',
  });
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const selectedVariantStock =
    selectedVariant?.stock ?? selectedVariant?.stockQuantity ?? 0;
  const totalAmount = selectedVariant ? selectedVariant.price * quantity : 0;

  const onValidSubmit = (values: OrderFormValues) => {
    if (!selectedVariantId) {
      setVariantError(true);
      return;
    }
    setVariantError(false);
    setSubmitError(null);

    const fd = new FormData();
    fd.set('customerName', values.customerName);
    fd.set('phone', values.phone);
    if (values.email) {
      fd.set('email', values.email);
    }
    fd.set('address', values.address);
    fd.set('province', values.province);
    fd.set('paymentMethod', values.paymentMethod);
    if (values.notes) {
      fd.set('notes', values.notes);
    }
    fd.set(
      'items',
      JSON.stringify([{ variantId: selectedVariantId, qty: quantity }]),
    );

    startTransition(async () => {
      try {
        await submitOrder(fd);
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : 'Đặt hàng thất bại, vui lòng thử lại.',
        );
      }
    });
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-green-900 mb-6">Đặt hàng ngay</h2>

      <div className="mb-5">
        <VariantSelector
          variants={variants}
          selectedId={selectedVariantId}
          onSelect={(id) => {
            setSelectedVariantId(id);
            setVariantError(false);
          }}
        />
        {variantError ? (
          <p className="mt-2 text-sm text-red-600">
            Vui lòng chọn loại sản phẩm.
          </p>
        ) : null}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Số lượng:</span>
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={selectedVariantStock > 0 ? selectedVariantStock : 1}
          ariaLabel="Số lượng đặt hàng"
          className="border-gray-300 bg-white"
        />
        {selectedVariant ? (
          <span className="text-green-700 font-bold text-sm ml-2">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(totalAmount)}
          </span>
        ) : null}
        {selectedVariantStock > 0 ? (
          <span className="text-xs text-gray-500">
            Tồn kho: {selectedVariantStock}
          </span>
        ) : null}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onValidSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Họ tên <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="name"
                      placeholder="Nguyễn Văn A"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Số điện thoại <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      autoComplete="tel"
                      placeholder="0987 654 321"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    autoComplete="email"
                    placeholder="example@email.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Địa chỉ giao hàng <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="street-address"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tỉnh/thành" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROVINCES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phương thức thanh toán <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    className="flex flex-col gap-2"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <div
                        key={method.value}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm"
                      >
                        <RadioGroupItem
                          value={method.value}
                          id={`payment-${method.value}`}
                        />
                        <Label
                          htmlFor={`payment-${method.value}`}
                          className="flex-1 cursor-pointer font-normal leading-snug"
                        >
                          {method.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {paymentMethod === 'bank_transfer' ? (
            <QrPaymentInfo totalAmount={totalAmount} />
          ) : null}

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Ghi chú đơn hàng (tuỳ chọn)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {submitError ? (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {submitError}
            </p>
          ) : null}

          <Button
            type="submit"
            loading={isPending}
            disabled={!selectedVariantId}
            className="h-auto w-full rounded-xl bg-green-700 py-3 text-base font-bold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Đang xử lý…' : `Đặt hàng — ${productName}`}
          </Button>
        </form>
      </Form>
    </section>
  );
}
