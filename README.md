<h1 align=center>BeU Eyewear - E-Commerce Platform</h1>
<p align=center>A gender-inclusive eyewear platform offering accessible luxury frames, from anti-radiation and photochromic daily drivers to next-gen smart and meta glasses.</p>
<h2 align="center"> <a target="_blank" href="https://beu-eyewear.vercel.app/home" rel="nofollow">🔗Click Me!</a></h2>

## Team Members

![ABUNDO, Jonalene Ryza B.](https://img.shields.io/badge/ABUNDO%2C_Jonalene_Ryza_B.-blue?style=for-the-badge) ![ALISWAG, Karylle Vinces J.](https://img.shields.io/badge/ALISWAG%2C_Karylle_Vinces_J.-blue?style=for-the-badge) ![CAYACAP, Faith Aleczes S.](https://img.shields.io/badge/CAYACAP%2C_Faith_Aleczes_S.-blue?style=for-the-badge) ![DEL ROSARIO, Juana Mari A.](https://img.shields.io/badge/DEL_ROSARIO%2C_Juana_Mari_A.-blue?style=for-the-badge) ![MAGAAN, Frieda Marie V.](https://img.shields.io/badge/MAGAAN%2C_Frieda_Marie_V.-blue?style=for-the-badge) ![MULLENO, Jeshaiah Mae A.](https://img.shields.io/badge/MULLENO%2C_Jeshaiah_Mae_A.-blue?style=for-the-badge)

## Project structure

This project uses Next.js App Router with route groups to separate buyer-facing and admin pages. Route groups (folders wrapped in parentheses) don't affect the URL path — they're for organization only.

```text
app/
├── page.tsx                                → redirects to /home
├── layout.tsx                              → root layout
├── globals.css
│
├── (buyer)/
│   ├── home/                               → homepage
│   ├── listing/                            → category/listing page
│   │   └── [id]/                           → product detail page (PDP)
│   ├── search/                             → search results page
│   ├── cart/                               → cart page
│   ├── check-out/                          → checkout page
│   ├── order-confirm/                      → order confirmation page
│   ├── login/                              → buyer login
│   ├── register/                           → buyer register
│   ├── account/                            → account dashboard (shared layout)
│   │   ├── page.tsx                        → dashboard overview
│   │   ├── orders/                         → order history
│   │   │   └── [id]/                       → order tracking detail
│   │   ├── addresses/                      → address book
│   │   └── wishlist/                       → wishlist
│   └── (support)/
│       ├── about/
│       ├── contact/
│       ├── faq/
│       └── policies/
│           ├── shipping-returns/
│           └── terms-privacy/
│
└── (admin)/
	└── admin/
		├── page.tsx                        → admin dashboard overview
		├── login/                          → admin login (separate from buyer; lives in app/(admin-auth))
		├── products/                       → product list
		│   ├── new/                        → add product (colors/SKUs, photos, pricing)
		│   └── [id]/                       → edit product
		├── categories/                     → categories and subcategories
		├── inventory/                      → stock per color (SKU), low stock, stock history
		├── reviews/                        → publish / hide reviews, home page testimonials
		├── orders/                         → order list
		│   └── [id]/                       → order detail
		├── customers/                      → customer list
		│   └── [id]/                       → customer detail
		├── reports/                        → sales reports, best sellers
		├── offers/                         → promotions shown on the shop
		├── options/                        → filter lists, frame material and lens descriptions
		└── settings/                       → store details, delivery options
```

**Catalog:** products, colors/SKUs, prices, stock, categories, reviews, offers, delivery options and store settings all live in the Neon Postgres database (see `prisma/schema.prisma`). The admin app edits them and the storefront reads them straight from the database, so a change shows up on the shop on its next page load. There is no spreadsheet or other external catalog source.

- **Stock** is per SKU (one per color) on `ProductVariant`. Checkout and order cancellation change it inside the same database transaction as the order, and every change (sale, return, delivery, correction) is recorded in `StockMovement`, which the admin Inventory page shows.
- **Product photos** are uploaded from the admin to Vercel Blob (`BLOB_READ_WRITE_TOKEN`). Images that ship with the app live under `public/products/` and are referenced as `/products/<file>`.
  - Photos belong to **colors**: each `ProductVariant` has an ordered `imageUrls` list of up to 8 photos (the first is the cover). The product page shows the selected color's photos; cards use the default color's first photo. Photos upload one at a time from the product form to `/admin/api/product-images` (resized to WebP) as soon as they are chosen. A photo uploaded but never saved can be left behind in Blob if the form is abandoned; it's harmless. `Product.imageUrl` / `galleryUrls` are legacy columns that nothing reads or writes any more.
- **New database:** run `npx prisma migrate deploy`, then `npx prisma db seed` to load the starter catalog from `prisma/seed-data/catalog.json` (it only creates what is missing, so it never overwrites admin edits or live stock), then `npm run admin:create` for the admin account.

**Notes**
- Buyer-facing routes have no URL prefix (e.g. `/cart`, `/listing/123`)
- Admin routes are prefixed with `/admin` (e.g. `/admin/products`)
- `(buyer)` and `(admin)` are organizational only and never appear in the URL

**Running locally**

The storefront and the admin panel run as two separate servers from this one codebase, on different ports:

- **`localhost:3000` is the customer storefront only.** `/admin` returns 404 here.
- **`localhost:3001` is the admin panel only** (`localhost:3001/admin`). Storefront pages such as `/home` or `/login` return 404 here, and `/` redirects to `/admin`.

| Command | What it starts | URL |
| --- | --- | --- |
| `npm run dev` | both servers together | :3000 and :3001 |
| `npm run dev:store` | the storefront alone | http://localhost:3000 |
| `npm run dev:admin` | the admin panel alone | http://localhost:3001/admin |

`dev:store` and `dev:admin` each start only one server, so use them when you only need one side. `APP_MODE` (set by these scripts) decides which routes a server answers; `proxy.ts` returns 404 for the rest.

Admin signs in at `/admin/login` and uses its own session cookie (`beu_admin_session`), so it doesn't replace a customer session on :3000.

## Payments (PayRex)

Card and GCash are paid on PayRex's hosted checkout page, so card numbers and GCash logins never touch this site. No SDK: `lib/payments/payrex.ts` calls the REST API with `fetch`. (The site's only mention of the provider's name for buyers is `PAYMENT_PROVIDER_NAME` in `lib/checkout/payment.ts`.)

**How an order gets paid**

1. Checkout saves the order as `UNPAID` (stock is held), then creates a PayRex Checkout Session for it and sends the buyer there. Our order id travels in the session's `metadata`.
2. After paying, PayRex redirects to `/order-confirm/<id>` and calls our webhook, `POST /api/webhooks/payrex` (event `payment_intent.succeeded`), which verifies the signature, checks the amount matches the order and marks it `PAID`.
3. If the webhook is late (or can't reach localhost), the order pages ask PayRex directly when the buyer comes back, so the order still flips to paid.
4. A payment page lapses by itself after 24 hours, but that doesn't put the stock back. A daily cron (`vercel.json` > `/api/cron/expire-unpaid-orders`) cancels card/GCash orders still unpaid after 24 hours, closes their payment page and returns the stock. A buyer can retry any time before that with **Pay now** on their order.

**Environment variables** (see `.env.example`)

| Variable | Where it comes from |
| --- | --- |
| `PAYREX_SECRET_KEY` | PayRex dashboard > Developers > API Keys > View secret key. `sk_test_...` for testing, `sk_live_...` for real money. |
| `PAYREX_WEBHOOK_SECRET` | The secret shown when you create the webhook below. |
| `CRON_SECRET` | Any long random string. Set it in Vercel; Vercel Cron sends it with every cron call. |
| `APP_URL` | The public address of the storefront (`http://localhost:3000` locally). |

**Webhook setup** (PayRex dashboard > Developers > Webhooks): URL `https://<your-domain>/api/webhooks/payrex`, event `payment_intent.succeeded`. PayRex needs a public HTTPS address, so it can't call `localhost` directly; to test webhooks locally run a tunnel (ngrok or cloudflared) and register the tunnel URL as a test-mode webhook. Without one, payments are still picked up when the buyer returns to the site.

**Testing** (test mode, no real money): card `4242 4242 4242 4242` with any future expiry and any 3-digit CVC. All the test cards, how to test webhooks locally, and a webhook troubleshooting table are in [docs/payrex-testing.md](docs/payrex-testing.md).

**Not handled yet:** refunds (do them in the PayRex dashboard; a paid order can't be cancelled in the app), and Maya or QR Ph. Going live needs PayRex account activation ("Activate your account" in the dashboard).
