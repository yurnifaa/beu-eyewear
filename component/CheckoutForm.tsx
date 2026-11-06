'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, CreditCard, Wallet, Lock, CheckCircle2 } from 'lucide-react';
import Panel from '@/component/account/Panel';
import PixelGlyph from '@/component/beu/PixelGlyph';
import { placeOrder } from '@/app/(buyer)/check-out/actions';
import AccordionSection from '@/component/AccordionSection';
import AddressFieldsInputs from '@/component/AddressFields';
import { FieldLabel } from '@/component/FormField';
import ProductImage from '@/component/ProductImage';
import { lineKey, removeCartLines, useCartLines } from '@/lib/cart';
import { useResolvedCartItems } from '@/lib/cart-items';
import { MAX_SAVED_ADDRESSES, type AddressFields } from '@/lib/checkout/address';
import { PAYMENT_METHOD_IDS, PAYMENT_METHOD_LABELS, PAYMENT_PROVIDER_NAME, type PaymentMethodId } from '@/lib/checkout/payment';
import { calcTotals } from '@/lib/checkout/pricing';
import { SHIPPING_METHOD_IDS, SHIPPING_METHODS, deliveryEstimate, type ShippingMethodId } from '@/lib/checkout/shipping';
import type { ShippingMethodDetail } from '@/lib/catalog/types';
import type { SavedAddressRecord } from '@/lib/checkout/saved-address';
import type { PlaceOrderState } from '@/lib/checkout/types';
import { formatPrice } from '@/lib/format';

const initialState: PlaceOrderState = {};

const inkButton =
  'inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-xs uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60';

// Selected option cards (shipping and payment) share one look.
const optionClass = (selected: boolean) =>
  `rounded-2xl border-2 transition ${selected ? 'border-foreground bg-accent/10 shadow-[0_10px_24px_rgba(40,100,180,0.15)]' : 'border-border bg-background/60 hover:border-foreground/40'}`;

