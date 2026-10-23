'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, CreditCard, Wallet, Landmark, CheckCircle2 } from 'lucide-react';
import { placeOrder } from '@/app/(buyer)/check-out/actions';
import AccordionSection from '@/component/AccordionSection';
import AddressFieldsInputs from '@/component/AddressFields';
import { buttonClassName } from '@/component/Button';
import { FieldLabel } from '@/component/FormField';
import ProductImage from '@/component/ProductImage';
import { lineKey, removeCartLines, useCartLines } from '@/lib/cart';
import { useResolvedCartItems } from '@/lib/cart-items';
import { MAX_SAVED_ADDRESSES, type AddressFields } from '@/lib/checkout/address';
import { PAYMENT_METHOD_IDS, PAYMENT_METHOD_LABELS, type PaymentMethodId } from '@/lib/checkout/payment';
import { calcTotals } from '@/lib/checkout/pricing';
import { SHIPPING_METHOD_IDS, SHIPPING_METHODS, deliveryEstimate, type ShippingMethodId } from '@/lib/checkout/shipping';
import type { ShippingMethodDetail } from '@/lib/catalog/types';
import type { SavedAddressRecord } from '@/lib/checkout/saved-address';
import type { PlaceOrderState } from '@/lib/checkout/types';
import { formatPrice } from '@/lib/format';
import styles from './CheckoutForm.module.css';

const initialState: PlaceOrderState = {};

