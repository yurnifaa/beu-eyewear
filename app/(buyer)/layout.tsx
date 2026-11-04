import type { ReactNode } from 'react';
import Header from '@/component/Header';
import Footer from '@/component/Footer';
import Ticker from '@/component/Ticker';
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
      <Ticker />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
