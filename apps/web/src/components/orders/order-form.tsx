'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import type { ProductVariant } from '@longnhan/types';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { submitOrder } from '@/actions/order-actions';
import VariantSelector from '@/components/products/variant-selector';
import { PAYMENT_METHODS, PROVINCES } from '@/lib/constants';
import {
  orderFormSchema,
  type OrderFormValues,
} from '@/lib/validation/order-form-schema';
import QrPaymentInfo from './qr-payment-info';

function inputClass(invalid: boolean) {
  return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
    invalid ? 'border-red-500 bg-red-50/40' : 'border-gray-300'
  }`;
}

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

      <div className="mb-5 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Số lượng:</span>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 text-lg font-bold"
          >
            −
          </button>
          <span className="px-4 py-2 text-sm font-semibold min-w-10 text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity(
                Math.min(selectedVariantStock || quantity + 1, quantity + 1),
              )
            }
            disabled={
              selectedVariantStock > 0
                ? quantity >= selectedVariantStock
                : false
            }
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
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

      <form
        onSubmit={handleSubmit(onValidSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="customerName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Họ tên <span className="text-red-500">*</span>
            </label>
            <input
              id="customerName"
              type="text"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
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
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="0987 654 321"
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
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="example@email.com"
            className={inputClass(!!errors.email)}
            {...register('email')}
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Địa chỉ giao hàng <span className="text-red-500">*</span>
          </label>
          <input
            id="address"
            type="text"
            autoComplete="street-address"
            placeholder="Số nhà, đường, phường/xã, quận/huyện"
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
          <label
            htmlFor="province"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <select
            id="province"
            className={`${inputClass(!!errors.province)} bg-white`}
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
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Phương thức thanh toán <span className="text-red-500">*</span>
          </span>
          <div className="flex flex-col gap-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  value={method.value}
                  className="text-green-600"
                  {...register('paymentMethod')}
                />
                <span className="text-sm text-gray-700">{method.label}</span>
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
          <QrPaymentInfo totalAmount={totalAmount} />
        ) : null}

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ghi chú
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Ghi chú đơn hàng (tuỳ chọn)"
            className={`${inputClass(!!errors.notes)} resize-none`}
            {...register('notes')}
          />
          {errors.notes ? (
            <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>
          ) : null}
        </div>

        {submitError ? (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending || !selectedVariantId}
          className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-base"
        >
          {isPending ? 'Đang xử lý...' : `Đặt hàng — ${productName}`}
        </button>
      </form>
    </section>
  );
}
