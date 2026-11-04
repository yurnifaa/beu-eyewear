---
name: BeU Eyewear Storefront
description: Y2K x punk eyewear storefront in ice blue, brushed chrome and ink navy, with pixel glyphs and glossy pill controls.
colors:
  ink: "#0a1a2f"
  ink-deep: "#050d18"
  midnight-navy: "#12294a"
  signal-blue: "#2f66c4"
  signal-blue-deep: "#234f9e"
  ice: "#8fcbff"
  ice-soft: "#c7e4ff"
  ice-mist: "#eaf5ff"
  frost: "#f3f9ff"
  rime-border: "#c9dcf0"
  slate-text: "#4a6079"
  chrome: "#9fadbe"
  paper: "#ffffff"
  night-bg: "#07111f"
  night-card: "#0f2038"
  night-muted: "#0b1a2e"
  night-border: "#1e3654"
  night-text: "#9db4cc"
  error-red: "#ef4444"
  star-amber: "#f59e0b"
typography:
  display:
    fontFamily: "Unbounded, Inter, system-ui, sans-serif"
    fontSize: "clamp(7rem, 29vw, 26rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Unbounded, Inter, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Unbounded, Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  body:
    fontFamily: "DM Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "DM Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0.18em"
  accent-script:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
rounded:
  field: "8px"
  input: "12px"
  card: "16px"
  panel: "32px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section: "56px"
components:
  button-primary:
    backgroundColor: "{colors.midnight-navy}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
  button-primary-active:
    backgroundColor: "{colors.ink-deep}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.slate-text}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  button-ghost:
    textColor: "{colors.slate-text}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  button-gloss:
    backgroundColor: "{colors.ice}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 28px"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 28px"
  icon-button:
    rounded: "{rounded.pill}"
    size: "40px"
  input-icon-field:
    backgroundColor: "{colors.ice-mist}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    height: "48px"
    padding: "0 16px"
  input-text-field:
    backgroundColor: "{colors.frost}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 16px"
  card-product-image:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.card}"
  card-ticket:
    backgroundColor: "{colors.ice-mist}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px 20px 20px 28px"
  badge-sale:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-sold-out:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  footer-panel:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "40px"
---

# Design System: BeU Eyewear Storefront

## Overview

**Creative North Star: "The Chrome Lens"**

Everything in the storefront should look like light passing through eyewear: brushed chrome lettering, ice-blue glass surfaces, a glossy candy sheen on the controls, and ink navy where the light stops. It is a Y2K x punk world made for fashion-driven buyers aged 16-30. The mood is cool, glossy and unapologetic ("Chrome. Ice blue. Zero apologies."). It is confident and loud in its display moments and quick and quiet in its commerce moments.

The system pairs two temperaments. Controls are soft, round and tactile (pills, circles, blurred glass). Containers that carry information are hard-edged and graphic (ink-outlined tickets with offset shadows, heavy ink bands, a dashed perforation). Pixel glyphs (sparks, bursts, crosses, skulls, bolts) act as the punk punctuation, always in a single flat `currentColor`.

The storefront is scoped to `.beu-theme`. The admin area keeps the neutral grey tokens from `app/globals.css` and is deliberately outside this system. The home page is wrapped in `.beu-light` and stays light even when the dark toggle is on; header, footer, account and checkout follow the toggle.

This system rejects luxury-beige minimalism: no warm neutrals, no hushed serif-on-cream restraint, no quiet "accessible luxury" tropes.

**Key Characteristics:**
- Ice-blue atmosphere with brushed chrome as lettering, ink navy as structure.
- Wide variable display type (Unbounded, weight 900) over a monospace body (DM Mono).
- Glossy pill CTAs and round icon buttons; hard-edged ticket cards with a hard offset shadow.
- Pixel glyph sprite as the recurring ornament; one flat colour per glyph.
- Motion limited to transform and opacity, with full reduced-motion fallbacks.

## Colors

A cold, saturated-light palette: an ice-blue family for atmosphere, one mid-saturation blue for action, deep ink navy for structure, and a single chrome grey that only appears in lettering gradients and ticket stubs.

