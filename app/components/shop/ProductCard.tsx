import Image from "next/image";
import Link from "next/link";
import { colorById, families, priceOf, type Product } from "@/lib/catalog";
import { pairPrice } from "@/lib/pricing";
import { thumbSrc } from "./images";

const MAX_DOTS = 6;

/** cover: תמונה אמיתית לכרטיס (lib/photos.ts). בלעדיה מוצגת ההדמיה */
export function ProductCard({ product, cover }: { product: Product; cover?: string }) {
  const price = priceOf(product);
  const extra = product.colors.length - MAX_DOTS;
  return (
    <Link
      href={`/p/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-paper transition-colors hover:border-graphite"
    >
      <div className="relative aspect-square bg-stage">
        <Image
          src={cover ?? thumbSrc(product.slug, product.colors[0])}
          alt={cover ? product.name : `${product.name}, הדמיה`}
          fill
          unoptimized
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {!cover && <span className="absolute top-2 right-2 rounded bg-paper/90 px-1.5 py-0.5 text-[11px] text-graphite">הדמיה</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="text-xs text-graphite">{families[product.family].short}</span>
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-xl font-bold text-signal-deep">₪{price}</span>
          <span className="text-xs text-graphite">זוג ב-₪{pairPrice(price)}</span>
        </div>
        <div className="flex items-center gap-1" aria-label={`${product.colors.length} צבעים`}>
          {product.colors.slice(0, MAX_DOTS).map((id) => (
            <span
              key={id}
              title={colorById(id).name}
              className="size-3.5 rounded-full border border-black/10"
              style={{ background: colorById(id).hex }}
            />
          ))}
          {extra > 0 && <span className="text-xs text-graphite">+{extra}</span>}
        </div>
      </div>
    </Link>
  );
}
