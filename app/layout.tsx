import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  // Only the admin app uses Inter; the storefront overrides it with its own fonts (see beu-theme.css).
  // Without this, every storefront page downloads ~48KB of font it doesn't show.
  preload: false,
});

export const metadata: Metadata = {
  title: { default: 'BeU Eyewear | Online Shop', template: '%s | BeU Eyewear' },
  description: "Be ur best self",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
