# Google Sheets catalog

The storefront reads its catalog (products, variants, prices, discounts, reviews, shipping, store settings) from a Google Sheet, and records stock changes back to it. Staff edit the Sheet instead of using separate admin screens.

## How it works

```
Google Sheet ──published CSV (read, cached 60 s)──▶ lib/sheets/source.ts ─▶ lib/catalog/sheet-catalog.ts ─▶ lib/catalog/queries.ts ─▶ pages
      ▲   └──Sheets API, service account (live stock, cached 15 s)──────────────────▶ lib/catalog/stock.ts ──┘
      └────────────── SALE / RETURN rows appended to inventory_log ◀── checkout and order cancellation
```

- **Catalog content** is read from the published CSV of each tab. The server keeps each tab for `CATALOG_CACHE_SECONDS` (default 60), so Sheet edits show up within about a minute. Google itself can take a few extra minutes to refresh a published CSV.
- **Stock** is read live through the Sheets API (service account) and kept for `STOCK_CACHE_SECONDS` (default 15). Stock quantities come from the `inventory` tab, which the Sheet calculates from `inventory_log`.
- **Orders write back.** When an order is placed, one `SALE` row per SKU is appended to `inventory_log`. When an order is cancelled, `RETURN` rows are appended. The Sheet's own formulas then lower or raise stock, so the Sheet and the shop never disagree. If the Sheet cannot be written, the order is not placed.
- **Last-unit safety.** Checkout takes a per-SKU database lock, re-reads stock straight from the Sheet, and only then creates the order, so two buyers cannot both take the last unit.
- Without the service account (read-only mode) the shop still works: stock comes from the published `inventory` CSV and orders are not written back.

## Setup

### 1. Publish the tabs (read access)

For each tab in the table below: in the Sheet choose **File → Share → Publish to web → Link**, pick the **tab** (not "Entire document"), choose **Comma-separated values (.csv)**, press **Publish**, and copy the link into `.env.local`.

| Env variable | Tab | Needed |
|---|---|---|
| `CATALOG_CSV_CATEGORIES` | `categories` | required |
| `CATALOG_CSV_SUBCATEGORIES` | `subcategories` | required |
| `CATALOG_CSV_PRODUCTS` | `products` | required |
| `CATALOG_CSV_PRODUCT_VARIANTS` | `product_variants` | required |
| `CATALOG_CSV_STORE_SETTINGS` | `store_settings` | recommended |
| `CATALOG_CSV_INVENTORY` | `inventory` | recommended (fallback stock) |
| `CATALOG_CSV_REVIEWS` | `reviews` | recommended |
| `CATALOG_CSV_DISCOUNTS` | `discounts` | recommended |
| `CATALOG_CSV_FRAME_MATERIALS` | `frame_materials` | recommended |
| `CATALOG_CSV_LENS_OPTIONS` | `lens_options` | recommended |
| `CATALOG_CSV_SHIPPING_METHODS` | `shipping_methods` | recommended |
| `CATALOG_CSV_BUNDLE_ITEMS` | `bundle_items` | recommended |
| `CATALOG_CSV_LOOKUPS` | `lookups` | recommended |

Do **not** publish `inventory_log`, `engagement`, `discount_targets`, `data_dictionary` or `README`. The app does not need them, and a published tab is readable by anyone who has its link.

### 2. Create the service account (live stock and write-back)