### Primary
- **Signal Blue** (`#2f66c4`): the accent for links, focus rings, eyebrows, sale badges, spark glyphs and the accent ticket stub. Shifts to Ice (`#8fcbff`) in dark mode. Hover state is Signal Blue Deep (`#234f9e`).
- **Midnight Navy** (`#12294a`): the primary button fill (`--brand-700`), deepening through Ink (`#0a1a2f`) on hover to Ink Deep (`#050d18`) on press. In dark mode the brand scale inverts to ice tints so the primary button becomes a light button on dark.

### Secondary
- **Ice** (`#8fcbff`): the glass-and-gloss colour. Fills the glossy CTA gradient, selection highlight, category ring (`ring-ice/60`), the ice ticket stub and glyphs on ink.
- **Ice Soft** (`#c7e4ff`) and **Ice Mist** (`#eaf5ff`): hero sky gradient top, ticket body, input fields, footer gradient top.

### Neutral
- **Ink** (`#0a1a2f`): foreground text in light mode, the ticker, the punk band, ticket outlines and hard shadows, and the "ink" secondary CTA.
- **Paper** (`#ffffff`): page background, product image plates, glass highlights.
- **Frost** (`#f3f9ff`): muted surfaces (`--muted`).
- **Rime Border** (`#c9dcf0`): borders and dividers (`--border`).
- **Slate Text** (`#4a6079`): secondary text, labels and inactive controls.
- **Chrome** (`#9fadbe`): mid-tone of the chrome gradient and the chrome ticket stub. Never a large flat fill.

### Dark mode (header, footer, account, checkout)
- **Night** (`#07111f`) background, **Night Card** (`#0f2038`), **Night Muted** (`#0b1a2e`), **Night Border** (`#1e3654`), **Night Text** (`#9db4cc`); foreground becomes Ice Mist (`#eaf5ff`).

### Functional
- **Error Red** (`#ef4444`, Tailwind red-500) for form errors; **Star Amber** (`#f59e0b`) for rating stars only.

### Named Rules
**The Light Stays Light Rule.** Home-page sections sit inside `.beu-light` and never use `dark:` classes. Dark mode applies to header, footer, account and checkout only.

**The Chrome Is Lettering Rule.** The brushed chrome gradient fills type (hero and footer wordmarks) and nothing else. Chrome as a flat panel colour is limited to the ticket stub.

**The Token Rule.** Brand colours come from CSS variables (`bg-accent`, `text-ink`, `bg-ice`). A new colour is added as a token in `app/globals.css` and `beu-theme.css`, not hardcoded in a component.

## Typography

**Display Font:** Unbounded (with Inter, system-ui fallback), variable, used at weights 700-900.
**Body Font:** DM Mono (with ui-monospace fallback), weights 400 and 500.
**Accent Font:** Instrument Serif italic (with Georgia fallback), 400 only.

**Character:** A wide, geometric, almost inflatable display face stacked on a technical monospace gives the Y2K-meets-terminal tension; the italic serif is a single human aside ("be you.", "best self.") that softens the grid.

### Hierarchy
- **Display** (900, `clamp(7rem, 29vw, 26rem)`, 0.9, -0.04em): the chrome "BeU" hero wordmark only; the footer wordmark runs larger at `clamp(8rem, 34vw, 30rem)`.
- **Headline** (900, ~2.5rem, 1, -0.04em, uppercase): punk band words and major section titles. `h1` and `h2` default to Unbounded with -0.02em tracking.
- **Title** (700, 0.75-1rem, 1.375, -0.025em, uppercase): product names, ticket titles and category names, set in `font-display`.
- **Body** (DM Mono 400, 0.875rem, 1.5): all running text, prices, form content. Secondary text drops to 0.75rem in Slate Text.
- **Label** (DM Mono 500, 0.75rem, 0.18-0.2em tracking, uppercase): section labels, eyebrows, nav, footer headings (0.6875rem), CTA text (0.14em).
- **Accent script** (Instrument Serif italic, 1.5-3.375rem, -0.01em): short taglines only.

### Named Rules
**The One Aside Rule.** Instrument Serif italic appears for a single short phrase per section at most; it is never body copy.

**The Mono Is Home Rule.** Anything the user reads for more than a line is DM Mono. Unbounded is for names, numbers that shout and wordmarks.

## Layout

