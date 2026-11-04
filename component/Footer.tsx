import Image from "next/image";
import Link from "next/link";
import PixelGlyph, { type GlyphName } from "@/component/beu/PixelGlyph";
import FooterWordmark from "@/component/FooterWordmark";
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
  { label: "Warranty & Returns", href: "/policies/shipping-returns" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

const linkClassName =
  "cursor-pointer text-foreground/80 transition-colors hover:text-accent hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4";

const socialClassName =
  "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-ink text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-ice dark:text-ice dark:hover:bg-ice dark:hover:text-ink";

const headingClassName = "text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground";

const GLYPH_ROW: GlyphName[] = [
  "spark", "spark-o", "burst", "orbit", "ball", "shoot",
  "cross", "heart", "star5", "bolt", "skull", "cluster",
];

const DEFAULT_PHONES = '(02) 8676-9420 / 0912-345-6789';

// The footer must never break a page, so a sheet outage just falls back to the printed numbers.
async function supportPhones() {
  try {
    const { supportPhones: phones } = await getStoreSettings();
    return phones.length > 0 ? phones.join(' / ') : DEFAULT_PHONES;
  } catch {
    return DEFAULT_PHONES;
  }
}

export default async function Footer() {
  const phones = await supportPhones();
  return (
    <footer className="beu-footer-bg relative overflow-hidden px-4 pt-12 text-foreground md:px-14 md:pt-16">
      <div className="mx-auto max-w-[1328px]">
        <div className="grid grid-cols-1 gap-10 rounded-[2rem] border border-white bg-background/80 p-7 shadow-[0_24px_50px_rgba(40,100,180,0.16)] dark:border-border md:grid-cols-[1.6fr_1fr_1fr] md:p-10">
          <div>
            <Image src="/Logo-Dark-Mark.png" alt="BeU" width={380} height={380} className="h-14 w-14 dark:hidden" />
            <Image src="/Logo-Light-Mark.png" alt="BeU" width={380} height={380} className="hidden h-14 w-14 dark:block" />
            <p className="mt-5 font-display text-3xl font-bold uppercase leading-[1.05] tracking-tight">
              Be your
              <br />
              <span className="font-accent text-5xl normal-case">best self.</span>
            </p>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Merging trendy aesthetics with smart wearable features to protect your vision.
            </p>
            <p className="mt-6 text-sm">{phones}</p>
            <div className="mt-5 flex items-center gap-3">
              <a href="#" aria-label="Instagram" className={socialClassName}>
                <InstagramIcon />
              </a>
              <a href="#" aria-label="Facebook" className={socialClassName}>
                <FacebookIcon />
              </a>
            </div>
          </div>

          <nav aria-label="Shop">
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

          <nav aria-label="About BeU">
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

        <div aria-hidden="true" className="mt-12 flex flex-wrap items-center justify-between gap-4 text-ink dark:text-ice">
          {GLYPH_ROW.map((name) => (
            <PixelGlyph key={name} name={name} size={40} className="shrink-0" />
          ))}
        </div>

        <div className="mt-8 pb-10">
          <FooterWordmark />
        </div>
      </div>

      <div className="-mx-4 flex flex-wrap items-center justify-between gap-4 bg-ink px-4 py-4 text-xs uppercase tracking-[0.14em] text-ice-mist md:-mx-14 md:px-14">
        <span>© {new Date().getFullYear()} BeU Eyewear</span>
        <span className="flex items-center gap-2">
          <PixelGlyph name="spark" size={12} className="text-ice" />
          Be seen. Be you.
        </span>
      </div>
    </footer>
  );
}
