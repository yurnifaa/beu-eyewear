import type { CSSProperties } from "react";

export type GlyphName =
  | "spark"
  | "spark-o"
  | "burst"
  | "orbit"
  | "ball"
  | "shoot"
  | "cross"
  | "heart"
  | "star5"
  | "bolt"
  | "skull"
  | "cluster";

type Props = {
  name: GlyphName;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

/** Pixel glyph from the BeU kit. Colour it with `color` (it fills with currentColor). */
export default function PixelGlyph({ name, size = 48, className, style }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <use href={`#px-${name}`} />
    </svg>
  );
}
