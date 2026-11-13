import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { createCheckoutSession, type GatewayOrder } from './payrex';

const order: GatewayOrder = {
  id: 'order_test',
  number: 1,
  total: 1500,
  shippingFee: 0,
  paymentMethod: 'CARD',
  items: [{ name: 'Test Frame', color: null, unitPrice: 1500, quantity: 1 }],
};

// None of these reach the network: the localhost guard, and the missing-key check that comes right
// after it, both throw before any request is made.
describe('createCheckoutSession return link', () => {
  const saved = { appUrl: process.env.APP_URL, key: process.env.PAYREX_SECRET_KEY };

  beforeEach(() => {
    delete process.env.PAYREX_SECRET_KEY;
  });

  afterEach(() => {
    if (saved.appUrl === undefined) delete process.env.APP_URL;
    else process.env.APP_URL = saved.appUrl;
    if (saved.key === undefined) delete process.env.PAYREX_SECRET_KEY;
    else process.env.PAYREX_SECRET_KEY = saved.key;
  });

  it('refuses return links to localhost and 127.0.0.1 with an explanation', async () => {
    for (const url of ['http://localhost:3000', 'https://localhost:3000', 'http://127.0.0.1:3000/']) {
      process.env.APP_URL = url;
      await assert.rejects(createCheckoutSession(order), /PayRex rejects return links to localhost/, url);
    }
  });

  it('refuses when APP_URL is not set at all (the default is localhost)', async () => {
    delete process.env.APP_URL;
    await assert.rejects(createCheckoutSession(order), /PayRex rejects return links to localhost/);
  });

  it('lets other hosts past the guard (it then fails on the missing key, not the link)', async () => {
    for (const url of ['http://beu.localhost:3000', 'https://beu-eyewear.vercel.app', 'http://192.168.1.10:3000']) {
      process.env.APP_URL = url;
      await assert.rejects(createCheckoutSession(order), /PAYREX_SECRET_KEY is not set/, url);
    }
  });
});
