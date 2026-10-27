import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { families, priceOf, productBySlug, products } from "@/lib/catalog";
import { isLive, site } from "@/lib/config";
import { canonical } from "@/lib/seo";
import { InfoSections } from "../../components/shop/InfoSections";
import { ProductCard } from "../../components/shop/ProductCard";
import { ProductView } from "../../components/shop/ProductView";
import { DraftBanner, SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { renderSrc } from "../../components/shop/images";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) return {};
  const description = `${p.description} ₪${priceOf(p)} לרצועה, משלוח חינם עד הבית.`;
  return {
    title: p.name,
    description,
    ...canonical(`/p/${p.slug}`),
    openGraph: { title: p.name, description, images: [{ url: renderSrc(p.slug, p.colors[0]), width: 640, height: 640 }] },
  };
}

export default async function ProductPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();
  const family = families[product.family];

  // מוצרים דומים: קודם מאותה משפחה, ואז האחרים
  const related = [
    ...products.filter((p) => p.family === product.family && p.slug !== product.slug),
    ...products.filter((p) => p.family !== product.family),
  ].slice(0, 4);

  // נתונים מובנים רק במצב מכירה, כשיש באמת הצעה למכירה
  const jsonLd = isLive
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: site.url ? `${site.url}${renderSrc(product.slug, product.colors[0])}` : undefined,
        brand: { "@type": "Brand", name: site.brandName },
        offers: {
          "@type": "Offer",
          priceCurrency: "ILS",
          price: priceOf(product),
          availability: "https://schema.org/InStock",
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "ILS" },
            shippingDestination: { "@type": "DefinedRegion", addressCountry: "IL" },
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "IL",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 14,
          },
        },
      }
    : null;

  return (
    <>
      <DraftBanner />
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 pt-3 pb-24 md:px-4 md:pb-12">
        {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
        <nav aria-label="מיקום בחנות" className="mb-3 text-sm text-graphite">
          <Link href="/" className="hover:underline">ראשי</Link>
          <span aria-hidden className="mx-1.5">‹</span>
          <Link href={`/?family=${product.family}#catalog`} className="hover:underline">{family.name}</Link>
        </nav>

        <ProductView product={product} />
        <InfoSections product={product} />

        <section aria-labelledby="related-title" className="mt-8">
          <h2 id="related-title" className="mb-3 text-lg font-bold">אולי יתאים לך גם</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
