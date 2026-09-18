import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BeU Eyewear | Online Shop",
  description: "Be ur best self",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var root = document.documentElement;
    if (root.classList.contains('dark') || root.classList.contains('light')) return;
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(prefersDark ? 'dark' : 'light');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
