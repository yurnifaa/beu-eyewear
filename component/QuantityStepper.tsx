'use client';

import { useState } from 'react';

export interface QuantityStepperProps {
  initial?: number;
}

export default function QuantityStepper({ initial = 1 }: QuantityStepperProps) {
  const [count, setCount] = useState(initial);

  return (
    <div className="inline-flex items-center gap-4 rounded-full border border-border px-4 py-2">
      <button
        aria-label="Decrease quantity"
        type="button"
        disabled={count <= 1}
        onClick={() => setCount((c) => Math.max(1, c - 1))}
        className="disabled:cursor-not-allowed disabled:text-muted-foreground/40"
      >
        &minus;
      </button>
      <span className="w-4 text-center text-sm">{count}</span>
      <button aria-label="Increase quantity" type="button" onClick={() => setCount((c) => c + 1)}>
        +
      </button>
    </div>
  );
}
