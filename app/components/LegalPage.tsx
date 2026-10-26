import Link from "next/link";
import type { ReactNode } from "react";
import { DraftBanner, SiteFooter, SiteHeader } from "./SiteChrome";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <DraftBanner />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Link href="/" className="text-sm text-muted underline">
          חזרה לדף הראשי
        </Link>
        <h1 className="mt-4 text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted">עודכן: {updated}</p>
        <div className="legal mt-8 space-y-6 leading-relaxed [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:mt-1 [&_ul]:list-disc [&_ul]:ps-6">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
