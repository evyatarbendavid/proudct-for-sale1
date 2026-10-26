import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Hebrew, Karantina } from "next/font/google";
import { isLive, site } from "@/lib/config";
import "./globals.css";

const display = Karantina({
  variable: "--font-karantina",
  subsets: ["hebrew", "latin"],
  weight: ["400", "700"],
});

const body = IBM_Plex_Sans_Hebrew({
  variable: "--font-plex",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: `רצועות לשעון חכם | ${site.brandName}`,
  description:
    "רצועות סיליקון ומגנטיות לשעון חכם, במגוון צבעים ומידות. משלוח חינם עד הבית.",
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
