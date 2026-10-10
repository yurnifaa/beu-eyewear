'use client';

import type { ReactNode } from 'react';

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

  return (
    <div>
      <label
        className={`flex h-12 items-center gap-3 rounded-xl bg-[#F4F5FB] px-4 text-[#8E93A8] focus-within:ring-2 focus-within:ring-[#7B8FD6] dark:bg-muted ${
          message ? 'ring-2 ring-red-400' : ''
        }`}
      >
        {icon}
        <span className="sr-only">{placeholder}</span>
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          required
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? `${id}-error` : undefined}
          className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-[#8E93A8]"
        />
      </label>
      {message && (
        <p id={`${id}-error`} className="mt-1 px-1 text-xs text-red-500">
          {message}
        </p>
      )}
    </div>
  );
}