1. Open [Google Cloud Console](https://console.cloud.google.com/), create or pick a project, and enable the **Google Sheets API** (APIs & Services → Library).
2. IAM & Admin → **Service Accounts** → Create. A name such as `beu-catalog` is fine; no roles are needed.
3. Open the new account → **Keys** → Add key → Create new key → **JSON**. A file downloads. Keep it private and do not commit it.
4. In the Sheet press **Share**, add the service account's email (`...@...iam.gserviceaccount.com`) as **Editor**, and untick "Notify people".
5. Copy the **spreadsheet id** from the Sheet's normal address: `https://docs.google.com/spreadsheets/d/<THIS PART>/edit`.

### 3. Fill in `.env.local`

`.env.local` is git-ignored. Copy values from `.env.example` and fill in:

```
GOOGLE_SHEETS_SPREADSHEET_ID=<spreadsheet id>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<service account email>
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

The private key is the `private_key` value from the JSON file, on one line, inside double quotes, with the `\n` sequences kept as written. All three Google variables must be set together or the app reports a configuration error.

For deployment (for example Vercel) add the same variables in the host's environment settings, not in the repository.

### 4. Check it

Restart `npm run dev`, then open `/home` and a product page. Place a test order and confirm a `SALE` row appears at the bottom of `inventory_log` and the quantity on the `inventory` tab drops. Cancel the order and confirm a `RETURN` row appears and the quantity comes back.

## Day-to-day use

- **Add stock:** add a `RECEIVE` row to `inventory_log` (positive `qty_change`). Do not type over the formula columns on `inventory`.
- **Remove or correct stock:** add an `ADJUSTMENT` row (negative or positive).
- **Change a price:** edit `base_price_php` on `products`. Sale prices follow from `discounts` and `discount_targets`.
- **Hide a product or color:** set `products.status` to `ARCHIVED`, or `product_variants.status` to `INACTIVE`.
- **Keep the tab and column names.** The app finds data by tab name and column header (`inventory`, `inventory_log`, `sku`, `qty_available`, ...). Renaming them breaks the connection.
- **Images:** the app only uses a product's photo when `is_image_uploaded` is `TRUE` and the path is a local `/...` path (or an `https://*.public.blob.vercel-storage.com` URL). Otherwise it shows its placeholder.

## Security

- All variables are server-only (no `NEXT_PUBLIC_` prefix). They are read in `lib/sheets/config.ts`, and every module that uses them imports `server-only`, so a client component that imports them fails the build.
- URLs, the spreadsheet id and the key never appear in responses, page HTML, client bundles, logs or error messages. Errors name the tab and an HTTP status only. Pages show a generic "catalog unavailable" screen.
- The CSV links must be `https://docs.google.com/spreadsheets/d/...` addresses; redirects are followed by hand and only to Google hosts; responses are capped at 5 MB and time out after 8 s. A bad value in `.env.local` cannot turn the server into a proxy.
- The service account key is used only to sign a token request; it is never logged.
- Honest limits: a published CSV link is readable by anyone who obtains it, wherever it is stored. Keeping it server-side stops the app from revealing it, but it does not make the data private. Publish only the tabs listed above, never tabs with internal data. To revoke a link, use **Publish to web → Stop publishing**. If a key is exposed, delete it in Google Cloud and create a new one.
- Give the service account access to this one Sheet only (Editor), and nothing else.

## Environment variables

| Variable | Purpose |
|---|---|
| `CATALOG_CSV_<TAB>` | Published CSV link for each tab (table above) |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Sheet id, for the Sheets API |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account address |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Service account private key (one line, `\n` kept) |
| `CATALOG_CACHE_SECONDS` | Optional. Catalog reuse time, 5 to 3600, default 60 |
| `STOCK_CACHE_SECONDS` | Optional. Live stock reuse time, 2 to 600, default 15 |

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "We're having trouble loading the shop" | A required `CATALOG_CSV_*` is blank, wrongly pasted, or the tab is not published as CSV. The server log names the tab and reason. |
| Log says `not published as CSV` | The link returns a web page; republish the tab as CSV. |
| Orders fail with "We couldn't place your order" | The Sheets API write failed: check the service account is Editor on the Sheet, the Sheets API is enabled, and the three Google variables are correct. Log shows `Sheets API ... (HTTP <status>)`. |
| Stock looks old after editing the Sheet | Live stock refreshes every 15 s; catalog content every 60 s (plus Google's own refresh of published CSVs). |
| A product is missing | Its row needs `status` `ACTIVE`, a price, a valid category and subcategory, and at least one active variant. The server log reports how many rows were skipped. |

## Legacy admin pages

Marker for searching the codebase: **`LEGACY-CATALOG-ADMIN`** (every file below carries it).

The storefront no longer reads the Prisma `Product`, `Category` and `Subcategory` tables. These admin screens still edit them, so their changes do **not** reach shoppers. They are kept for now and flagged with a banner and a "Legacy" tag in the admin sidebar.

| Area | Files |
|---|---|
| Pages | `app/(admin)/admin/products/**` (list, new, edit, actions), `app/(admin)/admin/categories/**`, `app/(admin)/admin/inventory/**` |
| Components | `component/admin/ProductForm.tsx`, `CategoryForm.tsx`, `DeleteProductButton.tsx`, `DeleteCategoryButton.tsx`, `StockAdjustForm.tsx`, `InventoryStockBadge.tsx`, `LegacyCatalogNotice.tsx` |
| Logic | `lib/admin/inventory.ts`, `lib/catalog/legacy-prisma-queries.ts`, `lib/catalog/form-state.ts`, `lib/validation/product.ts`, `lib/storage/product-image.ts` |
| Navigation | the three `legacy: true` items in `component/admin/AdminSidebar.tsx` |
| Database | models `Product`, `Category`, `Subcategory` in `prisma/schema.prisma`, and `prisma/seed.ts` |

**To remove them:** delete the files above, remove the three sidebar entries, then (separately) drop the three models with a Prisma migration. Nothing else depends on them: orders keep their own snapshot of name, color and price (`OrderItem`), and the dashboard and reports already read the Sheet.

**To bring them back into use:** they would need to be rewritten to edit the Sheet through the Sheets API (service account) instead of Prisma.

Orders, customers, reports and the dashboard are not legacy. The dashboard low-stock and out-of-stock cards and the reports' category breakdown now read the Sheet.
