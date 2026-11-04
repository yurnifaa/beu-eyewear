import PixelGlyph, { type GlyphName } from "@/component/beu/PixelGlyph";

type Piece =
  | { kind: "glyph"; name: GlyphName; size: number; tone: "ice" | "white" }
  | { kind: "word"; text: string }
  | { kind: "script"; text: string };

const PIECES: Piece[] = [
  { kind: "glyph", name: "skull", size: 56, tone: "ice" },
  { kind: "word", text: "No rules" },
  { kind: "glyph", name: "cross", size: 48, tone: "white" },
  { kind: "word", text: "Just frames" },
  { kind: "glyph", name: "bolt", size: 52, tone: "ice" },
  { kind: "word", text: "Be seen" },
  { kind: "glyph", name: "star5", size: 52, tone: "white" },
  { kind: "script", text: "be you." },
  { kind: "glyph", name: "burst", size: 56, tone: "ice" },
];

function Group({ hidden }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden ? true : undefined} className="flex shrink-0 items-center gap-9 pr-9">
      {PIECES.map((piece, index) => {
        if (piece.kind === "glyph") {
          return (
            <PixelGlyph
              key={index}
              name={piece.name}
              size={piece.size}
              className={`shrink-0 ${piece.tone === "ice" ? "text-ice" : "text-white"}`}
            />
          );
        }
        if (piece.kind === "script") {
          return (
            <span key={index} className="font-accent text-[54px] leading-none">
              {piece.text}
            </span>
          );
        }
        return (
          <span key={index} className="font-display text-[40px] font-black uppercase leading-none tracking-[-0.04em]">
            {piece.text}
          </span>
        );
      })}
    </div>
  );
}

// Heavy ink band between the hero and the shop sections.
export default function PunkBand() {
  return (
    <div
      aria-hidden="true"
      className="flex h-24 items-center overflow-hidden border-y-[3px] border-white bg-ink text-white"
    >
      <div className="beu-marquee whitespace-nowrap">
        <Group />
        <Group hidden />
      </div>
    </div>
  );
}
