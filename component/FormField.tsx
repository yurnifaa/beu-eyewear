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
  floatingLabel?: boolean;
  // Server-side validation messages for this field (from a form action's state).
  errors?: string[];
}

export default function TextField({ id, label, errors, type = 'text', floatingLabel = false, ...props }: TextFieldProps) {
  const hasError = Boolean(errors?.length);

  if (floatingLabel) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <input
            {...props}
            id={id}
            name={id}
            type={type}
            placeholder=" "
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? `${id}-error` : undefined}
            className={`peer h-14 w-full rounded-none border bg-background px-4 pt-6 pb-2 text-base text-foreground outline-none focus:ring-1 ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-foreground focus:ring-foreground'}`}
          />
          <label
            htmlFor={id}
            className="pointer-events-none absolute top-1.5 left-4 text-[10px] text-muted-foreground transition-all duration-150 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] motion-reduce:transition-none"
          >
            {label}
          </label>
        </div>
        {hasError && <p id={`${id}-error`} className="text-xs text-red-500">{errors![0]}</p>}
      </div>
    );
  }

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
