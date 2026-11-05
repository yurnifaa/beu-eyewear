import type { Metadata } from 'next';
import Link from 'next/link';
import Panel from '@/component/account/Panel';
import PixelGlyph, { type GlyphName } from '@/component/beu/PixelGlyph';
import Reveal from '@/component/Reveal';
import SupportHeader from '@/component/support/SupportHeader';

export const metadata: Metadata = { title: 'About' };

const PILLARS: { glyph: GlyphName; title: string; body: string }[] = [
  {
    glyph: 'spark',
    title: 'Style that stands out',
    body: 'Frames with a point of view: Y2K shapes, chrome details and colours that look like you meant it.',
  },
  {
    glyph: 'bolt',
    title: 'Smart where it counts',
    body: 'Smart eyewear that does something useful, without turning a good pair of glasses into a gadget.',
  },
  {
    glyph: 'heart',
    title: 'Made to protect',
    body: 'Lens options and coatings picked to look after your eyes through long screen days and bright commutes.',
  },
];

export default function AboutPage() {
  return (
    <Reveal mode="mount" className="flex flex-col gap-10 md:gap-12">
      <SupportHeader
        eyebrow="Our story"
        title="Be your best self."
        description="BeU merges trendy aesthetics with smart wearable features to protect your vision. Eyewear should feel like part of your look, not an afterthought."
      />

      <Panel title="Why BeU" index="01">
        <div className="flex max-w-3xl flex-col gap-4 text-sm leading-relaxed text-foreground/80 md:text-base">
          <p>
            Most eyewear asks you to pick: something that looks good, or something that works hard for your eyes. We
            think that is a false choice. BeU is built around frames you actually want to be seen in, with the lenses
            and smart features that make them worth wearing every day.
          </p>
          <p>
            Every collection, from Classic and Premium to Smart Eyewear and Accessories, follows the same rule: if it
            doesn&apos;t look good and feel good, it doesn&apos;t ship.
          </p>
        </div>
      </Panel>

      <ul className="grid list-none grid-cols-1 gap-6 md:grid-cols-3">
        {PILLARS.map((pillar, i) => (
          <li
            key={pillar.title}
            className="relative overflow-hidden rounded-3xl border border-border bg-background/80 p-6 shadow-[0_18px_40px_rgba(40,100,180,0.1)] backdrop-blur md:p-7"
          >
            <PixelGlyph name={pillar.glyph} size={84} className="pointer-events-none absolute right-5 top-5 text-accent opacity-15" />
            <span className="text-[11px] tracking-[0.18em] text-muted-foreground">[ 0{i + 1} ]</span>
            <h2 className="mt-10 font-display text-lg font-black uppercase leading-tight tracking-[-0.02em]">{pillar.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75">{pillar.body}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/listing"
          className="inline-flex h-12 items-center rounded-full bg-ink px-8 text-xs uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5"
        >
          Shop the lineup
        </Link>
        <Link href="/contact" className="beu-chip inline-flex h-12 items-center px-7 text-xs uppercase tracking-[0.14em]">
          Say hi
        </Link>
      </div>
    </Reveal>
  );
}
