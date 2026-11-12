'use client';

import { useState, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import PasswordToggle from '@/component/PasswordToggle';

export interface IconFieldProps {
  id: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  icon: ReactNode;
  error?: string | string[];
  minLength?: number;
  /** Rewrites the value as the user types or pastes (e.g. to strip disallowed characters). */
  onInput?: React.FormEventHandler<HTMLInputElement>;
  /** Always-visible rule shown under the field (e.g. password length). */
  hint?: string;
}

export default function IconField({
  id,
  type,
  placeholder,
  autoComplete,
  icon,
  error,
  minLength,
  onInput,
  hint,
}: IconFieldProps) {
  const message = Array.isArray(error) ? error[0] : error;
  const describedBy = message ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div
        className={`flex h-12 items-center gap-3 rounded-2xl border bg-background/70 px-4 text-muted-foreground transition focus-within:ring-2 ${
          message
            ? 'border-red-400 focus-within:ring-red-400/30'
            : 'border-border focus-within:border-accent focus-within:ring-accent/30'
        }`}
      >
        <label className="flex h-full min-w-0 flex-1 items-center gap-3">
          {icon}
          <span className="sr-only">{placeholder}</span>
          <input
            id={id}
            name={id}
            type={isPassword && showPassword ? 'text' : type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            minLength={minLength}
            onInput={onInput}
            required
            aria-invalid={message ? true : undefined}
            aria-describedby={describedBy}
            className="h-full w-full bg-transparent text-base md:text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        {isPassword && <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} className="-mr-2" />}
      </div>
      {message ? (
        // The error replaces the hint so the same rule isn't said twice; it takes over the hint's
        // place, in red with an icon, so it reads as an error.
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 px-1 text-xs font-medium text-red-600">
          <CircleAlert size={14} className="mt-px shrink-0" aria-hidden="true" />
          {message}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 px-1 text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
