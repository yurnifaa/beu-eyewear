'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Button, { buttonClassName } from '@/component/Button';
import PlaceholderImage from '@/component/PlaceholderImage';
import QuantityStepper from '@/component/QuantityStepper';

interface CartItem {
  id: number;
  name: string;
  variants: string[];
  price: number;
  quantity: number;
  selected: boolean;
}

const INITIAL_ITEMS: CartItem[] = [
  { id: 1, name: 'Eyewear Name', variants: ['Color — Color', 'Style — Style'], price: 1000, quantity: 1, selected: true },
  { id: 2, name: 'Eyewear Name', variants: ['Color — Color', 'Style — Style'], price: 1000, quantity: 1, selected: true },
];

function formatPrice(amount: number) {
  return `₱${amount.toLocaleString('en-PH')}`;
}

interface CartItemRowProps {
  item: CartItem;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
  onQuantityChange: (id: number, quantity: number) => void;
}

function CartItemRow({ item, onToggle, onRemove, onQuantityChange }: CartItemRowProps) {
  return (
    <div className="flex gap-4 border-b border-border py-6 first:pt-0">
      <input
        type="checkbox"
        aria-label={`Select ${item.name}`}
        checked={item.selected}
        onChange={() => onToggle(item.id)}
        className="mt-1 h-4 w-4 shrink-0 accent-foreground"
      />
      <PlaceholderImage variant="plain" className="h-28 w-36 shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-bold">{item.name}</p>
            {item.variants.map((variant) => (
              <p key={variant} className="text-sm text-muted-foreground">
                Variant: {variant}
              </p>
            ))}
          </div>
          <div className="shrink-0 text-right">
            <p className="font-semibold">{formatPrice(item.price)}</p>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="mt-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Remove
            </button>
          </div>
        </div>
        <div className="mt-4">
          <QuantityStepper value={item.quantity} onChange={(next) => onQuantityChange(item.id, next)} />
        </div>
      </div>
    </div>
  );
}

export default function CartSection() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);

  const allSelected = items.length > 0 && items.every((item) => item.selected);
  const selectedItems = items.filter((item) => item.selected);
  const selectedCount = selectedItems.length;
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const toggleAll = () => {
    const next = !allSelected;
    setItems((prev) => prev.map((item) => ({ ...item, selected: next })));
  };

  const toggleItem = (id: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)));
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const removeSelected = () => {
    setItems((prev) => prev.filter((item) => !item.selected));
  };

  const setQuantity = (id: number, quantity: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="flex items-center gap-3 border-b border-border pb-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 accent-foreground"
            />
            Select All
          </label>
          <span className="text-border" aria-hidden="true">
            |
          </span>
          <button type="button" onClick={removeSelected} className="text-muted-foreground hover:text-foreground">
            Remove Selected
          </button>
        </div>

        {items.length === 0 ? (
          <p className="py-14 text-center text-sm text-muted-foreground">Your cart is empty.</p>
        ) : (
          items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onToggle={toggleItem}
              onRemove={removeItem}
              onQuantityChange={setQuantity}
            />
          ))
        )}

        <div className="flex items-center justify-center gap-3 pt-8">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background">
            1
          </span>
          <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
            2
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
            3
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 px-0" aria-label="Next page">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="md:sticky md:top-24 md:self-start">
        <div className="rounded-xl border border-border p-6">
          <p className="text-sm font-semibold uppercase tracking-wide">Order Summary</p>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-muted-foreground">Selected Items:</span>
            <span>{selectedCount}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-4 border-t border-border pt-4 flex justify-between font-bold">
            <span>Total:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link
            href="/check-out"
            className={buttonClassName({ variant: 'primary', className: 'mt-6 w-full uppercase' })}
          >
            Proceed to Checkout
          </Link>
          <Link href="/listing" className="mt-4 block text-center text-sm text-muted-foreground underline hover:text-foreground">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