// Card details are collected by the payment provider once PayMongo is wired
// in. These inputs deliberately have no `name`, so the browser never submits
// them to placeOrder.
function CardField({ id, label }: { id: string; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input id={id} type="text" className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-[#4F6BB5] focus:ring-1 focus:ring-[#4F6BB5]" />
    </div>
  );
}

interface CheckoutFormProps {
  defaultName: string;
  // The buyer's address book, default first. The default prefills the form.
  savedAddresses: SavedAddressRecord[];
  // Cart line keys (slug::color) chosen on the cart page. Without them,
  // checkout covers the whole cart.
  selectedKeys?: string[];
  // Fees and delivery windows from the shipping_methods sheet tab. Missing methods fall
  // back to the built-in table, and the server re-reads the fee when the order is placed.
  shippingMethods?: ShippingMethodDetail[];
}

// Value of the "Ship to" select for typing in an address by hand.
const NEW_ADDRESS = '';

export default function CheckoutForm({ defaultName, savedAddresses, selectedKeys, shippingMethods = [] }: CheckoutFormProps) {
  const router = useRouter();
  const cartLines = useCartLines();
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('CARD');
  const [promoCode, setPromoCode] = useState('');
  const [placed, setPlaced] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(
    savedAddresses.find((address) => address.isDefault)?.id ?? NEW_ADDRESS,
  );
  // The action state at the moment the buyer switched address. Until the next
  // submit, that switch wins over the values echoed back from the last one.
  const [switchedAt, setSwitchedAt] = useState<PlaceOrderState | null>(null);

  const lines = selectedKeys
    ? cartLines.filter((line) => selectedKeys.includes(lineKey(line.slug, line.color)))
    : cartLines;
  const { items, ready } = useResolvedCartItems(lines);
  const unavailableCount = lines.length - items.length;

  const [state, formAction, pending] = useActionState(
    async (prevState: PlaceOrderState, formData: FormData) => {
      const result = await placeOrder(prevState, formData);

      if (result.orderId) {
        // Swap to the "placed" panel first so clearing the cart doesn't flash
        // an empty checkout before the navigation lands.
        setPlaced(true);
        removeCartLines(items.map((item) => lineKey(item.slug, item.color)));
        router.push(`/order-confirm/${result.orderId}`);
      }
      return result;
    },
    initialState,
  );

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingOption = (id: ShippingMethodId) => shippingMethods.find((method) => method.id === id) ?? { id, ...SHIPPING_METHODS[id] };
  const { shippingFee, total } = calcTotals(subtotal, shippingMethod, shippingOption(shippingMethod).fee);
  const orderLines = JSON.stringify(items.map(({ slug, color, quantity }) => ({ slug, color, quantity })));

  const fieldErrors = state.fieldErrors ?? {};
  // Prefill: what was just submitted (after an error), else the chosen saved address.
  const selectedAddress = savedAddresses.find((address) => address.id === selectedAddressId);
  const values: Partial<Record<keyof AddressFields, string>> =
    state.values && switchedAt !== state ? state.values : (selectedAddress ?? { fullName: defaultName });
  const canSaveAddress = !selectedAddress && savedAddresses.length < MAX_SAVED_ADDRESSES;
  // Ticked by default only when the address book is empty, so a one-off address
  // isn't added to it silently. After an error, keep whatever the buyer chose.
  const saveAddressChecked = state.values ? state.values.saveAddress === 'on' : savedAddresses.length === 0;
  const generalError = state.error ?? fieldErrors.lines?.[0];
  const canSubmit = ready && items.length > 0 && !pending;

  if (placed) {
    return <p className="py-14 text-center text-sm text-muted-foreground">Order placed — taking you to your confirmation…</p>;
  }

  if (ready && items.length === 0) {
    return (
      <div className="py-14 text-center">
        <p className="text-sm text-muted-foreground">
          {unavailableCount > 0 ? 'The items you selected are no longer available.' : 'You have nothing to check out yet.'}
        </p>
        <Link href="/cart" className={buttonClassName({ variant: 'primary', className: 'mt-6 uppercase' })}>
          Back to Cart
        </Link>
      </div>
    );
  }

  function renderErrorMessage() {
    return (
      <p aria-live="polite" className="mt-4 min-h-5 text-sm text-red-500">
        {generalError}
      </p>
    );
  }

  function renderOrderSummary(showPlaceOrder: boolean) {
    return (
      <>
        {!ready ? (
          <p className="text-sm text-muted-foreground">Loading your order…</p>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={lineKey(item.slug, item.color)}
                className="flex items-center gap-3 py-3"
              >
                <ProductImage imageUrl={item.imageUrl} alt={item.name} sizes="80px" objectFit="contain" className="h-20 w-20 shrink-0 rounded-lg" />
                <div className="flex flex-1 items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold">{item.name}</p>
                    {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {unavailableCount > 0 && ready && (
          <p className="mt-4 text-xs text-muted-foreground">
            {unavailableCount === 1 ? '1 item is' : `${unavailableCount} items are`} no longer available and left out
            of this order.
          </p>
        )}

        <div className="mt-6 flex justify-between text-sm text-muted-foreground">
          <span>Item Qty</span>
          <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between border-b border-border pb-4 text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span>
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
              // This input lives inside the checkout <form>; Enter must not place the order.
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              placeholder="Enter code"
              className="min-w-0 w-full rounded-sm border border-[#4F6BB5] bg-[#4F6BB5]/45 px-3 py-2 text-sm outline-none placeholder:text-white focus:ring-1 focus:ring-[#4F6BB5]"
            />
            <button
              type="button"
              className="shrink-0 rounded-sm border border-[#4F6BB5] px-4 text-sm text-[#334783] hover:bg-muted dark:text-foreground"
            >
              Apply
            </button>
          </div>
        </div>

        {showPlaceOrder && (
          <>
            {renderErrorMessage()}
            <button
              type="submit"
              disabled={!canSubmit}
              className={buttonClassName({ variant: 'primary', className: `mt-4 w-full ${styles.placeOrder}` })}
            >
              {pending ? 'Placing order…' : 'Place Order'}
              {!pending && <ArrowRight size={16} />}
            </button>
          </>
        )}
      </>
    );
  }

  return (
    <form action={formAction} className={styles.layout}>
      <input type="hidden" name="lines" value={orderLines} />
      <input type="hidden" name="shippingMethod" value={shippingMethod} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      <div className={styles.mobileSummary}>
        <AccordionSection title="Order Summary" defaultOpen>
          {renderOrderSummary(false)}
        </AccordionSection>
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/15 text-sm">1</span>
            <h2 className="text-base font-medium uppercase">Shipping Address</h2>
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:ml-9">
            {savedAddresses.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="savedAddress">Ship to</FieldLabel>
                {/* No name: the chosen address is submitted through the fields below. */}
                <select
                  id="savedAddress"
                  value={selectedAddressId}
                  onChange={(e) => {
                    setSelectedAddressId(e.target.value);
                    setSwitchedAt(state);
                  }}
                  className="w-full rounded-lg bg-muted px-4 py-3 text-sm outline-none"
                >
                  {savedAddresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label ?? address.fullName} — {address.address}, {address.city}
                      {address.isDefault ? ' (default)' : ''}
                    </option>
                  ))}
                  <option value={NEW_ADDRESS}>Enter a new address</option>
                </select>
                <Link href="/account/addresses" className="text-xs text-muted-foreground underline">
                  Manage address book
                </Link>
              </div>
            )}

            {/* Remounts on a different choice so the inputs pick up its values. */}
            <AddressFieldsInputs
              floatingLabels
              key={`${selectedAddressId}:${switchedAt === state}`}
              values={values}
              errors={fieldErrors}
            />

            {canSaveAddress && (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="saveAddress"
                  defaultChecked={saveAddressChecked}
                  className="h-4 w-4 accent-foreground"
                />
                Save this address for next time
              </label>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/15 text-sm">2</span>
            <h2 className="text-base font-medium uppercase">Shipping Method</h2>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:ml-9 sm:grid-cols-2">
            {SHIPPING_METHOD_IDS.map((id) => {
              const option = shippingOption(id);
              const selected = shippingMethod === id;
              return (
                <label
                  key={id}
                  className={`flex cursor-pointer flex-col gap-1 rounded-sm border p-4 ${
                    selected ? 'border-[#7B93D4] ring-1 ring-[#7B93D4]' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {/* Display only: the chosen method is submitted via the hidden shippingMethod input. */}
                      <input
                        type="radio"
                        name="shipping-option"
                        checked={selected}
                        onChange={() => setShippingMethod(id)}
                        className="h-4 w-4 accent-[#7B93D4]"
                      />
                      {option.label}
                    </span>
                    <span className="text-sm">{option.fee === 0 ? 'Free' : formatPrice(option.fee)}</span>
                  </div>
                  <p className="pl-6 text-xs text-muted-foreground">
                    {option.minDays}–{option.maxDays} Business Days
                  </p>
                  {selected && (
                    <p className="ml-6 mt-1 flex items-center gap-1 bg-muted px-2 py-1 text-xs text-muted-foreground">
                      <Clock size={12} />
                      {/* Depends on today's date, which can differ between server render and hydration. */}
                      <span suppressHydrationWarning>Arrives {deliveryEstimate(id, new Date(), option)}</span>
                    </p>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/15 text-sm">3</span>
            <h2 className="text-base font-medium uppercase">Payment Method</h2>
          </div>
          <div className="mt-6 flex max-w-sm gap-3 sm:ml-9">
            {PAYMENT_METHOD_IDS.map((id) => {
              const selected = paymentMethod === id;
              const Icon = id === 'CARD' ? CreditCard : id === 'WALLET' ? Wallet : Landmark;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  aria-pressed={selected}
                  className={`relative flex min-w-0 flex-1 flex-col items-center gap-2 rounded-sm border px-3 py-3 text-xs font-semibold uppercase ${
                    selected ? 'border-[#7F96EB] ring-1 ring-[#7F96EB]' : 'border-border text-muted-foreground'
                  }`}
                >
                  <Icon size={24} aria-hidden="true" className={id === 'CARD' ? 'text-[#B78B39]' : id === 'WALLET' ? 'text-[#6959BF]' : 'text-[#4F9138]'} />
                  {PAYMENT_METHOD_LABELS[id]}
                  {selected && <CheckCircle2 size={18} aria-hidden="true" className="absolute -top-2 -right-2 rounded-full bg-background text-green-600" />}
                </button>
              );
            })}
          </div>

          <div className="mt-6 max-w-lg sm:ml-9">
            {paymentMethod === 'CARD' ? (
              <div className="flex flex-col gap-4">
                <CardField id="card-number" label="Card Number" />
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.3fr)] gap-3">
                  <CardField id="expiry" label="Expiry Date" />
                  <CardField id="cvv" label="CVV" />
                </div>
                <CardField id="card-name" label="Name on Card" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You&apos;ll complete payment via {PAYMENT_METHOD_LABELS[paymentMethod]} at checkout.
              </p>
            )}
          </div>
          <p className="mt-4 text-xs text-muted-foreground sm:ml-9">
            Payment isn&apos;t collected yet — your order will be saved as unpaid.
          </p>
        </div>

        <div className={styles.mobileSubmit}>
          {renderErrorMessage()}
          <button
            type="submit"
            disabled={!canSubmit}
            className={buttonClassName({ variant: 'primary', className: `mt-2 w-full uppercase ${styles.placeOrder}` })}
          >
            {pending ? 'Placing order…' : 'Place Order'}
            {!pending && <ArrowRight size={16} />}
          </button>
        </div>
      </div>

      <div className={styles.desktopSummary}>
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-sm font-semibold">Order Summary</h2>
          <div className="mt-4">{renderOrderSummary(true)}</div>
        </div>
      </div>
    </form>
  );
}
