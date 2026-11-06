'use client';

import { useState, type ReactNode } from 'react';
import PasswordToggle from '@/component/PasswordToggle';

export interface IconFieldProps {
  id: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  icon: ReactNode;
  error?: string | string[];
  minLength?: number;
}

export default function IconField({
  id,
  type,
  placeholder,
  autoComplete,
  icon,
  error,
  minLength,
}: IconFieldProps) {
  const message = Array.isArray(error) ? error[0] : error;
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
            required
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? `${id}-error` : undefined}
            className="h-full w-full bg-transparent text-base md:text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        {isPassword && <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} className="-mr-2" />}
      </div>
      {message && (
        <p id={`${id}-error`} className="mt-1 px-1 text-xs text-red-500">
          {message}
        </p>
      )}
    </div>
  );
}
