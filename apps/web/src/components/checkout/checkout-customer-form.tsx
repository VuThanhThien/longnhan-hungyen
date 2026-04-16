'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import QrPaymentInfo from '@/components/orders/qr-payment-info';
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
import { cn } from '@/lib/utils';
import {
  orderCustomerSchema as orderFormSchema,
  type OrderFormValues,
} from '@/lib/validation/order/order-schemas';

const checkoutFieldClass =
  'border-(--brand-forest)/15 bg-(--brand-cream) text-(--brand-forest) placeholder:text-(--brand-forest)/50 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-(--brand-cream)';

type CheckoutCustomerFormProps = {
  onSubmit: (values: OrderFormValues) => void;
  isPending: boolean;
  submitError: string | null;
  totalAmountVnd: number;
};

export function CheckoutCustomerForm({
  onSubmit,
  isPending,
  submitError,
  totalAmountVnd,
}: CheckoutCustomerFormProps) {
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

  return (
    <section className="rounded-2xl border border-(--brand-forest)/10 bg-(--brand-cream) p-4 shadow-sm md:p-6">
      <h1 className="text-2xl font-semibold md:text-3xl">Thanh toán</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    Họ tên <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="name"
                      placeholder="Nguyễn Văn A"
                      className={cn(
                        checkoutFieldClass,
                        fieldState.error &&
                          'border-red-500 bg-red-50/40 focus-visible:ring-red-300',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
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
                      className={cn(
                        checkoutFieldClass,
                        fieldState.error &&
                          'border-red-500 bg-red-50/40 focus-visible:ring-red-300',
                      )}
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
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    autoComplete="email"
                    placeholder="example@email.com"
                    className={cn(
                      checkoutFieldClass,
                      fieldState.error &&
                        'border-red-500 bg-red-50/40 focus-visible:ring-red-300',
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  Địa chỉ giao hàng <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="street-address"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện"
                    className={cn(
                      checkoutFieldClass,
                      fieldState.error &&
                        'border-red-500 bg-red-50/40 focus-visible:ring-red-300',
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="province"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        checkoutFieldClass,
                        fieldState.error &&
                          'border-red-500 bg-red-50/40 focus-visible:ring-red-300',
                      )}
                    >
                      <SelectValue placeholder="Chọn tỉnh/thành" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-(--brand-forest)/15 bg-(--brand-cream)">
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
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-(--brand-forest)/15 bg-(--brand-cream) px-3 py-2 shadow-sm"
                      >
                        <RadioGroupItem
                          value={method.value}
                          id={`checkout-pay-${method.value}`}
                          className="border-(--brand-forest)/25 text-(--brand-leaf)"
                        />
                        <Label
                          htmlFor={`checkout-pay-${method.value}`}
                          className="flex-1 cursor-pointer text-sm font-normal text-(--brand-forest)"
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
            <QrPaymentInfo totalAmount={totalAmountVnd} />
          ) : null}

          <FormField
            control={form.control}
            name="notes"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Ghi chú đơn hàng (tuỳ chọn)"
                    className={cn(
                      checkoutFieldClass,
                      'h-auto min-h-20 resize-none py-2',
                      fieldState.error &&
                        'border-red-500 bg-red-50/40 focus-visible:ring-red-300',
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {submitError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          ) : null}

          <Button
            type="submit"
            loading={isPending}
            className="h-12 w-full rounded-xl bg-(--brand-forest) text-(--brand-cream) hover:bg-(--brand-forest)/90"
          >
            Đặt hàng
          </Button>
        </form>
      </Form>
    </section>
  );
}
