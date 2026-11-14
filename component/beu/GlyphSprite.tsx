// Hidden SVG sprite: chrome/lens gradients, eyewear shapes (g-*) and pixel glyphs (px-*).
// Rendered once by app/(buyer)/layout.tsx; every <PixelGlyph> and the shape picker point at it.
export default function GlyphSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.22" stopColor="#C4E4FF" />
          <stop offset="0.58" stopColor="#6FB4F5" />
          <stop offset="1" stopColor="#3F78D0" />
        </linearGradient>
        <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.3" stopColor="#C9D2DC" />
          <stop offset="0.5" stopColor="#7F8D9F" />
          <stop offset="0.62" stopColor="#E9EEF3" />
          <stop offset="1" stopColor="#A9B4C1" />
        </linearGradient>
        <symbol id="spark" viewBox="0 0 24 24">
          <path
            d="M12 0C12.8 7.2 16.8 11.2 24 12C16.8 12.8 12.8 16.8 12 24C11.2 16.8 7.2 12.8 0 12C7.2 11.2 11.2 7.2 12 0Z"
            fill="currentColor"
          />
        </symbol>
        <symbol id="g-shield" viewBox="0 0 240 100">
          <g fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round">
            <path
              d="M12 30H228Q232 62 208 78Q182 92 158 70Q142 56 120 56Q98 56 82 70Q58 92 32 78Q8 62 12 30Z"
              fill="url(#lens)"
            />
            <path d="M10 24H230" strokeWidth="12" />
          </g>
        </symbol>
        <symbol id="g-wrap" viewBox="0 0 240 100">
          <g fill="none" stroke="currentColor" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round">
            <path
              d="M16 40Q16 30 28 30H100Q112 30 112 44Q108 70 82 74Q48 78 28 66Q16 58 16 40Z"
              fill="url(#lens)"
            />
            <path
              d="M16 40Q16 30 28 30H100Q112 30 112 44Q108 70 82 74Q48 78 28 66Q16 58 16 40Z"
              fill="url(#lens)"
              transform="translate(240 0) scale(-1 1)"
            />
            <path d="M112 40Q120 35 128 40" />
            <path d="M18 36L5 30" />
            <path d="M222 36L235 30" />
          </g>
        </symbol>
        <symbol id="g-round" viewBox="0 0 240 100">
          <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
            <circle cx="62" cy="52" r="36" fill="url(#lens)" />
            <circle cx="178" cy="52" r="36" fill="url(#lens)" />
            <path d="M98 46Q120 34 142 46" />
            <path d="M27 46L8 40" />
            <path d="M213 46L232 40" />
          </g>
        </symbol>
        <symbol id="g-rect" viewBox="0 0 240 100">
          <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
            <rect x="14" y="24" width="94" height="56" rx="16" fill="url(#lens)" />
            <rect x="132" y="24" width="94" height="56" rx="16" fill="url(#lens)" />
            <path d="M108 42Q120 35 132 42" />
            <path d="M14 36L4 32" />
            <path d="M226 36L236 32" />
          </g>
        </symbol>
        <symbol id="g-butterfly" viewBox="0 0 240 100">
          <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
            <path d="M14 30Q50 14 108 28Q116 64 92 80Q60 92 32 72Q10 54 14 30Z" fill="url(#lens)" />
            <path
              d="M14 30Q50 14 108 28Q116 64 92 80Q60 92 32 72Q10 54 14 30Z"
              fill="url(#lens)"
              transform="translate(240 0) scale(-1 1)"
            />
            <path d="M108 36Q120 29 132 36" />
          </g>
        </symbol>
        <symbol id="px-spark" viewBox="0 0 56 56">
          <path
            fill="currentColor"
            shapeRendering="crispEdges"
            d="M27 9h2v7h-2zM26 16h4v3h-4zM25 19h6v2h-6zM24 21h8v2h-8zM23 23h10v1h-10zM22 24h12v1h-12zM21 25h14v1h-14zM20 26h16v1h-16zM18 27h20v2h-20zM20 29h16v1h-16zM21 30h14v1h-14zM22 31h12v1h-12zM23 32h10v1h-10zM24 33h8v2h-8zM25 35h6v2h-6zM26 37h4v3h-4zM27 40h2v7h-2z"
          />
        </symbol>
        <symbol id="px-spark-o" viewBox="0 0 56 56">
          <path
            fill="currentColor"
            shapeRendering="crispEdges"
            d="M27 9h2v6h-2zM26 15h4v3h-4zM25 18h6v2h-6zM29 20h3v2h-3zM24 20h3v2h-3zM23 22h4v1h-4zM29 22h4v1h-4zM30 23h4v2h-4zM22 23h4v2h-4zM20 25h5v1h-5zM31 25h5v1h-5zM32 26h5v1h-5zM19 26h5v1h-5zM34 27h6v2h-6zM16 27h6v2h-6zM32 29h5v1h-5zM19 29h5v1h-5zM20 30h5v1h-5zM31 30h5v1h-5zM30 31h4v2h-4zM22 31h4v2h-4zM23 33h4v1h-4zM29 33h4v1h-4zM29 34h3v2h-3zM24 34h3v2h-3zM25 36h6v2h-6zM26 38h4v3h-4zM27 41h2v6h-2z"
          />
        </symbol>
        <symbol id="px-burst" viewBox="0 0 56 56">
          <path
            fill="currentColor"
            shapeRendering="crispEdges"
            d="M28 2h1v1h-1zM27 3h2v5h-2zM27 8h3v1h-3zM26 9h4v6h-4zM15 15h1v1h-1zM40 15h1v1h-1zM16 16h2v1h-2zM38 16h2v1h-2zM16 17h4v1h-4zM36 17h4v1h-4zM17 18h5v1h-5zM34 18h5v1h-5zM25 15h6v5h-6zM17 19h7v1h-7zM32 19h7v1h-7zM18 20h20v2h-20zM19 22h18v1h-18zM30 23h7v1h-7zM19 23h10v1h-10zM20 24h8v1h-8zM30 24h6v1h-6zM30 25h10v1h-10zM16 25h11v1h-11zM30 26h16v1h-16zM10 26h13v1h-13zM31 27h21v1h-21zM4 27h20v1h-20zM32 28h21v1h-21zM3 28h22v1h-22zM9 29h17v1h-17zM33 29h14v1h-14zM29 30h11v1h-11zM16 30h10v1h-10zM20 31h6v1h-6zM28 31h8v1h-8zM19 32h7v1h-7zM27 32h10v1h-10zM19 33h18v1h-18zM18 34h20v2h-20zM17 36h7v1h-7zM32 36h7v1h-7zM17 37h5v1h-5zM34 37h5v1h-5zM16 38h4v1h-4zM36 38h4v1h-4zM16 39h2v1h-2zM38 39h2v1h-2zM25 36h6v5h-6zM15 40h1v1h-1zM40 40h1v1h-1zM26 41h4v6h-4zM27 47h3v1h-3zM27 48h2v5h-2zM28 53h1v1h-1z"
          />
        </symbol>
        <symbol id="px-orbit" viewBox="0 0 56 56">
          <path
            fill="currentColor"
            shapeRendering="crispEdges"
            d="M35 8h9v1h-9zM32 9h14v1h-14zM29 10h18v1h-18zM26 11h15v1h-15zM24 12h12v1h-12zM23 13h10v1h-10zM21 14h10v1h-10zM19 15h10v1h-10zM18 16h9v1h-9zM50 16h1v2h-1zM17 17h8v1h-8zM16 18h8v1h-8zM49 18h3v2h-3zM14 19h8v1h-8zM13 20h8v1h-8zM48 20h4v1h-4zM12 21h7v1h-7zM48 21h3v1h-3zM11 22h7v1h-7zM47 22h4v2h-4zM11 23h6v1h-6zM10 24h6v1h-6zM46 24h4v1h-4zM9 25h6v1h-6zM27 24h2v3h-2zM45 25h5v2h-5zM8 26h6v1h-6zM8 27h5v1h-5zM44 27h5v1h-5zM26 27h4v2h-4zM7 28h5v1h-5zM43 28h5v1h-5zM42 29h6v1h-6zM6 29h5v2h-5zM41 30h6v1h-6zM27 29h2v3h-2zM40 31h6v1h-6zM6 31h4v1h-4zM39 32h6v1h-6zM5 32h4v2h-4zM38 33h7v1h-7zM5 34h3v1h-3zM37 34h7v1h-7zM4 35h4v1h-4zM35 35h8v1h-8zM34 36h8v1h-8zM4 36h3v2h-3zM32 37h8v1h-8zM31 38h8v1h-8zM5 38h1v2h-1zM29 39h9v1h-9zM27 40h10v1h-10zM25 41h10v1h-10zM23 42h10v1h-10zM20 43h12v1h-12zM15 44h15v1h-15zM9 45h18v1h-18zM10 46h14v1h-14zM12 47h9v1h-9z"
          />
        </symbol>
        <symbol id="px-ball" viewBox="0 0 56 56">
          <path
            fill="currentColor"
            shapeRendering="crispEdges"
            d="M24 2h8v1h-8zM20 3h16v1h-16zM17 4h22v1h-22zM15 5h26v1h-26zM14 6h9v1h-9zM33 6h9v1h-9zM12 7h7v1h-7zM33 7h3v1h-3zM20 7h3v1h-3zM37 7h7v1h-7zM11 8h6v1h-6zM34 8h2v1h-2zM39 8h6v1h-6zM20 8h2v1h-2zM10 9h5v1h-5zM41 9h5v1h-5zM27 6h2v5h-2zM34 9h3v2h-3zM19 9h3v2h-3zM9 10h5v1h-5zM42 10h5v1h-5zM8 11h40v1h-40zM7 12h42v2h-42zM44 14h6v1h-6zM6 14h6v1h-6zM18 14h3v2h-3zM35 14h3v2h-3zM44 15h7v1h-7zM5 15h7v1h-7zM45 16h6v1h-6zM5 16h6v1h-6zM18 16h2v2h-2zM36 16h2v2h-2zM27 14h2v5h-2zM45 17h7v2h-7zM4 17h7v2h-7zM17 18h3v1h-3zM36 18h3v1h-3zM4 19h48v1h-48zM3 20h50v2h-50zM50 22h3v2h-3zM3 22h3v2h-3zM27 22h2v5h-2zM17 22h3v5h-3zM7 22h3v5h-3zM46 22h3v5h-3zM36 22h3v5h-3zM50 24h4v3h-4zM2 24h4v3h-4zM2 27h52v2h-52zM50 29h4v3h-4zM2 29h4v3h-4zM27 29h2v5h-2zM17 29h3v5h-3zM7 29h3v5h-3zM46 29h3v5h-3zM36 29h3v5h-3zM50 32h3v2h-3zM3 32h3v2h-3zM3 34h50v2h-50zM4 36h48v1h-48zM17 37h3v1h-3zM36 37h3v1h-3zM45 37h7v2h-7zM4 37h7v2h-7zM18 38h2v2h-2zM36 38h2v2h-2zM45 39h6v1h-6zM5 39h6v1h-6zM44 40h7v1h-7zM5 40h7v1h-7zM27 37h2v5h-2zM18 40h3v2h-3zM35 40h3v2h-3zM44 41h6v1h-6zM6 41h6v1h-6zM7 42h42v2h-42zM8 44h40v1h-40zM9 45h5v1h-5zM42 45h5v1h-5zM34 45h3v2h-3zM19 45h3v2h-3zM10 46h5v1h-5zM41 46h5v1h-5zM11 47h6v1h-6zM34 47h2v1h-2zM39 47h6v1h-6zM20 47h2v1h-2zM12 48h7v1h-7zM33 48h3v1h-3zM20 48h3v1h-3zM37 48h7v1h-7zM27 45h2v5h-2zM14 49h9v1h-9zM33 49h9v1h-9zM15 50h26v1h-26zM17 51h22v1h-22zM20 52h16v1h-16zM24 53h8v1h-8z"
          />
        </symbol>
        <symbol id="px-shoot" viewBox="0 0 56 56">
          <path
            fill="currentColor"
            shapeRendering="crispEdges"
            d="M41 4h2v4h-2zM40 8h4v2h-4zM39 10h6v1h-6zM38 11h8v1h-8zM37 12h10v1h-10zM35 13h14v2h-14zM36 15h11v1h-11zM36 16h10v1h-10zM35 17h10v1h-10zM35 18h9v1h-9zM34 19h10v1h-10zM33 20h10v2h-10zM32 22h11v2h-11zM31 24h9v1h-9zM31 25h8v1h-8zM30 26h9v1h-9zM29 27h9v1h-9zM29 28h8v1h-8zM28 29h8v1h-8zM27 30h9v1h-9zM27 31h8v1h-8zM26 32h8v1h-8zM25 33h8v1h-8zM25 34h7v1h-7zM24 35h7v1h-7zM23 36h7v1h-7zM22 37h7v1h-7zM22 38h6v1h-6zM21 39h6v1h-6zM20 40h6v1h-6zM19 41h6v1h-6zM18 42h6v1h-6zM17 43h6v1h-6zM16 44h6v1h-6zM15 45h6v1h-6zM14 46h5v1h-5zM13 47h5v1h-5zM11 48h5v1h-5zM10 49h5v1h-5zM8 50h5v1h-5zM6 51h5v1h-5zM3 52h5v1h-5zM2 53h2v1h-2z"
          />
        </symbol>
        <symbol id="px-cross" viewBox="0 0 56 56">
          <path
            fill="currentColor"
            shapeRendering="crispEdges"
            d="M13 11h5v1h-5zM38 11h5v1h-5zM12 12h7v1h-7zM37 12h7v1h-7zM11 13h9v2h-9zM36 13h9v2h-9zM35 15h10v1h-10zM11 15h10v1h-10zM11 16h9v2h-9zM36 16h9v2h-9zM35 18h9v1h-9zM12 18h9v1h-9zM34 19h9v1h-9zM13 19h9v1h-9zM18 20h5v1h-5zM15 20h1v1h-1zM40 20h1v1h-1zM33 20h5v1h-5zM32 21h5v1h-5zM19 21h5v1h-5zM20 22h5v1h-5zM31 22h5v1h-5zM21 23h5v1h-5zM30 23h5v1h-5zM29 24h5v1h-5zM22 24h5v1h-5zM23 25h10v1h-10zM24 26h8v1h-8zM25 27h6v2h-6zM24 29h8v1h-8zM23 30h10v1h-10zM29 31h5v1h-5zM22 31h5v1h-5zM21 32h5v1h-5zM30 32h5v1h-5zM20 33h5v1h-5zM31 33h5v1h-5zM32 34h5v1h-5zM19 34h5v1h-5zM18 35h5v1h-5zM15 35h1v1h-1zM40 35h1v1h-1zM33 35h5v1h-5zM34 36h9v1h-9zM13 36h9v1h-9zM35 37h9v1h-9zM12 37h9v1h-9zM11 38h9v2h-9zM36 38h9v2h-9zM35 40h10v1h-10zM11 40h10v1h-10zM11 41h9v2h-9zM36 41h9v2h-9zM12 43h7v1h-7zM37 43h7v1h-7zM13 44h5v1h-5zM38 44h5v1h-5z"
          />
        </symbol>
        <symbol id="px-heart" viewBox="0 0 56 56">
          <path
            fill="currentColor"
            shapeRendering="crispEdges"
            d="M47 2h1v3h-1zM46 5h3v2h-3zM45 7h5v1h-5zM44 8h8v1h-8zM45 9h5v1h-5zM46 10h3v1h-3zM47 11h2v1h-2zM47 12h1v2h-1zM15 13h5v1h-5zM36 13h5v1h-5zM13 14h10v1h-10zM33 14h10v1h-10zM12 15h12v1h-12zM32 15h12v1h-12zM10 16h15v1h-15zM31 16h15v1h-15zM9 17h17v1h-17zM30 17h17v1h-17zM9 18h18v1h-18zM29 18h18v1h-18zM8 19h19v1h-19zM29 19h19v1h-19zM25 20h6v1h-6zM36 20h12v1h-12zM8 20h12v1h-12zM26 21h4v1h-4zM8 21h10v1h-10zM38 21h10v1h-10zM27 22h2v1h-2zM7 22h10v2h-10zM39 22h10v2h-10zM7 24h9v1h-9zM40 24h9v1h-9zM8 25h8v3h-8zM40 25h8v3h-8zM39 28h8v2h-8zM9 28h8v2h-8zM38 30h8v1h-8zM10 30h8v1h-8zM11 31h8v1h-8zM37 31h8v1h-8zM11 32h9v1h-9zM36 32h9v1h-9zM35 33h9v1h-9zM12 33h9v1h-9zM34 34h9v1h-9zM13 34h9v1h-9zM14 35h9v1h-9zM33 35h9v1h-9zM16 36h8v1h-8zM32 36h8v1h-8zM31 37h8v1h-8zM17 37h8v1h-8zM30 38h8v1h-8zM18 38h8v1h-8zM19 39h8v1h-8zM29 39h8v1h-8zM20 40h16v1h-16zM21 41h14v1h-14zM22 42h12v1h-12zM24 43h8v2h-8zM25 45h6v1h-6zM26 46h4v1h-4zM27 47h2v2h-2z"
          />
        </symbol>
        <symbol id="px-star5" viewBox="0 0 56 56">
          <path
            fill="currentColor"
            shapeRendering="crispEdges"
            d="M28 2h1v1h-1zM27 3h2v2h-2zM26 5h4v2h-4zM26 7h5v1h-5zM25 8h6v2h-6zM24 10h8v3h-8zM23 13h10v2h-10zM23 15h5v1h-5zM29 15h5v3h-5zM22 16h5v2h-5zM21 18h5v1h-5zM30 18h5v1h-5zM8 19h18v1h-18zM30 19h18v1h-18zM3 20h23v1h-23zM30 20h23v1h-23zM5 21h20v1h-20zM31 21h20v1h-20zM6 22h19v1h-19zM31 22h19v1h-19zM7 23h17v1h-17zM32 23h17v1h-17zM8 24h8v1h-8zM40 24h8v1h-8zM39 25h7v1h-7zM10 25h7v1h-7zM11 26h8v1h-8zM37 26h8v1h-8zM36 27h8v1h-8zM12 27h8v1h-8zM14 28h7v1h-7zM35 28h7v1h-7zM15 29h7v1h-7zM34 29h7v1h-7zM34 30h6v1h-6zM16 30h6v1h-6zM17 31h5v2h-5zM34 31h5v2h-5zM35 33h4v1h-4zM17 33h4v1h-4zM27 34h2v1h-2zM25 35h6v1h-6zM35 34h5v3h-5zM16 34h5v3h-5zM24 36h8v1h-8zM16 37h4v1h-4zM36 37h4v1h-4zM22 37h12v1h-12zM15 38h5v1h-5zM21 38h14v1h-14zM36 38h5v1h-5zM15 39h26v1h-26zM15 40h11v1h-11zM30 40h11v1h-11zM31 41h11v1h-11zM14 41h11v1h-11zM14 42h9v1h-9zM33 42h9v1h-9zM14 43h8v1h-8zM34 43h8v1h-8zM14 44h6v1h-6zM36 44h6v1h-6zM37 45h6v1h-6zM13 45h6v1h-6zM13 46h4v1h-4zM39 46h4v1h-4zM40 47h3v1h-3zM13 47h3v1h-3zM42 48h1v1h-1zM13 48h1v1h-1z"
          />
        </symbol>
        <symbol id="px-bolt" viewBox="0 0 56 56">
          <path
            fill="currentColor"
            shapeRendering="crispEdges"
            d="M27 1h16v1h-16zM26 2h17v1h-17zM26 3h16v1h-16zM25 4h17v1h-17zM25 5h16v1h-16zM24 6h17v1h-17zM24 7h16v1h-16zM23 8h17v1h-17zM23 9h16v2h-16zM22 11h16v2h-16zM21 13h16v2h-16zM20 15h16v1h-16zM20 16h15v2h-15zM19 18h15v2h-15zM18 20h15v2h-15zM18 22h14v1h-14zM17 23h15v1h-15zM17 24h26v1h-26zM16 25h26v1h-26zM16 26h25v1h-25zM15 27h26v1h-26zM15 28h25v1h-25zM15 29h24v1h-24zM14 30h24v1h-24zM26 31h11v1h-11zM26 32h10v2h-10zM25 34h10v1h-10zM25 35h9v1h-9zM24 36h9v1h-9zM24 37h8v2h-8zM23 39h8v1h-8zM23 40h7v1h-7zM23 41h6v1h-6zM22 42h6v1h-6zM22 43h5v2h-5zM21 45h5v1h-5zM21 46h4v1h-4zM21 47h3v1h-3zM20 48h3v1h-3zM20 49h2v1h-2zM19 50h3v1h-3zM19 51h2v1h-2zM19 52h1v1h-1zM18 53h1v1h-1z"
          />
        </symbol>
        <symbol id="px-skull" viewBox="0 0 56 56">
          <path
            fill="currentColor"
            shapeRendering="crispEdges"
            d="M24 5h8v1h-8zM21 6h14v1h-14zM19 7h18v1h-18zM18 8h20v1h-20zM16 9h24v1h-24zM15 10h26v1h-26zM14 11h28v2h-28zM13 13h30v1h-30zM12 14h32v3h-32zM11 17h34v3h-34zM11 20h8v1h-8zM37 20h8v1h-8zM22 20h12v1h-12zM24 21h8v1h-8zM11 21h7v1h-7zM38 21h7v1h-7zM39 22h6v1h-6zM11 22h6v1h-6zM40 23h5v3h-5zM11 23h5v3h-5zM25 22h6v5h-6zM39 26h6v2h-6zM11 26h6v2h-6zM24 27h8v1h-8zM23 28h10v1h-10zM12 28h7v1h-7zM37 28h7v1h-7zM12 29h32v1h-32zM13 30h30v1h-30zM29 31h14v1h-14zM13 31h14v1h-14zM14 32h13v1h-13zM29 32h13v1h-13zM15 33h11v1h-11zM30 33h11v1h-11zM30 34h10v1h-10zM16 34h10v1h-10zM31 35h8v1h-8zM17 35h8v1h-8zM18 36h20v6h-20zM18 42h5v5h-5zM33 42h5v5h-5zM21 47h2v2h-2zM33 47h2v2h-2zM29 42h3v8h-3zM24 42h3v8h-3zM34 49h1v1h-1zM21 49h1v1h-1z"
          />
        </symbol>
        <symbol id="px-cluster" viewBox="0 0 56 56">
          <path
            fill="currentColor"
            shapeRendering="crispEdges"
            d="M41 9h2v3h-2zM40 12h4v1h-4zM39 13h6v1h-6zM38 14h8v1h-8zM37 15h10v1h-10zM39 16h6v1h-6zM40 17h4v2h-4zM20 18h1v2h-1zM41 19h2v3h-2zM19 20h2v2h-2zM19 22h3v1h-3zM18 23h4v2h-4zM17 25h6v2h-6zM16 27h8v1h-8zM15 28h10v1h-10zM14 29h12v1h-12zM13 30h14v1h-14zM12 31h17v1h-17zM14 32h13v1h-13zM15 33h11v1h-11zM16 34h9v1h-9zM16 35h8v1h-8zM17 36h6v1h-6zM18 37h5v1h-5zM39 38h1v1h-1zM18 38h4v2h-4zM39 39h2v1h-2zM38 40h3v1h-3zM19 40h2v3h-2zM37 41h5v2h-5zM38 43h3v1h-3zM20 43h1v2h-1zM39 44h2v1h-2zM39 45h1v1h-1z"
          />
        </symbol>
      </defs>
    </svg>
  );
}
