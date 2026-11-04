import { DM_Mono, Instrument_Serif, Unbounded } from "next/font/google";

// Loaded here (not in app/layout.tsx) so the admin area never downloads them.

// Variable font, so one file covers every weight the storefront uses.
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const storefrontFontVariables = `${unbounded.variable} ${instrumentSerif.variable} ${dmMono.variable}`;
