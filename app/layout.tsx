import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { site } from "@/lib/config";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: `רצועות לשעון חכם | ${site.brandName}`,
  description:
    "רצועות סיליקון ומגנטיות לשעון חכם, במגוון צבעים ומידות. משלוח חינם עד הבית.",
  robots: site.isDraft ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
