'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { buttonClassName } from '@/component/Button';
import PlaceholderImage from '@/component/PlaceholderImage';
import QuantityStepper from '@/component/QuantityStepper';
import { removeFromCart, updateCartQuantity, useCartLines, type CartLine } from '@/lib/cart';
import type { Product } from '@/lib/catalog/types';
import { formatPrice } from '@/lib/format';

interface ResolvedCartItem extends CartLine {
  name: string;
  price: number;
}

function lineKey(line: CartLine) {
  return `${line.slug}::${line.color ?? ''}`;
}

interface CartItemRowProps {
  item: ResolvedCartItem;
  selected: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
}

function CartItemRow({ item, selected, onToggle, onRemove, onQuantityChange }: CartItemRowProps) {
  return (
    <div className="flex gap-4 border-b border-border py-6 first:pt-0">
      <input
        type="checkbox"
        aria-label={`Select ${item.name}`}
        checked={selected}
        onChange={onToggle}
        className="mt-1 h-4 w-4 shrink-0 accent-foreground"
      />
      <PlaceholderImage variant="plain" className="h-28 w-36 shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-bold">{item.name}</p>
            {item.color && <p className="text-sm text-muted-foreground">Color: {item.color}</p>}
          </div>
          <div className="shrink-0 text-right">
            <p className="font-semibold">{formatPrice(item.price)}</p>
            <button type="button" onClick={onRemove} className="mt-1 text-sm text-muted-foreground hover:text-foreground">
              Remove
            </button>
          </div>
        </div>
        <div className="mt-4">
          <QuantityStepper value={item.quantity} onChange={onQuantityChange} />
        </div>
      </div>
    </div>
  );
}

export default function CartSection() {
  const lines = useCartLines();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const slugsKey = [...new Set(lines.map((line) => line.slug))].sort().join(',');

  useEffect(() => {
    const slugs = slugsKey ? slugsKey.split(',') : [];
    if (slugs.length === 0) return;

    let cancelled = false;

    fetch('/api/products/by-slugs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs }),
    })
      .then((res) => res.json())
      .then((data: { products: Product[] }) => {
        if (cancelled) return;
        setProducts(Object.fromEntries((data.products ?? []).map((product) => [product.slug, product])));
      })
      .catch(() => {
        if (!cancelled) setProducts({});
      });

    return () => {
      cancelled = true;
    };
  }, [slugsKey]);

  // Lines default to selected until explicitly toggled off — avoids needing
  // an effect to seed the map as new lines appear.
  const isSelected = (key: string) => selected[key] ?? true;

  const items: ResolvedCartItem[] = lines
    .map((line) => {
      const product = products[line.slug];
      if (!product) return null;
      return { ...line, name: product.name, price: product.price };
    })
    .filter((item): item is ResolvedCartItem => item !== null);

  const allSelected = items.length > 0 && items.every((item) => isSelected(lineKey(item)));
  const selectedItems = items.filter((item) => isSelected(lineKey(item)));
  const selectedCount = selectedItems.length;
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const toggleAll = () => {
    const next = !allSelected;
    setSelected(Object.fromEntries(items.map((item) => [lineKey(item), next])));
  };

  const toggleItem = (key: string) => {
    setSelected((prev) => ({ ...prev, [key]: !isSelected(key) }));
  };

  const removeSelected = () => {
    for (const item of items) {
      if (isSelected(lineKey(item))) removeFromCart(item.slug, item.color);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="flex items-center gap-3 border-b border-border pb-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-foreground" />
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
          items.map((item) => {
            const key = lineKey(item);
            return (
              <CartItemRow
                key={key}
                item={item}
                selected={isSelected(key)}
                onToggle={() => toggleItem(key)}
                onRemove={() => removeFromCart(item.slug, item.color)}
                onQuantityChange={(quantity) => updateCartQuantity(item.slug, item.color, quantity)}
              />
            );
          })
        )}
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
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-bold">
            <span>Total:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link href="/check-out" className={buttonClassName({ variant: 'primary', className: 'mt-6 w-full uppercase' })}>
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
