'use client';

import { useState, type FormEvent } from 'react';
import { z } from 'zod';

type FieldErrors = Record<string, string>;

// Checks a form against the same zod schema the server action uses, so mistakes show up as our own
// red inline messages instead of the browser's native tooltip (which also lets "a@b" through as an
// email). Put `noValidate` on the <form> and spread `formProps` onto it. The server still validates.
export function useFormValidation(schema: z.ZodType) {
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(form: HTMLFormElement): FieldErrors {
    const result = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (result.success) return {};
    const found: FieldErrors = {};
    for (const [name, messages] of Object.entries(z.flattenError(result.error).fieldErrors)) {
      const first = (messages as string[] | undefined)?.[0];
      if (first) found[name] = first;
    }
    return found;
  }

  const formProps = {
    noValidate: true,
    onSubmit(event: FormEvent<HTMLFormElement>) {
      const form = event.currentTarget;
      const found = validate(form);
      setErrors(found);
      const firstInvalid = Object.keys(found)[0];
      if (!firstInvalid) return;
      // Stops the form action from running.
      event.preventDefault();
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
    },
    // After a failed submit, re-check just the field being edited so its message clears as soon as
    // it is fixed (without scolding fields the person hasn't reached yet).
    onInput(event: FormEvent<HTMLFormElement>) {
      const target = event.target as HTMLInputElement;
      if (!target.name) return;
      const fresh = validate(event.currentTarget)[target.name];
      setErrors((current) => {
        if (!(target.name in current) && !fresh) return current;
        const next = { ...current };
        if (fresh && target.name in current) next[target.name] = fresh;
        else delete next[target.name];
        return next;
      });
    },
  };

  return { errors, formProps };
}
