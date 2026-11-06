import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Phone } from "lucide-react";
import PixelGlyph, { type GlyphName } from "@/component/beu/PixelGlyph";
import { getStoreSettings } from "@/lib/catalog/queries";

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 8h-2a2 2 0 0 0-2 2v10" />
      <path d="M8 13h6" />
    </svg>
  );
}

const shopLinks = [
  { label: "Classic", href: "/listing?category=classic" },
  { label: "Premium", href: "/listing?category=premium" },
  { label: "Collections", href: "/listing?category=collections" },
  { label: "Smart Eyewear", href: "/listing?category=smart" },
  { label: "Accessories", href: "/listing?category=accessories" },
  { label: "Bundle Offers", href: "/listing?category=collections&sub=bundles" },
];

const aboutLinks = [
  { label: "Our Story", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping & Returns", href: "/policies/shipping-returns" },
  { label: "Terms & Privacy", href: "/policies/terms-privacy" },
];

const linkClassName =
  "cursor-pointer text-foreground/80 transition-colors hover:text-accent hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4";

const socialClassName =
  "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-ink text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2";

const headingClassName = "text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground";

const GLYPH_ROW: GlyphName[] = [
  "spark", "spark-o", "burst", "orbit", "ball", "shoot",
  "cross", "heart", "star5", "bolt", "skull", "cluster",
];

const DEFAULT_PHONES = ['(02) 8676-9420', '0912-345-6789'];

// The footer must never break a page, so a sheet outage just falls back to the printed numbers.
async function supportPhones() {
  try {
    const { supportPhones: phones } = await getStoreSettings();
    return phones.length > 0 ? phones : DEFAULT_PHONES;
  } catch {
    return DEFAULT_PHONES;
  }
}

// Mobile-only pieces: every tap target is at least 48px (min-h-12 / h-12) with a pressed state.
const pressedClassName = "active:bg-ice-soft focus-visible:outline-2 focus-visible:outline-offset-2";

const mobileSocialClassName =
  "flex h-12 w-12 items-center justify-center rounded-full border border-ink text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 active:bg-ice-soft";

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

// Native <details>: collapses on phones with no client JS, and keyboard/screen-reader friendly.
function MobileSection({
  title,
  links,
  defaultOpen = false,
}: {
  title: string;
  links: { label: string; href: string }[];
  defaultOpen?: boolean;
}) {
  return (
    <nav aria-label={title}>
      <details open={defaultOpen} className="group border-t border-border">
        <summary
          className={`flex min-h-14 cursor-pointer list-none items-center justify-between text-xs font-medium uppercase tracking-[0.16em] [&::-webkit-details-marker]:hidden ${pressedClassName}`}
        >
          {title}
          <ChevronDown
            size={22}
            aria-hidden="true"
            className="shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <ul className="grid grid-cols-2 gap-x-2 pb-3">
          {links.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className={`-ml-2.5 flex min-h-12 items-center rounded-xl px-2.5 text-[13px] leading-tight text-foreground ${pressedClassName}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
}

export default async function Footer() {
  const phones = await supportPhones();
  return (
    <footer className="beu-snap-end beu-footer-bg relative overflow-hidden px-4 pt-6 text-foreground md:px-14 md:pt-16">
      <div className="mx-auto max-w-[1328px]">
        <div className="rounded-[2rem] border border-white bg-background/80 px-5 pb-1 pt-5 shadow-[0_24px_50px_rgba(40,100,180,0.16)] md:grid md:grid-cols-[1.6fr_1fr_1fr] md:gap-10 md:p-10">
          {/* Phones: compact, collapsible and tap-friendly. md and up keeps the three-column layout below. */}
          <div className="md:hidden">
            <div className="flex items-center gap-3.5">
              <Image src="/Logo-Dark-Mark.png" alt="BeU" width={380} height={380} className="h-11 w-11 shrink-0" />
              <p className="flex flex-col font-display text-xs font-semibold uppercase tracking-[0.06em]">
                Be your
                <span className="font-accent text-[1.875rem] font-normal normal-case leading-[1.05] tracking-normal">best self.</span>
              </p>
            </div>
            <p className="mt-3.5 text-xs leading-relaxed text-muted-foreground">
              Merging trendy aesthetics with smart wearable features to protect your vision.
            </p>

            <p className="mb-2 mt-[18px] text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Need help? Tap to call</p>
            <div className={`grid gap-2 ${phones.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {phones.map((phone) => (
                <a
                  key={phone}
                  href={telHref(phone)}
                  className={`flex min-h-12 items-center justify-center gap-1.5 rounded-full border border-ink bg-background px-2 text-xs font-medium ${pressedClassName}`}
                >
                  <Phone size={15} aria-hidden="true" />
                  {phone}
                </a>
              ))}
            </div>

            <div className="mt-4">
              <MobileSection title="Shop" links={shopLinks} defaultOpen />
              <MobileSection title="About BeU" links={aboutLinks} />
            </div>

            <div className="flex min-h-[72px] items-center justify-between border-t border-border">
              <span className="text-xs font-medium uppercase tracking-[0.16em]">Follow BeU</span>
              <div className="flex items-center gap-3">
                <a href="#" aria-label="Instagram" className={mobileSocialClassName}>
                  <InstagramIcon />
                </a>
                <a href="#" aria-label="Facebook" className={mobileSocialClassName}>
                  <FacebookIcon />
                </a>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <Image src="/Logo-Dark-Mark.png" alt="BeU" width={380} height={380} className="h-14 w-14" />
            <p className="mt-5 font-display text-3xl font-bold uppercase leading-[1.05] tracking-tight">
              Be your
              <br />
              <span className="font-accent text-5xl normal-case">best self.</span>
            </p>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Merging trendy aesthetics with smart wearable features to protect your vision.
            </p>
            <p className="mt-6 text-sm">{phones.join(" / ")}</p>
            <div className="mt-5 flex items-center gap-3">
              <a href="#" aria-label="Instagram" className={socialClassName}>
                <InstagramIcon />
              </a>
              <a href="#" aria-label="Facebook" className={socialClassName}>
                <FacebookIcon />
              </a>
            </div>
          </div>

          <nav aria-label="Shop" className="hidden md:block">
            <h2 className={headingClassName}>Shop</h2>
            <ul className="mt-5 flex flex-col gap-3 text-sm">
              {shopLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className={linkClassName}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="About BeU" className="hidden md:block">
            <h2 className={headingClassName}>About BeU</h2>
            <ul className="mt-5 flex flex-col gap-3 text-sm">
              {aboutLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className={linkClassName}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div aria-hidden="true" className="mt-12 hidden flex-wrap md:flex items-center justify-between gap-4 text-ink">
          {GLYPH_ROW.map((name) => (
            <PixelGlyph key={name} name={name} size={40} className="shrink-0" />
          ))}
        </div>

        <div className="mt-6 md:mt-8 md:pb-10">
        </div>
      </div>

      <div className="-mx-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 bg-ink px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 text-[11px] uppercase tracking-[0.14em] text-ice-mist md:-mx-14 md:gap-4 md:px-14">
        <span>© {new Date().getFullYear()} BeU Eyewear</span>
        <span className="flex items-center gap-2">
          <PixelGlyph name="spark" size={12} className="text-ice" />
          Be seen. Be you.
        </span>
      </div>
    </footer>
  );
}
