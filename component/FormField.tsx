import React from 'react';

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm text-muted-foreground">
      {children}
    </label>
  );
}

interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'name' | 'className'> {
  id: string;
  label: string;
  // Server-side validation messages for this field (from a form action's state).
  errors?: string[];
}

export default function TextField({ id, label, errors, type = 'text', ...props }: TextFieldProps) {
  const hasError = Boolean(errors?.length);

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        name={id}
        type={type}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={`w-full rounded-lg bg-muted px-4 py-3 text-sm outline-none ${
          hasError ? 'ring-1 ring-red-500' : ''
        }`}
        {...props}
      />
      {hasError && (
        <p id={`${id}-error`} className="text-xs text-red-500">
          {errors![0]}
        </p>
      )}
    </div>
  );
}
