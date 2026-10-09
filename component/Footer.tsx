import Image from "next/image";
import Link from "next/link";

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

// TODO: i-map sa actual (support) pages kapag meron na.
const aboutLinks = ["Our Story", "Warrants & Returns", "Store Locator", "Contact Us"];

const linkClassName =
  "text-white/80 transition-colors hover:text-white hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

const socialClassName =
  "flex h-9 w-9 items-center justify-center rounded-md border border-white text-white transition-colors hover:bg-white hover:text-[#111A33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function Footer() {
  return (
    <footer className="bg-[#111A33] px-6 py-12 text-white md:py-14">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Image src="/Logo-Light-Mark.png" alt="BeU" width={380} height={380} className="h-14 w-14" />
          <p className="mt-5 max-w-xs text-xs leading-relaxed">
            Be Your Best Self. Merging trendy aesthetics with smart wearable
            features to protect your vision.
          </p>
          <p className="mt-6 text-sm">(02) 8676-9420 / 0912-345-6789</p>
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
          <h2 className="text-xl font-semibold uppercase">Shop</h2>
          <ul className="mt-4 flex flex-col gap-3 text-base">
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
          <h2 className="text-xl font-semibold uppercase">About BeU</h2>
          <ul className="mt-4 flex flex-col gap-3 text-base">
            {aboutLinks.map((label) => (
              <li key={label}>
                <Link href="/home" className={linkClassName}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}