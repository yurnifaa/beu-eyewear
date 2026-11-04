'use client';

import { useActionState, useId } from 'react';
import { buttonClassName } from '@/component/Button';
import type { ConfigFormState, FieldConfig } from '@/lib/admin/config-form';

const fieldClassName = 'mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm';

// A form built from a list of fields. The small admin screens (settings, shipping,
// offers, catalog options) all use it, so they look and behave the same.
export default function ConfigForm({
  action,
  fields,
  submitLabel,
  columns = 2,
}: {
  action: (previous: ConfigFormState, data: FormData) => Promise<ConfigFormState>;
  fields: FieldConfig[];
  submitLabel: string;
  columns?: 1 | 2 | 3;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const id = useId();
  const grid = columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className={`grid gap-4 ${grid}`}>
        {fields.map((field) => {
          const fieldId = `${id}-${field.name}`;
          if (field.type === 'checkbox') {
            const checked = state.values ? state.values[field.name] === 'on' : field.checked;
            return (
              <label key={field.name} className="flex items-center gap-2 self-end pb-2 text-sm">
                <input type="checkbox" name={field.name} defaultChecked={checked} /> {field.label}
              </label>
            );
          }
          const value = state.values?.[field.name] ?? field.value ?? '';
          const span = field.wide ? 'sm:col-span-full' : '';
          return (
            <div key={field.name} className={span}>
              <label className="text-sm font-semibold" htmlFor={fieldId}>
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select id={fieldId} name={field.name} defaultValue={value} className={fieldClassName}>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea id={fieldId} name={field.name} defaultValue={value} rows={3} maxLength={field.maxLength} required={field.required} placeholder={field.placeholder} className={fieldClassName} />
              ) : field.type === 'color' ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={`${field.label} picker`}
                    defaultValue={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#cccccc'}
                    onChange={(event) => {
                      const text = event.currentTarget.form?.elements.namedItem(field.name);
                      if (text instanceof HTMLInputElement) text.value = event.currentTarget.value.toUpperCase();
                    }}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border bg-background p-0.5"
                  />
                  <input id={fieldId} name={field.name} defaultValue={value} maxLength={7} placeholder={field.placeholder ?? '#C0C6CF'} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
              ) : (
                <input
                  id={fieldId}
                  name={field.name}
                  type={field.type}
                  defaultValue={value}
                  required={field.required}
                  readOnly={field.readOnly}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  min={field.type === 'number' ? 0 : undefined}
                  className={`${fieldClassName} ${field.readOnly ? 'opacity-60' : ''}`}
                />
              )}
              {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
            </div>
          );
        })}
      </div>
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state.message && <p role="status" className="text-sm text-green-700">{state.message}</p>}
      <button type="submit" disabled={pending} className={buttonClassName({ className: 'self-start uppercase' })}>
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
