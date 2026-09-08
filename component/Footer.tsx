import Link from "next/link";

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
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
      width="16"
      height="16"
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
  "Classic",
  "Premium",
  "Collections",
  "Smart Eyewear",
  "Accessories",
  "Bundle Offers",
];

const aboutLinks = ["Our Story", "Warrants & Returns", "Store Locator", "Contact Us"];

export default function Footer() {
  return (
    <footer className="bg-black text-white px-6 py-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl">BeU</p>
          <p className="mt-3 max-w-xs text-sm text-gray-300">
            Be Your Best Self. Merging trendy aesthetics with smart wearable
            features to protect your vision.
          </p>
          <p className="mt-4 text-sm text-gray-300">
            (02) 8676-9420 / 0912-345-6789
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-white"
            >
              <InstagramIcon />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-white"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>

        <div>
          <p className="font-semibold">SHOP</p>
          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            {shopLinks.map((label) => (
              <li key={label}>
                <Link href="/listing">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold">ABOUT BEU</p>
          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            {aboutLinks.map((label) => (
              <li key={label}>
                <Link href="/home">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
