'use client';

import TextField, { FieldLabel } from '@/component/FormField';
import { ADDRESS_LIMITS, digitsOnly, phoneInputValue, sanitizeName, type AddressFields } from '@/lib/checkout/address';

interface AddressFieldsProps {
  // Prefill. Inputs are uncontrolled, so changing these only takes effect when
  // the parent remounts this component (e.g. via `key`).
  values: Partial<Record<keyof AddressFields, string>>;
  errors?: Record<string, string[] | undefined>;
  floatingLabels?: boolean;
}

const onNameInput = (e: React.FormEvent<HTMLInputElement>) => {
  e.currentTarget.value = sanitizeName(e.currentTarget.value, ADDRESS_LIMITS.fullName);
};

// Mobile number with a fixed "+63". The user types the 10 digits after it; the server turns
// that into the stored 09XXXXXXXXX form (normalizePhone). No maxLength on purpose: the browser
// would cut a pasted "0917 123 4567" before the handler could strip the spaces and the 0.
function PhoneField({ value, errors, floating }: { value?: string; errors?: string[]; floating: boolean }) {
  const hasError = Boolean(errors?.length);
  const boxClassName = `flex w-full items-center rounded-2xl border bg-background/70 text-foreground focus-within:ring-2 ${
    hasError ? 'border-red-500 focus-within:ring-red-500/30' : 'border-border focus-within:border-accent focus-within:ring-accent/30'
  } ${floating ? 'h-14 pt-6 pb-2 text-base' : 'h-12 text-base md:text-sm'}`;

  return (
    <div className="flex flex-col gap-1.5">
      {!floating && <FieldLabel htmlFor="phone">Mobile Number</FieldLabel>}
      <div className="relative">
        {floating && (
          <label htmlFor="phone" className="pointer-events-none absolute top-1.5 left-4 text-[10px] text-muted-foreground">
            Mobile Number
          </label>
        )}
        <div className={boxClassName}>
          <span aria-hidden="true" className="select-none pl-4 text-muted-foreground">
            +63
          </span>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel-national"
            inputMode="numeric"
            placeholder="9171234567"
            required
            defaultValue={phoneInputValue(value ?? '')}
            onInput={(e) => {
              e.currentTarget.value = phoneInputValue(e.currentTarget.value);
            }}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? 'phone-error' : undefined}
            className="h-full min-w-0 flex-1 bg-transparent pr-4 pl-2 outline-none placeholder:text-muted-foreground/70"
          />
        </div>
      </div>
      {hasError && (
        <p id="phone-error" className="text-xs text-red-500">
          {errors![0]}
        </p>
      )}
    </div>
  );
}

// The six shipping-address inputs, shared by checkout and the address book.
export default function AddressFieldsInputs({ values, errors = {}, floatingLabels = false }: AddressFieldsProps) {
  if (floatingLabels) {
    return (
      <div className="flex flex-col gap-5">
        <fieldset>
          <legend className="mb-1 text-xs text-muted-foreground">Personal Details</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField id="fullName" label="Full Name" floatingLabel autoComplete="name" maxLength={ADDRESS_LIMITS.fullName} onInput={onNameInput} required defaultValue={values.fullName} errors={errors.fullName} />
            <PhoneField floating value={values.phone} errors={errors.phone} />
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1 text-xs text-muted-foreground">Address Details</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField id="address" label="Address" floatingLabel autoComplete="street-address" maxLength={ADDRESS_LIMITS.address} required defaultValue={values.address} errors={errors.address} />
            <TextField id="province" label="Province" floatingLabel autoComplete="address-level1" maxLength={ADDRESS_LIMITS.province} required defaultValue={values.province} errors={errors.province} />
            <TextField id="zip" label="Zip / Postal Code" floatingLabel autoComplete="postal-code" inputMode="numeric" maxLength={ADDRESS_LIMITS.zip} onInput={(e) => { e.currentTarget.value = digitsOnly(e.currentTarget.value, ADDRESS_LIMITS.zip); }} required defaultValue={values.zip} errors={errors.zip} />
            <TextField id="city" label="City" floatingLabel autoComplete="address-level2" maxLength={ADDRESS_LIMITS.city} required defaultValue={values.city} errors={errors.city} />
          </div>
        </fieldset>
      </div>
    );
  }

  return (
    <>
      <TextField
        id="fullName"
        label="Full Name"
        autoComplete="name"
        maxLength={ADDRESS_LIMITS.fullName}
        onInput={onNameInput}
        required
        defaultValue={values.fullName}
        errors={errors.fullName}
      />
      <TextField
        id="address"
        label="Address"
        autoComplete="street-address"
        maxLength={ADDRESS_LIMITS.address}
        required
        defaultValue={values.address}
        errors={errors.address}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id="city"
          label="City"
          autoComplete="address-level2"
          maxLength={ADDRESS_LIMITS.city}
          required
          defaultValue={values.city}
          errors={errors.city}
        />
        <TextField
          id="province"
          label="Province"
          autoComplete="address-level1"
          maxLength={ADDRESS_LIMITS.province}
          required
          defaultValue={values.province}
          errors={errors.province}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id="zip"
          label="Zip / Postal Code"
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={ADDRESS_LIMITS.zip}
          onInput={(e) => {
            e.currentTarget.value = digitsOnly(e.currentTarget.value, ADDRESS_LIMITS.zip);
          }}
          required
          defaultValue={values.zip}
          errors={errors.zip}
        />
        <PhoneField floating={false} value={values.phone} errors={errors.phone} />
      </div>
    </>
  );
}
