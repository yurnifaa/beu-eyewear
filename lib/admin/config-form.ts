// Shared by the small admin forms (settings, shipping, offers, catalog options). No
// 'server-only': the form component imports the types.

export interface ConfigFormState {
  error?: string;
  message?: string;
  // What was submitted, so a failed save doesn't wipe the form.
  values?: Record<string, string>;
}

export type FieldConfig =
  | {
      type: 'text' | 'number' | 'date' | 'textarea' | 'color';
      name: string;
      label: string;
      value?: string;
      hint?: string;
      required?: boolean;
      readOnly?: boolean;
      maxLength?: number;
      placeholder?: string;
      wide?: boolean;
    }
  | { type: 'select'; name: string; label: string; value?: string; hint?: string; options: { value: string; label: string }[]; wide?: boolean }
  | { type: 'checkbox'; name: string; label: string; checked: boolean };

// The text of every field, with checkboxes as 'on' or ''.
export function formValues(formData: FormData, textKeys: readonly string[], checkboxKeys: readonly string[] = []) {
  const values: Record<string, string> = {};
  for (const key of textKeys) values[key] = typeof formData.get(key) === 'string' ? String(formData.get(key)) : '';
  for (const key of checkboxKeys) values[key] = formData.get(key) === 'on' ? 'on' : '';
  return values;
}
