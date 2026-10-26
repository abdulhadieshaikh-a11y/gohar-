import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import { company } from "@/data/company";
import { siteUrl } from "@/lib/site";
import "lenis/dist/lenis.css";
import "./globals.css";

// Type system (self-hosted at build time by next/font; no runtime requests to Google):
//  - Archivo: a grotesque with a width axis, set heavy and slightly extended for
//    monumental, architectural headlines.
//  - Inter: a precise text face for body copy, navigation, buttons and data.
// Both are variable fonts, so every weight comes from a few small files.
const display = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${company.name} | Real Estate Developer in Karachi`,
    template: `%s | ${company.name}`,
  },
  description:
    "Gohar Group of Companies develops residential apartments, commercial centres, mixed-use developments and gated communities in Karachi and Hyderabad. Where Relationships Come First.",
  applicationName: company.name,
  openGraph: {
    type: "website",
    siteName: company.name,
    locale: "en_PK",
    images: [{ url: "/images/projects/gohar-gateway/exterior.webp", width: 2500, height: 1406, alt: "Gohar Gateway, Hyderabad (architectural render)" }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-PK"
      className={`${display.variable} ${sans.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
