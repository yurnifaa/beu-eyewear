# Testing payments (PayRex)

How to try card and GCash checkout on your own machine, and what to check when something doesn't work. Everything here uses PayRex **test mode**: no real money moves and no real card is ever needed.

For how payments work (the flow, env vars, the 24-hour cleanup), see the [Payments section of the main README](../README.md#payments-payrex). This page is only about testing and troubleshooting.

## Contents

- [Set up](#set-up)
- [Test card numbers](#test-card-numbers)
- [Things worth trying](#things-worth-trying)
- [Testing webhooks on your machine (optional)](#testing-webhooks-on-your-machine-optional)
- [If the delivery shows an error](#if-the-delivery-shows-an-error)
- [Other common problems](#other-common-problems)
- [Safety rules](#safety-rules)

## Set up

1. **Get free test keys.** Sign up at [payrex.com](https://www.payrex.com), keep **Test mode** switched on (the orange "viewing test data" banner), then open **Developers → API Keys** and reveal the secret key. Test keys start with `sk_test_`.
2. **Create your `.env`.** Copy `.env.example` to `.env` and fill it in (database, email, etc. as described in the main README). For payments you need:

   | Variable | What to put |
   | --- | --- |
   | `PAYREX_SECRET_KEY` | Your `sk_test_...` key. |
   | `APP_URL` | `http://localhost:3000`. PayRex sends the buyer back here after paying. |
   | `PAYREX_WEBHOOK_SECRET` | Only if you test webhooks (see below). Leave blank otherwise. |
   | `CRON_SECRET` | Only if you try the unpaid-order cleanup (see below). Any random string. |

3. **Make sure the database is up to date**, so the payment columns exist: `npx prisma migrate deploy`.
4. **Start the storefront:** `npm run dev:store`, then open http://localhost:3000. Restart it after any change to `.env`: it is only read at startup.

You don't need a webhook to try checkout. When the buyer returns to the site, the order page asks PayRex whether it was paid and updates the order itself.

## Test card numbers

Use **any future expiry date** and **any 3-digit CVC** with every card below. These only work in test mode.

**Successful payments**

| Card number | Brand |
| --- | --- |
| `4242 4242 4242 4242` | Visa |
| `4701 3222 1111 1234` | Visa (debit) |
| `5425 2334 3010 9903` | Mastercard |
| `5200 8282 8282 8210` | Mastercard (debit) |
| `4000 0007 6000 0002` | Card issued in the Philippines |

**Failures** (use these to test a declined payment)

| Card number | What it simulates | `failed_code` |
| --- | --- | --- |
| `4000 0000 0000 1000` | Fraudulent transaction | `blocked` |
| `4005 5500 0000 0019` | Generic decline | `generic_decline` |
| `4503 3000 0000 0008` | Insufficient funds | `funds_insufficient` |
| `4205 2600 0000 0005` | Incorrect CVC | `cvc_incorrect` |
| `4001 2700 0000 0000` | Processing error | `processing_error` |
| `4012 0000 3333 0026` | System error | `system_error` |

**3-D Secure**

| Card number | What it simulates |
| --- | --- |
| `4311 7800 0024 1409` | Frictionless authentication |
| `4000 0000 0000 0077` | Declined frictionless authentication |

PayRex's own list is on its "Testing your integration" documentation page and may have more cards than this.

**GCash:** PayRex doesn't document a GCash test flow, so how it behaves in test mode depends on your PayRex test account. Try it; if the GCash option is rejected at checkout, use Card instead and check the payment-method settings in your PayRex dashboard.

## Things worth trying

Place an order from the storefront, then check these. The buyer's order page is `/account/orders`; the admin's is `/admin/orders` (start it with `npm run dev:admin` on port 3001, after `npm run admin:create`).

1. **Happy path.** Pay with `4242 4242 4242 4242`. You land on "Thank you" and the order shows **Paid**. In the admin the order says "Paid via PayRex" with a payment reference.
2. **Declined card.** Pay with `4005 5500 0000 0019`. The order stays unpaid. Open it from `/account/orders` and use **Pay now** with a good card: it should work.
3. **Walk away.** Close the payment tab without paying. The order stays unpaid with its stock held. **Pay now** on the order page opens a fresh payment page.
4. **Cancel while unpaid.** Cancel the order from its page. The old payment page is closed, so it can no longer be paid, and the stock goes back.
5. **Unpaid-order cleanup.** Unpaid card/GCash orders are cancelled after 24 hours by a scheduled job. To run it now (this works on your dev database, with `CRON_SECRET` set in `.env`):

   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" "http://localhost:3000/api/cron/expire-unpaid-orders?hours=0"
   ```

   (In Windows PowerShell use `curl.exe`, not `curl`.) `hours=0` means "unpaid for any length of time", so it cancels **every** unpaid card/GCash order that has a payment page. Only do this on a development database. It answers with how many orders it cancelled and how many it skipped.

## Testing webhooks on your machine (optional)

PayRex has to reach your computer over public HTTPS, so use a tunnel such as [ngrok](https://ngrok.com).

1. Run `npm run dev:store`, then in a second terminal `ngrok http 3000`. It prints an address like `https://abc123.ngrok-free.app`.
2. In the PayRex dashboard (still in **Test mode**), go to **Developers → Webhooks** and add a webhook:
   - URL: `https://abc123.ngrok-free.app/api/webhooks/payrex`
   - Event: `payment_intent.succeeded`
3. Copy the secret PayRex shows for that webhook into `PAYREX_WEBHOOK_SECRET` in `.env`, then restart `npm run dev:store`.
4. Place a test order and pay. Then look at the webhook's **delivery log** in the PayRex dashboard. A `payment_intent.succeeded` delivery with a **2xx** response means it works.

Don't judge by the order showing "Paid" alone: the order page also checks PayRex when you return, so it can look fine even when the webhook is broken. The delivery log is the real test.

Free ngrok addresses usually change each time you restart ngrok. When yours does, update the webhook's URL in PayRex.

## If the delivery shows an error

Find the delivery in the PayRex dashboard (**Developers → Webhooks**, your endpoint). PayRex retries failed deliveries for up to 3 days, so a fixed problem often clears by itself.

| Response | Likely cause | What to do |
| --- | --- | --- |
| **400** | The signature didn't check out, so we refused the request. | `PAYREX_WEBHOOK_SECRET` is wrong, has a stray space, or belongs to a different webhook. Copy it again from the webhook you registered, then restart the server. Also check that your key and webhook are in the same mode: a **test** webhook needs an `sk_test_` key. |
| **401, 403 or 404** | PayRex can't reach the route. | Wrong URL (it must end in `/api/webhooks/payrex`), an old tunnel address, or a hosting login/protection page in front of the site. |
| **405** | You opened the URL in a browser. | This is normal: the route only accepts POST requests from PayRex. It confirms the route exists. |
| **500** | Our server hit an error while recording the payment. | Read the server's output (your terminal, or the hosting provider's logs). Usual causes: the database can't be reached, or migrations are missing (`npx prisma migrate deploy`). |
| **Timeout / no response** | Nothing answered. | The dev server or the tunnel isn't running, or the tunnel address changed. |
| **No deliveries at all** | PayRex never tried. | The webhook is disabled, the event `payment_intent.succeeded` isn't selected, or the dashboard is in a different mode (test vs live) from the payment. |

**The delivery says 200 but the order isn't paid.** The response body tells you why. It looks like `{"received":true,"result":"..."}`:

| `result` | Meaning |
| --- | --- |
| `paid` | Worked: this delivery marked the order paid. |
| `already-paid` | The order was already paid (a repeat delivery, or the return-page check got there first). Harmless. |
| `unknown-order` | The payment carries no order id we recognise. Was it made outside this site, or against a different database? |
| `amount-mismatch` | PayRex took a different amount than the order total. The order is deliberately left unpaid for a person to check. |
| `order-cancelled` | The buyer paid after the order was cancelled. The server logs `REFUND NEEDED`: refund it in the PayRex dashboard. |

## Other common problems

- **"We couldn't reach the payment provider" when checking out.** `PAYREX_SECRET_KEY` is missing or wrong, or you haven't restarted the server since editing `.env`. The terminal shows PayRex's own message, which names the problem. The order is still saved: use **Pay now** on it once fixed.
- **The order page stays on "Almost there".** The payment wasn't completed (use **Pay now**), or the site couldn't reach PayRex; check the server terminal.
- **Checkout works but you can't see the payment in the dashboard.** Check the dashboard is in **Test mode**; test and live data are separate.
- **Errors mentioning a missing column** (`checkoutSessionId`, `paymentRef`). Run `npx prisma migrate deploy`.

## Safety rules

- Never commit `.env`. It is already git-ignored; keep it that way.
- Never paste a secret key or webhook secret into an issue, pull request, chat or screenshot. If one leaks, rotate it in the PayRex dashboard (PayRex rotates keys on request via developers@payrex.com).
- Use `sk_test_` keys everywhere except a real production deployment.
- Refunds aren't built in. Refund test or live payments from the PayRex dashboard.
