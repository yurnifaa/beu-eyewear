import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { sendEmail } from './send';
import { orderConfirmationTemplate, type OrderEmailData } from './templates';

const base: OrderEmailData = {
  customerName: 'Jana Del Rosario',
  orderNumber: '#ORD-000123',
  paidAt: new Date('2026-11-11T07:42:00Z'), // 3:42 PM in Manila
  paymentMethod: 'GCash',
  paymentRef: 'pi_test_123',
  items: [
    { name: 'Aviator Classic', color: 'Gold', quantity: 2, unitPrice: 1500 },
    { name: 'Lens Cloth', color: null, quantity: 1, unitPrice: 99 },
  ],
  subtotal: 3099,
  shippingFee: 150,
  shippingLabel: 'Express',
  total: 3249,
  shipName: 'Jana Del Rosario',
  shipAddress: '12 Sampaguita St',
  shipCity: 'Quezon City',
  shipProvince: 'Metro Manila',
  shipZip: '1100',
  shipPhone: '09171234567',
  deliveryEstimate: 'Nov 12–13',
  orderUrl: 'https://beu.example/account/orders/abc',
  supportEmail: 'help@beu.example',
};

describe('orderConfirmationTemplate', () => {
  it('shows the exact amounts, date, items and address', () => {
    const { subject, html, text } = orderConfirmationTemplate(base);
    assert.equal(subject, 'Payment received for order #ORD-000123 — BeU Eyewear');
    for (const body of [html, text]) {
      assert.match(body, /₱3,249/);
      assert.match(body, /₱3,000/); // 2 x 1,500
      assert.match(body, /₱99/);
      assert.match(body, /November 11, 2026/);
      assert.match(body, /3:42/);
      assert.match(body, /Aviator Classic/);
      assert.match(body, /Gold/);
      assert.match(body, /pi_test_123/);
      assert.match(body, /Quezon City, Metro Manila 1100/);
      assert.match(body, /09171234567/);
      assert.match(body, /Nov 12–13/);
      assert.match(body, /https:\/\/beu\.example\/account\/orders\/abc/);
      assert.match(body, /help@beu\.example/);
    }
    assert.match(html, /Hi Jana,/);
  });

  it('says Free for no shipping fee and handles a hand-marked payment with no reference', () => {
    const { html, text } = orderConfirmationTemplate({ ...base, shippingFee: 0, shippingLabel: 'Standard', paymentRef: null });
    assert.match(html, /Free/);
    assert.match(text, /Shipping \(Standard\): Free/);
    assert.match(html, /Confirmed by BeU Eyewear/);
  });

  it('escapes HTML in buyer-supplied text', () => {
    const { html } = orderConfirmationTemplate({
      ...base,
      customerName: '<b>x</b>',
      shipAddress: '<script>alert(1)</script>',
      items: [{ name: '"><img src=x>', quantity: 1, unitPrice: 1 }],
    });
    assert.doesNotMatch(html, /<script>|<img|<b>x/);
    assert.match(html, /&lt;script&gt;/);
  });
});

describe('sendEmail', () => {
  const realFetch = globalThis.fetch;
  const realKey = process.env.BREVO_API_KEY;
  const realFrom = process.env.EMAIL_FROM;
  afterEach(() => {
    globalThis.fetch = realFetch;
    if (realKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = realKey;
    if (realFrom === undefined) delete process.env.EMAIL_FROM;
    else process.env.EMAIL_FROM = realFrom;
  });

  it('posts the html and text parts to Brevo', async () => {
    process.env.BREVO_API_KEY = 'test-key';
    process.env.EMAIL_FROM = 'shop@beu.example';
    let request: { url: string; init: RequestInit } | undefined;
    globalThis.fetch = (async (url: string, init: RequestInit) => {
      request = { url, init };
      return new Response('{}', { status: 201 });
    }) as typeof fetch;

    await sendEmail({ to: 'buyer@example.com', subject: 'Hi', html: '<p>Hi</p>', text: 'Hi' });

    assert.equal(request?.url, 'https://api.brevo.com/v3/smtp/email');
    const body = JSON.parse(String(request?.init.body));
    assert.equal(body.to[0].email, 'buyer@example.com');
    assert.equal(body.htmlContent, '<p>Hi</p>');
    assert.equal(body.textContent, 'Hi');
    assert.equal(body.sender.email, 'shop@beu.example');
  });

  it('throws when Brevo rejects the email', async () => {
    process.env.BREVO_API_KEY = 'test-key';
    process.env.EMAIL_FROM = 'shop@beu.example';
    globalThis.fetch = (async () => new Response('bad sender', { status: 400 })) as typeof fetch;
    await assert.rejects(sendEmail({ to: 'a@b.c', subject: 's', html: 'h' }), /Brevo responded 400/);
  });
});
