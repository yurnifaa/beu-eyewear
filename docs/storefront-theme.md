# Storefront theme (BeU ice / chrome / ink)

The buyer-facing site (`app/(buyer)/*`) uses a Y2K x punk look: ice blue, brushed chrome and ink navy, with
pixel glyphs. The admin area is not touched.

## How it is scoped

- `app/(buyer)/layout.tsx` wraps the storefront in `<div class="beu-theme …">`, loads the fonts and renders the
  glyph sprite once.
- `app/(buyer)/beu-theme.css` re-skins the shared tokens **only inside `.beu-theme`**. Outside it (admin) the
  neutral defaults in `app/globals.css` still apply, so shared components such as `Button` look the same there.
- `app/(buyer)/fonts.ts` loads Unbounded (display), Instrument Serif (italic accents) and DM Mono (body). They
  are loaded in the buyer layout, so admin pages never download them.

## Tokens

All colour comes from CSS variables, so components use classes like `bg-accent`, `text-ink`, `bg-ice`, `border-border`.

| Token | Value |
| --- | --- |
| `--background` / `--foreground` | white / ink `#0a1a2f` |
| `--card`, `--muted`, `--border` | ice tints |
| `--accent` (links, CTAs, focus) | `#2f66c4` |
| `--brand-700/800/900` (primary button) | navy |
| `--ink`, `--ice`, `--ice-soft`, `--ice-mist`, `--chrome` | brand constants |
| `--radius-control` (button radius) | pill |

To retheme the whole storefront, change the token block at the top of `beu-theme.css`.

## Home page

`app/(buyer)/home/page.tsx` is still driven by the catalog sheet (featured products, categories, offers,
bundles, student offer, reviews, benefits, frame shapes). Sections live in `component/home/`:

- `HomeHero`, `PunkBand`: static brand sections (hero uses `/public/hero-glasses.png`).
- `ShapePicker`: client component. Shapes come from the sheet's `frame_shape` filter options; the drawings are
  in the glyph sprite (see `SHAPE_GLYPHS` in the page).
- `Spotlight`: the first featured product, shown large. Needs `is_featured` products; hidden if there are none.
- Drop grid, `CategoryRow`, `OfferTicket`, `ReviewsSection`: the existing data, restyled.
- The storefront is light only; there is no dark mode or theme toggle, so do not add `dark:` classes.

## Pixel glyphs

`component/beu/GlyphSprite.tsx` is a hidden SVG sprite (rendered once in the buyer layout). Use a glyph anywhere
in the storefront with `<PixelGlyph name="spark" size={24} className="text-accent" />`. Names: spark, spark-o,
burst, orbit, ball, shoot, cross, heart, star5, bolt, skull, cluster. They fill with `currentColor`.

## Things worth knowing

- CSS in `beu-theme.css` (except tokens) lives in `@layer base/components`, so Tailwind utilities still win.
- The chrome wordmark outline uses stacked `drop-shadow`s instead of `-webkit-text-stroke`, because stroking a
  variable font also draws its overlapping inner contours.
- Brand colours are no longer hardcoded in components; add new colours as tokens in `app/globals.css` and
  `beu-theme.css`.
