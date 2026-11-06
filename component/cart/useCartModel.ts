'use client';

import { useState } from 'react';
import { lineKey as cartLineKey, removeFromCart, updateCartQuantity, useCartLines, type CartLine } from '@/lib/cart';
import { useResolvedCartItems, type ResolvedCartItem } from '@/lib/cart-items';

export function itemKey(line: CartLine) {
  return cartLineKey(line.slug, line.color);
}

// The cart's behaviour, separate from how it looks: every cart design reads this one model, so
// selection, totals and the checkout link can't drift apart between designs.
export function useCartModel() {
  const lines = useCartLines();
  const { items, ready, error, retry } = useResolvedCartItems(lines);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // Lines default to selected until explicitly toggled off, so no effect is needed to seed the map.
  const isSelected = (key: string) => selected[key] ?? true;

  const selectedItems = items.filter((item) => isSelected(itemKey(item)));
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const checkoutHref = `/check-out?${new URLSearchParams(selectedItems.map((item) => ['line', itemKey(item)])).toString()}`;

  return {
    items,
    ready,
    error,
    retry,
    isSelected,
    allSelected,
    selectedItems,
    selectedCount: selectedItems.length,
    subtotal,
    totalUnits,
    // Without any ?line params checkout would fall back to the whole cart, so designs must not
    // offer the link when nothing is selected.
    checkoutHref,
    toggleAll: () => {
      const next = !allSelected;
      setSelected(Object.fromEntries(items.map((item) => [itemKey(item), next])));
    },
    toggleItem: (key: string) => setSelected((prev) => ({ ...prev, [key]: !isSelected(key) })),
    removeSelected: () => {
      for (const item of selectedItems) removeFromCart(item.slug, item.color);
    },
    removeItem: (item: ResolvedCartItem) => removeFromCart(item.slug, item.color),
    setQuantity: (item: ResolvedCartItem, quantity: number) => updateCartQuantity(item.slug, item.color, quantity),
  };
}

export type CartModel = ReturnType<typeof useCartModel>;
