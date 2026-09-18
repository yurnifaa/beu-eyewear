'use client';

import { useState } from 'react';

export interface QuantityStepperProps {
  initial?: number;
  value?: number;
  onChange?: (next: number) => void;
}

export default function QuantityStepper({ initial = 1, value, onChange }: QuantityStepperProps) {
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

  return (
    <div className="inline-flex items-center gap-4 rounded-full border border-border px-4 py-2">
      <button
        aria-label="Decrease quantity"
        type="button"
        disabled={count <= 1}
        onClick={() => setCount(Math.max(1, count - 1))}
        className="disabled:cursor-not-allowed disabled:text-muted-foreground/40"
      >
        &minus;
      </button>
      <span className="w-4 text-center text-sm">{count}</span>
      <button aria-label="Increase quantity" type="button" onClick={() => setCount(count + 1)}>
        +
      </button>
    </div>
  );
}
