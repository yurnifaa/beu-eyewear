# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primarily women aged 16-30, shopping on phones and laptops in the Philippines (prices in pesos, `en-PH`). The brand is gender-inclusive in welcome but women 16-30 are the design target. Four overlapping groups: fashion-driven buyers who want frames that look good on them, heavy screen users who need blue-light protection, outdoor-active people who need sunglasses, and tech-forward early adopters curious about smart or meta glasses. Upper-middle-income; they will pay for quality that feels like a step up but not for a status label. Students are an explicit audience, with a student-ID offer in the catalog.

## Product Purpose

BeU (by BeUs) is an eyewear ecommerce brand: "Be" + "Us" is the business and its community, and "BeU" means "Be You". The site sells sunglasses, anti-radiation (blue-light) glasses, smart or meta glasses, and photochromic lenses, plus bundles and accessories. Success is a visitor who understands what BeU sells, trusts it, finds frames that suit them, and checks out.

## Positioning

Accessible luxury: well-made, fashion-forward eyewear at a price an upper-middle-income 16-30 buyer can reach, with the confidence of an identity brand ("Be You") rather than a clinic or a discount shop. Every purchase includes a complimentary case and microfiber cloth, a 7-day free return, a 1-year warranty on standard eyewear, and a 5-year warranty on smart or meta glasses.

## Operating Context

- Catalog (products, variants, prices, stock, discounts, reviews, shipping) is read from a Google Sheet that staff edit; the home page reads it live, so content ranges are not fixed (see `docs/google-sheets-catalog.md`).
- Category order: Classic, Premium, Smart, Collections, Accessories. Collections hold bundles and student picks.
- Features: search, listing and filters (including frame shape), product detail, cart, checkout, accounts, wishlist, order tracking, and a separate admin area.

## Capabilities and Constraints

- Next.js App Router; buyer routes under `app/(buyer)`, admin under `app/(admin)`. The storefront theme is scoped to `.beu-theme`; admin keeps neutral tokens and is out of scope for storefront design work.
- Offers can be automatic promotions, bundles, or student-ID eligible.
- Stock is checked live at checkout; sold-out items must say so.
- Open product facts (not yet supplied, not to be invented): the actual lens-tech specifications for anti-radiation, photochromic and smart lenses; the typical price range to show on the home page; whether the reviews in the Sheet are from real buyers.

## Brand Commitments

- Name and meaning: BeU, "Be You", from BeUs ("Be" + "Us"). Tagline direction built around "Be You" and "Be Your…".
- Existing identity assets: the BeU logo marks (`public/Logo-*.png`) and the chrome / ice-blue / ink signature with pixel glyphs. Confirmed 2026-11-04: the direction is **elevated punk**. Keep that signature; retire the novelty devices (skulls, "No rules"-style copy, stacked marquees) in favour of craft and trust.
- Confirmed 2026-11-04: the positioning shift applies to the whole storefront, not only the home page.

## Evidence on Hand

- Available: product cutout images (Cyber Oval, Silver Cat-Eye, Tech Wayfarer, Tortoise Pilot), a hero image of the glasses, and the Sheet catalog.
- Said to exist or be planned: on-face / model photography (not in the repository yet), lens-tech specs, and a price range.
- Not confirmed: customer testimonials as real social proof. Do not present any rating, review count, or testimonial as genuine unless the Sheet's reviews are confirmed real.

## Product Principles

- Show the product on a person and say what it does, before saying what the brand feels like.
- Trust is a layer of the page, not a footer: free case and cloth, returns and warranty are stated plainly where a buyer decides.
- Keep one distinctive signature (chrome, ice blue, ink, pixel glyphs) and use it with restraint; craft over novelty.
- The buying data (name, price, rating, stock, offer) is always the clearest text on a product surface.
- Every claim comes from supplied truth: no invented prices, ratings, specs, or reviews.

## Accessibility & Inclusion

No product-specific standard established yet. Treat WCAG 2.2 AA as the working floor (text contrast, 12px minimum readable text, no unpausable moving content, usable touch targets). The brand is gender-inclusive.