A centred container with generous outer gutters, flexible section stacks, and big scale contrasts between hero type and small mono labels. Max width is 1440px for the header and hero (side padding 12px mobile, 32px or 56px desktop); the footer panel caps at 1328px. Product grids go from a snap-scrolling row of 160px cards on mobile to a four-column grid from the `md` breakpoint (768px). Category tiles are 96px circles on mobile, 112px on desktop, wrapping at three per row. Section labels are centred and flanked by two spark glyphs.

Spacing is a Tailwind 4px-based rhythm: 8-16px inside components, 24-40px between groups, 48-64px between sections. Hero content stacks the oversized wordmark behind the product photo (z-index layers 1-4), with an eyebrow, CTA pair and script tagline in a three-column row on desktop that collapses to a single centred column on mobile.

## Elevation & Depth

Hybrid: glass and glow for interactive surfaces, hard offset shadows for tickets, and flat ink bands for rhythm. Shadows are tinted blue, never neutral grey-black, except the ticket's ink block.

### Shadow Vocabulary
- **Gloss lift** (`box-shadow: 0 10px 22px rgba(40,110,200,0.34), inset 0 2px 0 #fff, inset 0 -3px 6px rgba(40,110,200,0.25)`): the glossy CTA. Reads as a lit glass bead.
- **Glass** (`0 10px 30px rgba(40,100,180,0.18), inset 0 1px 0 #fff`, `backdrop-filter: blur(14px)`, `rgba(255,255,255,0.66)` fill): frosted panels over the hero.
- **Card lift** (`0 18px 26px -14px rgba(10,26,47,0.38)`): fades in under product cards on hover as a separate layer.
- **Orb** (`inset 0 -14px 34px rgba(60,130,210,0.25), 0 34px 64px rgba(60,130,210,0.22)`): the decorative sphere in the spotlight section.
- **Footer panel** (`0 24px 50px rgba(40,100,180,0.16)`): the white rounded footer card.
- **Ticket hard shadow**: a solid Ink block offset 5px right and 5px down behind the ticket (no blur); on hover the ticket slides to widen the offset to 8px.

### Named Rules
**The Hard Shadow Rule.** A solid, blur-free offset shadow belongs to tickets and ink-outlined objects. Every other raised element uses a blue-tinted diffuse shadow.

**The Transform-Only Rule.** Hover feedback animates `transform` and `opacity` only. The lift shadow is its own layer that fades in; `box-shadow` is never animated.

## Shapes

Round means "touch me", square means "read me". Interactive controls are full pills (`999px`) or circles: buttons, icon buttons, badges, category tiles, the theme toggle. Product plates and tickets use 16px corners. Inputs use 12px (icon fields) or 8px (plain fields). The footer panel is a 32px super-rounded card. Ink-outlined objects use a 2px Ink border; the punk band uses a 3px white top and bottom rule. Tickets add a punched look: two circular notches on the stub edge and a dashed perforation line at 40% opacity. Category images sit inside a 4px Ice ring.

## Components

### Buttons
- **Shape:** full pill (`999px`), semibold, with a `transition 150ms ease-out`.
- **Primary:** Midnight Navy fill, white text; `px-4 py-2 text-sm` (medium) or `px-3 py-1.5 text-xs` (small). Hover deepens to Ink, lifts 2px and scales to 105% with a medium shadow; active deepens further and presses down to 97% scale (`.beu-press`).
- **Secondary / Ghost:** 1px Rime Border outline or no outline, Slate Text; hover fills with Frost.
- **Gloss CTA (signature):** `h-12`, `px-7`, uppercase 12px at 0.14em tracking, white-to-Ice vertical gradient with a white inner highlight and a blue underglow. The hero's lead action; one per view.
- **Ink CTA:** same height and type as the gloss, filled Ink, white text; the quiet partner to the gloss.
- **Disabled:** 60% opacity, no lift, no shadow.

### Icon buttons
- **Style:** 40px circle, transparent; hover fills with 15% Signal Blue (`color-mix`). Used for search, account, wishlist, cart and theme toggle at 20px Lucide icons with 1.75 stroke.

