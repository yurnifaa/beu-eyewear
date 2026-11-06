'use client';

import { useState } from 'react';

export interface QuantityStepperProps {
  initial?: number;
  value?: number;
  onChange?: (next: number) => void;
  // Highest quantity the shopper can pick (for example the units in stock). No limit when omitted.
  max?: number;
  // Greys out and locks the whole stepper, e.g. when the item is sold out.
  disabled?: boolean;
}

export default function QuantityStepper({ initial = 1, value, onChange, max, disabled = false }: QuantityStepperProps) {
  const [internalCount, setInternalCount] = useState(initial);
  const controlled = value !== undefined && onChange !== undefined;
  const count = controlled ? value : internalCount;

  const setCount = (next: number) => {
    if (controlled) {
      onChange(next);
    } else {
      setInternalCount(next);
    }
  };

  const step =
    'grid size-9 place-items-center rounded-full text-lg leading-none transition-colors hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

  return (
    <div aria-disabled={disabled || undefined} className={`beu-chip inline-flex h-12 items-center gap-1 px-1.5 ${disabled ? 'opacity-60' : ''}`}>
      <button
        aria-label="Decrease quantity"
        type="button"
        disabled={disabled || count <= 1}
        onClick={() => setCount(Math.max(1, count - 1))}
        className={step}
      >
        &minus;
      </button>
      <span aria-live="polite" className="w-8 text-center text-sm font-medium tabular-nums">
        {count}
      </span>
      <button
        aria-label="Increase quantity"
        type="button"
        disabled={disabled || (max !== undefined && count >= max)}
        onClick={() => setCount(count + 1)}
        className={step}
      >
        +
      </button>
    </div>
  );
}
