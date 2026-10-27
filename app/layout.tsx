import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Hebrew, Karantina } from "next/font/google";
import { products } from "@/lib/catalog";
import { isLive, site } from "@/lib/config";
import { priceFor } from "@/lib/pricing";
import "./globals.css";

const display = Karantina({
  variable: "--font-karantina",
  subsets: ["hebrew", "latin"],
  weight: ["700"],
});

const body = IBM_Plex_Sans_Hebrew({
  variable: "--font-plex",
  subsets: ["hebrew", "latin"],
  weight: ["400", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500"],
});

const minPrice = Math.min(...products.map((p) => priceFor(p.cost)));
const description = `רצועות לשעון חכם ל-Apple Watch, Samsung, Garmin, Huawei, Amazfit, Xiaomi ו-Fitbit. סיליקון, ניילון, עור ומתכת, מ-₪${minPrice}, משלוח חינם עד הבית.`;

export const metadata: Metadata = {
  ...(site.url ? { metadataBase: new URL(site.url) } : {}),
  title: {
    default: `רצועות לשעון חכם מ-₪${minPrice}, משלוח חינם | ${site.brandName}`,
    template: `%s | ${site.brandName}`,
  },
  description,
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: site.brandName,
    title: "צבע חדש לשעון שלך",
    description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "רצועות לשעון חכם" }],
  },
  twitter: { card: "summary_large_image" },
  robots: isLive ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#e4e7eb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
