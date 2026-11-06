'use client';

import { Eye, EyeClosed } from 'lucide-react';

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
  className?: string;
}

/** Eye / eye-closed button that shows or hides the text of a password input. */
export default function PasswordToggle({ visible, onToggle, className = '' }: PasswordToggleProps) {
  const Icon = visible ? Eye : EyeClosed;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
      className={`grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${className}`}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}
