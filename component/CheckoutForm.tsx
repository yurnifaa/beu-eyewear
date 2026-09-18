'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import AccordionSection from '@/component/AccordionSection';
import { buttonClassName } from '@/component/Button';
import PlaceholderImage from '@/component/PlaceholderImage';

type ShippingMethod = 'standard' | 'express';
type PaymentMethod = 'card' | 'wallet' | 'bank';

const ITEMS = [
  { name: 'Frames', variant: 'Color / Anti Radiation', qty: 1, price: 1500 },
  { name: 'Frames', variant: 'Color / Anti Radiation', qty: 1, price: 1500 },
];

const SHIPPING_PRICE: Record<ShippingMethod, number> = {
  standard: 0,
  express: 150,
};

const SHIPPING_OPTIONS: { id: ShippingMethod; label: string; eta: string; arrives: string }[] = [
  { id: 'standard', label: '3–5 Business Days', eta: 'Free', arrives: 'Arrives Aug 25–27' },
  { id: 'express', label: '1–2 Business Days', eta: '₱150', arrives: 'Arrives Aug 20–21' },
];

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: 'card', label: 'Card' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'bank', label: 'Bank' },
];

function formatPrice(amount: number) {
  return `₱${amount.toLocaleString('en-PH')}`;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm text-muted-foreground">
      {children}
    </label>
  );
}

function TextField({ id, label }: { id: string; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input id={id} type="text" className="w-full rounded-lg bg-muted px-4 py-3 text-sm outline-none" />
    </div>
  );
}

export default function CheckoutForm() {
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [promoCode, setPromoCode] = useState('');

  const subtotal = ITEMS.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = SHIPPING_PRICE[shippingMethod];
  const total = subtotal + shipping;

  function renderOrderSummary(showPlaceOrder: boolean) {
    return (
      <>
        <div className="flex flex-col gap-4">
          {ITEMS.map((item, i) => (
            <div key={i} className="flex gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0">
              <PlaceholderImage variant="plain" className="h-16 w-16 shrink-0 rounded-lg" />
              <div className="flex flex-1 items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.variant}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                </div>
                <p className="shrink-0 text-sm">{formatPrice(item.price * item.qty)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between border-b border-border pb-4 text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
        <div className="mt-4 flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <FieldLabel htmlFor="promo">Promo / Gift Card</FieldLabel>
          <div className="flex gap-2">
            <input
              id="promo"
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter code"
              className="w-full rounded-lg bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              className="shrink-0 rounded-lg border border-border px-4 text-sm text-muted-foreground hover:bg-muted"
            >
              Apply
            </button>
          </div>
        </div>

        {showPlaceOrder && (
          <Link
            href="/order-confirm"
            className={buttonClassName({ variant: 'primary', className: 'mt-6 w-full uppercase' })}
          >
            Place Order
            <ArrowRight size={16} />
          </Link>
        )}
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="md:hidden">
        <AccordionSection title="Order Summary" defaultOpen>
          {renderOrderSummary(false)}
        </AccordionSection>
      </div>

      <div className="flex flex-col gap-10 md:col-span-2">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 shrink-0 rounded-full bg-muted" />
            <p className="text-sm font-bold uppercase tracking-wide">Shipping Address</p>
          </div>
          <div className="mt-6 flex flex-col gap-4">
            <TextField id="full-name" label="Full Name" />
            <TextField id="address" label="Address" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField id="city" label="City" />
              <TextField id="province" label="Province" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField id="zip" label="Zip / Postal Code" />
              <TextField id="mobile" label="Mobile Number" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 shrink-0 rounded-full bg-muted" />
            <p className="text-sm font-bold uppercase tracking-wide">Shipping Method</p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SHIPPING_OPTIONS.map((option) => {
              const selected = shippingMethod === option.id;
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-4 ${
                    selected ? 'border-foreground' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <input
                        type="radio"
                        name="shipping"
                        checked={selected}
                        onChange={() => setShippingMethod(option.id)}
                        className="h-4 w-4 accent-foreground"
                      />
                      {option.id === 'standard' ? 'Standard' : 'Express'}
                    </span>
                    <span className="text-sm">{option.eta}</span>
                  </div>
                  <p className="pl-6 text-xs text-muted-foreground">{option.label}</p>
                  {selected && (
                    <p className="flex items-center gap-1 pl-6 text-xs text-muted-foreground">
                      <Clock size={12} />
                      {option.arrives}
                    </p>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 shrink-0 rounded-full bg-muted" />
            <p className="text-sm font-bold uppercase tracking-wide">Payment Method</p>
          </div>
          <div className="mt-6 flex gap-4">
            {PAYMENT_OPTIONS.map((option) => {
              const selected = paymentMethod === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPaymentMethod(option.id)}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold ${
                    selected ? 'border-foreground' : 'border-border text-muted-foreground'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            {paymentMethod === 'card' ? (
              <div className="flex flex-col gap-4">
                <TextField id="card-number" label="Card Number" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField id="expiry" label="Expiry Date" />
                  <TextField id="cvv" label="CVV" />
                </div>
                <TextField id="card-name" label="Name on Card" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You&apos;ll complete payment via {PAYMENT_OPTIONS.find((o) => o.id === paymentMethod)?.label} at
                checkout.
              </p>
            )}
          </div>
        </div>

        <div className="md:hidden">
          <Link
            href="/order-confirm"
            className={buttonClassName({ variant: 'primary', className: 'w-full uppercase' })}
          >
            Place Order
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="hidden md:block md:sticky md:top-24 md:self-start">
        <div className="rounded-xl bg-muted p-6">
          <p className="text-sm font-bold uppercase tracking-wide">Order Summary</p>
          <div className="mt-4">
            {renderOrderSummary(true)}
          </div>
        </div>
      </div>
    </div>
  );
}
