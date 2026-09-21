# BeU (by BeUs)

BeU is an eyewear ecommerce brand under BeUs, where “Be” + “Us” represents the business and its community. “BeU” means “Be You,” with a tagline direction built around “Be You” and “Be Your...”

BeU is a gender-inclusive brand primarily designed for women aged 16-30. It serves fashion-driven buyers, heavy screen users, outdoor-active individuals, and tech-forward early adopters interested in smart or meta glasses, with an accessible luxury position for upper-middle-income customers.

Its core offerings include sunglasses, anti-radiation glasses, smart or meta glasses, and photochromic lenses. Every purchase includes a complimentary case and microfiber cloth, with a 7-day free return policy, a 1-year warranty on standard eyewear, and a 5-year warranty on smart or meta glasses. This repository contains the BeU ecommerce web app, built with Next.js.

## Team Members

![ABUNDO, Jonalene Ryza B.](https://img.shields.io/badge/ABUNDO%2C_Jonalene_Ryza_B.-red?style=for-the-badge) ![ALISWAG, Karylle Vinces J.](https://img.shields.io/badge/ALISWAG%2C_Karylle_Vinces_J.-pink?style=for-the-badge) ![CAYACAP, Faith Aleczes S.](https://img.shields.io/badge/CAYACAP%2C_Faith_Aleczes_S.-yellow?style=for-the-badge) ![DEL ROSARIO, Juana Mari A.](https://img.shields.io/badge/DEL_ROSARIO%2C_Juana_Mari_A.-B22222?style=for-the-badge) ![MAGAAN, Frieda Marie V.](https://img.shields.io/badge/MAGAAN%2C_Frieda_Marie_V.-00008B?style=for-the-badge) ![MULLENO, Jeshaiah Mae A.](https://img.shields.io/badge/MULLENO%2C_Jeshaiah_Mae_A.-blue?style=for-the-badge)

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
		├── login/                          → admin login (separate from buyer)
		├── products/                       → product list
		│   ├── new/                        → add product
		│   └── [id]/                       → edit product
		├── categories/                     → category management
		├── orders/                         → order list
		│   └── [id]/                       → order detail
		├── inventory/                      → stock levels, low stock alerts
		├── customers/                      → customer list
		│   └── [id]/                       → customer detail
		└── reports/                        → sales reports, best sellers
```

**Notes**
- Buyer-facing routes have no URL prefix (e.g. `/cart`, `/listing/123`)
- Admin routes are prefixed with `/admin` (e.g. `/admin/products`)
- `(buyer)` and `(admin)` are organizational only and never appear in the URL
