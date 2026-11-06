import type { ReactNode } from 'react';
import Header from '@/component/Header';
import Footer from '@/component/Footer';
import ConnectionMode from '@/component/ConnectionMode';
import { MotionProvider } from '@/component/Reveal';
import GlyphSprite from '@/component/beu/GlyphSprite';
import { storefrontFontVariables } from './fonts';
import './beu-theme.css';

// The storefront wears the BeU ice/chrome/ink theme. Everything is scoped to
// .beu-theme, so the admin area (its own layout) keeps the neutral look.
export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`beu-theme ${storefrontFontVariables} flex flex-1 flex-col`}>
      {/* Hidden SVG sprite behind every <PixelGlyph> and the eyewear shapes. */}
      <GlyphSprite />
      <ConnectionMode />
      <Header />
      {/* The scroll reveals start from opacity 0 in the server HTML. With JavaScript off nothing
          would ever fade them in, so show everything in that case. */}
      <noscript>
        <style>{`.beu-theme [style*="opacity:0"],.beu-theme [style*="opacity: 0"]{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <MotionProvider>
        <main className="flex-1">{children}</main>
      </MotionProvider>
      <Footer />
    </div>
  );
}
