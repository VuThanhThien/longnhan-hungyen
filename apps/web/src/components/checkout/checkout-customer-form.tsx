'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { PAYMENT_METHODS, PROVINCES } from '@/lib/constants';
import {
  orderFormSchema,
  type OrderFormValues,
} from '@/lib/validation/order-form-schema';
import QrPaymentInfo from '@/components/orders/qr-payment-info';

function inputClass(invalid: boolean) {
  return `h-11 w-full rounded-xl border border-(--brand-forest)/15 bg-(--brand-cream) px-3 text-sm text-(--brand-forest) shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--brand-cream) ${
    invalid ? 'border-red-500 bg-red-50/40' : ''
  }`;
}

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
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: yupResolver(orderFormSchema),
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

  // eslint-disable-next-line react-hooks/incompatible-library
  const paymentMethod = watch('paymentMethod');

  return (
    <section className="rounded-2xl border border-(--brand-forest)/10 bg-(--brand-cream) p-4 shadow-sm md:p-6">
      <h1 className="text-2xl font-semibold md:text-3xl">Thanh toán</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="customerName" className="text-sm font-semibold">
              Họ tên <span className="text-red-500">*</span>
            </label>
            <input
              id="customerName"
              type="text"
              autoComplete="name"
              className={inputClass(!!errors.customerName)}
              {...register('customerName')}
            />
            {errors.customerName ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.customerName.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-semibold">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              className={inputClass(!!errors.phone)}
              {...register('phone')}
            />
            {errors.phone ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.phone.message}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClass(!!errors.email)}
            {...register('email')}
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="address" className="text-sm font-semibold">
            Địa chỉ giao hàng <span className="text-red-500">*</span>
          </label>
          <input
            id="address"
            type="text"
            autoComplete="street-address"
            className={inputClass(!!errors.address)}
            {...register('address')}
          />
          {errors.address ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.address.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="province" className="text-sm font-semibold">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <select
            id="province"
            className={`${inputClass(!!errors.province)} appearance-none`}
            {...register('province')}
          >
            <option value="">Chọn tỉnh/thành</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.province ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.province.message}
            </p>
          ) : null}
        </div>

        <div>
          <span className="block text-sm font-semibold">
            Phương thức thanh toán <span className="text-red-500">*</span>
          </span>
          <div className="mt-2 flex flex-col gap-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.value}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="radio"
                  value={method.value}
                  className="text-(--brand-leaf)"
                  {...register('paymentMethod')}
                />
                <span className="text-sm text-(--brand-forest)">
                  {method.label}
                </span>
              </label>
            ))}
          </div>
          {errors.paymentMethod ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.paymentMethod.message}
            </p>
          ) : null}
        </div>

        {paymentMethod === 'bank_transfer' ? (
          <QrPaymentInfo totalAmount={totalAmountVnd} />
        ) : null}

        <div>
          <label htmlFor="notes" className="text-sm font-semibold">
            Ghi chú
          </label>
          <textarea
            id="notes"
            rows={3}
            className={`${inputClass(!!errors.notes)} h-auto resize-none py-2`}
            {...register('notes')}
          />
          {errors.notes ? (
            <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>
          ) : null}
        </div>

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
    </section>
  );
}
