import PixelGlyph from "@/component/beu/PixelGlyph";
import { getOffers } from "@/lib/catalog/queries";

const BRAND_LINES = ["Be seen. Be you.", "Chrome. Ice blue. Zero apologies."];

// Live promotions ride along in the ticker. Like the footer, it must never break a
// page, so a sheet outage just leaves the brand lines.
async function promoLines() {
  try {
    const offers = await getOffers();
    return offers
      .filter((offer) => !offer.requiresCode)
      .slice(0, 2)
      .map((offer) => offer.name);
  } catch {
    return [];
  }
}

export default async function Ticker() {
  const lines = [...(await promoLines()), ...BRAND_LINES];

  const group = (hidden: boolean) => (
    <div
      aria-hidden={hidden ? true : undefined}
      className="flex shrink-0 items-center gap-10 pr-10"
    >
      {lines.map((line) => (
        <span key={line} className="flex items-center gap-10">
          <span>{line}</span>
          <PixelGlyph name="spark" size={12} className="text-ice" />
        </span>
      ))}
    </div>
  );

  return (
    <aside
      aria-label="Announcements"
      className="flex h-10 items-center overflow-hidden bg-ink text-xs uppercase tracking-[0.14em] text-ice-mist"
    >
      <div className="beu-marquee whitespace-nowrap">
        {group(false)}
        {group(true)}
      </div>
    </aside>
  );
}