// What the buyer is told on the payment step. Card numbers and GCash logins are entered on
// the payment provider's own page after the order is placed, never in this form.
const PAYMENT_HELP: Record<PaymentMethodId, string> = {
  CARD: `Visa and Mastercard. You’ll enter your card details on ${PAYMENT_PROVIDER_NAME}’s secure payment page.`,
  WALLET: 'You’ll be sent to GCash to approve the payment.',
};

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
  // Set once the order exists, while the browser leaves for the payment page.
  const [placedMessage, setPlacedMessage] = useState<string | null>(null);
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
        setPlacedMessage(
          result.checkoutUrl
            ? 'Order placed — taking you to the secure payment page…'
            : 'Order placed — taking you to your order…',
        );
        removeCartLines(items.map((item) => lineKey(item.slug, item.color)));
        if (result.checkoutUrl) {
          // A full navigation: the payment page is the provider's, not ours.
          window.location.assign(result.checkoutUrl);
        } else {
          // The payment page couldn't be opened. The order is saved; "Pay now" is on it.
          router.push(`/account/orders/${result.orderId}?payment=failed`);
        }
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

  if (placedMessage) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-background/80 px-6 py-16 text-center backdrop-blur">
        <PixelGlyph name="spark" size={48} className="text-accent" />
        <p className="text-sm text-muted-foreground">{placedMessage}</p>
      </div>
    );
  }

  if (ready && items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-border bg-background/60 px-6 py-16 text-center backdrop-blur">
        <PixelGlyph name="cross" size={56} className="text-foreground" />
        <h2 className="font-display text-xl font-black uppercase tracking-[-0.03em]">Nothing to check out</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {unavailableCount > 0 ? 'The items you selected are no longer available.' : 'You have nothing to check out yet.'}
        </p>
        <Link href="/cart" className={`mt-2 px-8 ${inkButton} !h-12 !w-auto`}>
          Back to cart
        </Link>
      </div>
    );
  }

  function renderErrorMessage() {
    return (
      <p aria-live="polite" className="mt-4 min-h-5 text-center text-sm text-red-500">
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
          <ul className="flex list-none flex-col divide-y divide-border">
            {items.map((item) => (
              <li key={lineKey(item.slug, item.color)} className="flex items-center gap-4 py-4 first:pt-0">
                <ProductImage imageUrl={item.imageUrl} alt={item.name} sizes="80px" objectFit="contain" className="beu-stage size-20 shrink-0 rounded-2xl" />
                <div className="flex flex-1 items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-sm font-black uppercase leading-tight tracking-[-0.01em]">{item.name}</p>
                    {item.color && <p className="mt-1 text-xs text-muted-foreground">Color: {item.color}</p>}
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {unavailableCount > 0 && ready && (
          <p className="mt-4 text-xs text-muted-foreground">
            {unavailableCount === 1 ? '1 item is' : `${unavailableCount} items are`} no longer available and left out
            of this order.
          </p>
        )}

        <div className="mt-2 flex justify-between border-t border-border pt-4 text-sm text-muted-foreground">
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
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Total</span>
          <span className="font-display text-2xl font-black tracking-[-0.03em]">{formatPrice(total)}</span>
        </div>

        <div className="mt-6 flex flex-col gap-1.5">
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
              className="h-12 w-full min-w-0 rounded-full border border-border bg-background/70 px-5 text-base md:text-sm outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
            <button
              type="button"
              className="beu-chip h-12 shrink-0 px-6 text-xs uppercase tracking-[0.14em]"
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
              className={`mt-4 ${inkButton}`}
            >
              {pending ? 'Preparing payment…' : 'Continue to payment'}
              {!pending && <ArrowRight size={16} aria-hidden="true" />}
            </button>
          </>
        )}
      </>
    );
  }

  return (
    <form action={formAction} className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
      <input type="hidden" name="lines" value={orderLines} />
      <input type="hidden" name="shippingMethod" value={shippingMethod} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      <Panel className="py-2 md:py-3 lg:hidden">
        <AccordionSection title="Order Summary" defaultOpen>
          {renderOrderSummary(false)}
        </AccordionSection>
      </Panel>

      <div className="flex min-w-0 flex-col gap-6">
        <Panel title="Shipping address" index="01">
          <div className="flex flex-col gap-4">
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
                  className="h-12 w-full rounded-2xl border border-border bg-background/70 px-4 text-base md:text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                >
                  {savedAddresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label ?? address.fullName} — {address.address}, {address.city}
                      {address.isDefault ? ' (default)' : ''}
                    </option>
                  ))}
                  <option value={NEW_ADDRESS}>Enter a new address</option>
                </select>
                <Link href="/account/addresses" className="text-xs text-muted-foreground underline underline-offset-4">
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
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="saveAddress"
                  defaultChecked={saveAddressChecked}
                  className="size-5 accent-accent"
                />
                Save this address for next time
              </label>
            )}
          </div>
        </Panel>

        <Panel title="Shipping method" index="02">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SHIPPING_METHOD_IDS.map((id) => {
              const option = shippingOption(id);
              const selected = shippingMethod === id;
              return (
                <label key={id} className={`flex cursor-pointer flex-col gap-1 p-5 ${optionClass(selected)}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-3 text-sm font-semibold">
                      {/* Display only: the chosen method is submitted via the hidden shippingMethod input. */}
                      <input
                        type="radio"
                        name="shipping-option"
                        checked={selected}
                        onChange={() => setShippingMethod(id)}
                        className="size-4 accent-accent"
                      />
                      <span className="font-display text-sm font-black uppercase tracking-[-0.01em]">{option.label}</span>
                    </span>
                    <span className="text-sm font-medium">{option.fee === 0 ? 'Free' : formatPrice(option.fee)}</span>
                  </div>
                  <p className="pl-7 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {option.minDays}–{option.maxDays} business days
                  </p>
                  {selected && (
                    <p className="ml-7 mt-2 flex w-fit items-center gap-1.5 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                      <Clock size={12} aria-hidden="true" />
                      {/* Depends on today's date, which can differ between server render and hydration. */}
                      <span suppressHydrationWarning>Arrives {deliveryEstimate(id, new Date(), option)}</span>
                    </p>
                  )}
                </label>
              );
            })}
          </div>
        </Panel>

        <Panel title="Payment method" index="03">
          <div className="grid max-w-md grid-cols-2 gap-3">
            {PAYMENT_METHOD_IDS.map((id) => {
              const selected = paymentMethod === id;
              const Icon = id === 'CARD' ? CreditCard : Wallet;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  aria-pressed={selected}
                  className={`relative flex min-w-0 flex-col items-center gap-2 px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.1em] ${optionClass(selected)} ${selected ? '' : 'text-muted-foreground'}`}
                >
                  <Icon size={24} aria-hidden="true" className="text-accent" />
                  {PAYMENT_METHOD_LABELS[id]}
                  {selected && <CheckCircle2 size={18} aria-hidden="true" className="absolute -right-2 -top-2 rounded-full bg-background text-green-600" />}
                </button>
              );
            })}
          </div>

          <div className="mt-6 max-w-lg">
            <p className="text-sm text-muted-foreground">{PAYMENT_HELP[paymentMethod]}</p>
          </div>
          <p className="mt-6 flex items-center gap-2 rounded-2xl bg-accent/10 px-4 py-3 text-xs text-muted-foreground">
            <Lock size={12} aria-hidden="true" className="shrink-0" />
            Payments are processed by {PAYMENT_PROVIDER_NAME}. We never see or store your card details.
          </p>
        </Panel>

        <div className="lg:hidden">
          {renderErrorMessage()}
          <button type="submit" disabled={!canSubmit} className={`mt-2 ${inkButton}`}>
            {pending ? 'Preparing payment…' : 'Continue to payment'}
            {!pending && <ArrowRight size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="hidden min-w-0 lg:sticky lg:top-28 lg:block">
        <Panel title="Order summary">{renderOrderSummary(true)}</Panel>
      </div>
    </form>
  );
}
