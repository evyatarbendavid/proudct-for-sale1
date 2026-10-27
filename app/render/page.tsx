import type { Metadata } from "next";
import { caseKindOf, colorById, products } from "@/lib/catalog";
import { RenderStage } from "./RenderStage";

// דף פנימי לצילום תמונות הגלריה (scripts/render-products.mjs). לא מאונדקס ולא ב-sitemap
export const metadata: Metadata = {
  title: "render",
  robots: { index: false, follow: false },
};

const catalog = products.map((p) => ({
  slug: p.slug,
  caseKind: caseKindOf(p),
  material: p.material,
  colors: p.colors.map((id) => ({ id, hex: colorById(id).hex })),
}));

export default function RenderPage() {
  return (
    <>
      <style>{"html,body{background:transparent!important}"}</style>
      <script id="catalog" type="application/json" dangerouslySetInnerHTML={{ __html: JSON.stringify(catalog) }} />
      <RenderStage catalog={catalog} />
    </>
  );
}
