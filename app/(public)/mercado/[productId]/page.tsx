import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, HandHeart, MapPin, PackageCheck, Sparkles } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { MarketplaceService } from "@/shared/services/marketplace.service";

const fallbackProduct = "/images/discover/emprende.png";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ productId: string }>;
}) {
  const product = await new MarketplaceService().detail((await params).productId);

  if (!product) notFound();

  const artisanName = product.artisan.profile?.displayName ?? "Artesana Warmi";
  const image = product.images[0]?.file.url ?? fallbackProduct;

  return (
    <main className="min-h-screen bg-[#fffaf8] text-[#30130d]">
      <section className="mx-auto w-full max-w-[1680px] px-4 py-8 md:px-8 lg:px-12">
        <Link
          href={`/artesanas/${product.artisanId}` as Route}
          className="mb-6 inline-flex items-center gap-2 font-ui text-sm font-bold text-[#7a3100]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la vitrina de {artisanName}
        </Link>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="overflow-hidden border border-[#ead4ca] bg-white shadow-[0_22px_52px_rgba(122,49,0,0.08)]">
            <div className="relative min-h-[520px]">
              <Image
                src={image}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 52vw, 100vw"
              />
            </div>
          </div>

          <article className="border border-[#ead4ca] bg-white p-6 shadow-[0_22px_52px_rgba(122,49,0,0.08)] md:p-10">
            <p className="font-ui text-sm font-bold uppercase tracking-[0.08em] text-[#b5245b]">
              Pieza cultural
            </p>
            <h1 className="mt-3 font-serif text-5xl font-bold leading-tight text-[#7a3100] md:text-7xl">
              {product.name}
            </h1>
            <p className="mt-5 font-serif text-2xl italic leading-tight text-[#b5245b] md:text-3xl">
              “{product.culturalPhrase ?? "Una pieza cultural con historia."}”
            </p>

            <div className="mt-8 grid gap-3 font-ui text-sm font-bold text-[#6f4c42] sm:grid-cols-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fff0f5] px-4 py-2">
                <MapPin className="h-4 w-4 text-[#b5245b]" />
                {product.community.name}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fff7df] px-4 py-2">
                <Sparkles className="h-4 w-4 text-[#d39a12]" />
                {product.technique ?? product.craftType.name}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eefcff] px-4 py-2">
                <HandHeart className="h-4 w-4 text-[#1c7c86]" />
                {artisanName}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fff3ea] px-4 py-2">
                <PackageCheck className="h-4 w-4 text-[#fc6b22]" />
                {product.makingTime ?? "Hecho a mano"}
              </span>
            </div>

            <section className="mt-9 space-y-7 text-base leading-8 text-[#6f4c42] md:text-lg">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#7a3100]">
                  Historia de la pieza
                </h2>
                <p className="mt-3">{product.story ?? product.description}</p>
              </div>

              <div>
                <h2 className="font-serif text-3xl font-bold text-[#7a3100]">
                  Origen y proceso
                </h2>
                <p className="mt-3">
                  {product.culturalMeaning ?? "Significado por compartir."}
                </p>
                <p className="mt-3">
                  Materiales: {product.materials ?? "Por registrar"}. Categoria:{" "}
                  {product.category.name}.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl font-bold text-[#7a3100]">
                  Creada por
                </h2>
                <Link
                  href={`/artesanas/${product.artisanId}` as Route}
                  className="mt-3 inline-flex font-ui font-bold text-[#b5245b] hover:underline"
                >
                  {artisanName}
                </Link>
              </div>
            </section>

            <div className="mt-9 border-t border-[#ead4ca] pt-6">
              <p className="font-serif text-4xl font-bold text-[#7a3100]">
                S/ {String(product.price)}
              </p>
              <Button
                asChild
                className="mt-5 min-h-[54px] rounded-full bg-[#7a3100] px-8 font-ui text-base text-white hover:bg-[#5f2600]"
              >
                <Link href={`/mercado/${product.id}/pedido` as Route}>
                  Solicitar pieza
                </Link>
              </Button>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
