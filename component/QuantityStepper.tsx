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

  const step =
    'grid size-9 place-items-center rounded-full text-lg leading-none transition-colors hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

  return (
    <div className="beu-chip inline-flex h-12 items-center gap-1 px-1.5">
      <button aria-label="Decrease quantity" type="button" disabled={count <= 1} onClick={() => setCount(Math.max(1, count - 1))} className={step}>
        &minus;
      </button>
      <span aria-live="polite" className="w-8 text-center text-sm font-medium tabular-nums">
        {count}
      </span>
      <button aria-label="Increase quantity" type="button" onClick={() => setCount(count + 1)} className={step}>
        +
      </button>
    </div>
  );
}
