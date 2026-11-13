import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { addressSchema, checkoutSchema, savedAddressSchema } from './checkout';
import { NO_MARKUP_MESSAGE, cleanText, hasMarkup, optionalSafeText, safeText } from './text';

const field = safeText({ required: 'Required', label: 'Field', max: 20 });

describe('cleanText', () => {
  it('collapses whitespace, including tabs and newlines, and trims', () => {
    assert.equal(cleanText('  12   Rizal\tSt.\n\n#4  '), '12 Rizal St. #4');
  });

  it('drops zero-width, bidi-override and BOM characters', () => {
    assert.equal(cleanText('Que​zon‮ City﻿'), 'Quezon City');
  });

  it('normalizes to NFC', () => {
    // "n" + combining tilde becomes the single character ñ.
    assert.equal(cleanText('Mañana'), 'Mañana');
  });

  it('leaves ordinary address punctuation alone', () => {
    const value = "123 Rizal St. #4, Brgy. San Jose / Unit 5-B & Sons (O'Brien)";
    assert.equal(cleanText(value), value);
  });
});

describe('safeText', () => {
  it('accepts normal addresses and punctuation', () => {
    assert.equal(field.parse('Brgy. San Jose #4'), 'Brgy. San Jose #4');
    assert.equal(field.parse("O'Brien & Sons"), "O'Brien & Sons");
  });

  it('rejects script and tag markup with the shared message', () => {
    // Roomy field, so it is the markup (not the length limit) that gets reported.
    const roomy = safeText({ required: 'Required', label: 'Field', max: 100 });
    for (const payload of ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', 'a < b', 'x>y']) {
      const result = roomy.safeParse(payload);
      assert.equal(result.success, false, payload);
      if (!result.success) assert.equal(result.error.issues[0]?.message, NO_MARKUP_MESSAGE);
    }
  });

  it('rejects markup hidden behind invisible characters', () => {
    // Stripping the zero-width space must not let the tag through.
    assert.equal(field.safeParse('<​script>').success, false);
  });

  it('enforces required and max length after cleaning', () => {
    assert.equal(field.safeParse('   ​  ').success, false);
    assert.equal(field.safeParse('x'.repeat(21)).success, false);
    assert.equal(field.safeParse('x'.repeat(20)).success, true);
  });

  it('optional variant allows empty', () => {
    const optional = optionalSafeText({ label: 'Label', max: 5 });
    assert.equal(optional.parse(''), '');
    assert.equal(optional.safeParse('<b>').success, false);
  });
});

describe('hasMarkup', () => {
  it('only flags angle brackets', () => {
    assert.equal(hasMarkup('plain & simple "quoted"'), false);
    assert.equal(hasMarkup('<'), true);
    assert.equal(hasMarkup('>'), true);
  });
});

const address = {
  fullName: 'Jana Del Rosario',
  address: '12 Sampaguita St.',
  city: 'Quezon City',
  province: 'Metro Manila',
  zip: '1100',
  phone: '09171234567',
};

describe('checkout schemas use the sanitizer', () => {
  it('accepts a normal address', () => {
    assert.equal(addressSchema.safeParse(address).success, true);
  });

  it('rejects markup in address, city and province', () => {
    for (const key of ['address', 'city', 'province'] as const) {
      const result = addressSchema.safeParse({ ...address, [key]: '<script>alert(1)</script>' });
      assert.equal(result.success, false, key);
      if (!result.success) assert.equal(result.error.issues[0]?.path[0], key);
    }
  });

  it('rejects markup in the address nickname and turns empty into null', () => {
    const base = { ...address, isDefault: false };
    assert.equal(savedAddressSchema.safeParse({ ...base, label: '<b>Home</b>' }).success, false);
    const ok = savedAddressSchema.parse({ ...base, label: '   ' });
    assert.equal(ok.label, null);
  });

  it('rejects markup in the promo code', () => {
    const order = {
      ...address,
      shippingMethod: 'STANDARD',
      paymentMethod: 'WALLET',
      lines: [{ slug: 'x', quantity: 1 }],
    };
    // Control: the same order with a normal code is valid, so the failure below is the code itself.
    assert.equal(checkoutSchema.safeParse({ ...order, promoCode: 'WELCOME10' }).success, true);
    assert.equal(checkoutSchema.safeParse(order).success, true);

    const result = checkoutSchema.safeParse({ ...order, promoCode: '<script>' });
    assert.equal(result.success, false);
    if (!result.success) assert.equal(result.error.issues[0]?.path[0], 'promoCode');
  });
});