### Chips / Badges
- **Sale:** Signal Blue pill, white 12px semibold text, bottom-left of the product image.
- **Out of stock:** foreground-filled pill (Ink in light, Ice Mist in dark) over a 60%-opacity image.
- **Swatches:** 10px colour dots with a 10% black border.

### Cards / Containers
- **Product card:** a 16px image plate (`aspect-3/4` cover for standard, square white contain for featured). The image zooms to 104% on hover; the plate, badges and wishlist button lift 4px together. Text sits below with no card chrome. Featured cards add a star rating and an uppercase Unbounded name.
- **Offer ticket:** Ice Mist body, 2px Ink outline, 16px radius, coloured vertical stub (accent, ink, ice, chrome) with rotated uppercase label, two notches, dashed perforation and a solid Ink offset shadow.
- **Footer panel:** 32px radius white card at 80% opacity, 1px white border, blue diffuse shadow.
- **Internal padding:** 16-20px for tickets and cards, 28-40px for the footer panel.

### Inputs / Fields
- **Icon field:** 48px tall, Ice Mist (`--card`) fill, 12px radius, leading icon in Slate Text, no resting border.
- **Plain field:** Frost (`--muted`) fill, 8px radius, `px-4 py-3`, no border.
- **Floating field (checkout):** 56px tall, square corners, 1px Rime Border, label animates from placeholder position to 10px.
- **Focus:** a 2px Signal Blue ring on icon fields (`focus-within:ring-2 ring-accent`); global focus outline colour is Signal Blue.
- **Error:** red ring and a 12px red message beneath, wired with `aria-describedby`.

### Navigation
- **Header:** sticky, 85% background blur, 1px bottom border, a three-column grid of nav (left), logo mark (centre) and icon buttons (right) in a 1440px container. Mobile collapses the nav into a menu. The logo swaps between dark and light marks with the theme.
- **Ticker:** 40px Ink strip above the header with a looping marquee of uppercase 12px lines separated by Ice sparks.
- **Footer:** gradient from Ice Mist to dusk blue; three-column panel, a row of twelve 40px glyphs, an oversized chrome wordmark cropped at the baseline, and an Ink copyright bar.

### Pixel glyph set (signature)
Twelve single-colour pixel-art glyphs (`spark`, `spark-o`, `burst`, `orbit`, `ball`, `shoot`, `cross`, `heart`, `star5`, `bolt`, `skull`, `cluster`) from a hidden SVG sprite, rendered via `<PixelGlyph>` and filled with `currentColor`. Used at 12-56px as bullets, section-label flanks, hero scatter and the punk band.

### Punk band (signature)
A 96px Ink strip with 3px white top and bottom rules, looping a marquee of 40px black-weight uppercase words, 54px italic script ("be you.") and 48-56px glyphs. Decorative (`aria-hidden`).

## Do's and Don'ts

### Do:
- **Do** use the token classes (`bg-accent`, `text-ink`, `bg-ice`, `border-border`) so the storefront can be re-themed from the two token blocks in `beu-theme.css`.
- **Do** make interactive controls pills or circles (`--radius-control: 999px`) and informational containers 16px-radius plates.
- **Do** keep chrome as gradient lettering and use Ice for everything glassy.
- **Do** tint every diffuse shadow blue (`rgba(40,100,180,…)`) and give tickets the solid Ink offset block.
- **Do** build outlines of chrome type from stacked `drop-shadow` filters.
- **Do** wrap new home-page sections in the existing `.beu-light` scope and avoid `dark:` there.
- **Do** honour `prefers-reduced-motion`: drop travel and zoom, keep the shadow fade and colour changes.

### Don't:
- **Don't** drift into luxury-beige minimalism: no warm neutrals, cream backgrounds or hushed serif-led restraint.
- **Don't** use `-webkit-text-stroke` on Unbounded; it exposes the overlapping contours of the variable font.
- **Don't** animate `box-shadow`; fade a dedicated shadow layer instead.
- **Don't** use Instrument Serif for running text or more than one aside per section.
- **Don't** hardcode brand colours in components or restyle the admin area; admin stays on the neutral tokens.
- **Don't** put more than one gloss CTA in a view, or use the gloss gradient on non-action surfaces.
- **Don't** add multi-colour or outlined-then-filled glyph treatments; a glyph is one `currentColor`.
