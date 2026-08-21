import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Sparkles } from "lucide-react";

import { WarmiLogo } from "@/shared/components/brand/warmi-logo";
import { prisma } from "@/shared/server/db/prisma";

const fallbackHero = "/images/auth/artesana.png";
const fallbackProduct = "/images/discover/emprende.png";

export default async function ArtisanShowcasePage({
  params
}: {
  params: Promise<{ artisanId: string }>;
}) {
  const { artisanId } = await params;
  const artisan = await prisma.user.findFirst({
    where: {
      id: artisanId,
      deletedAt: null,
      products: { some: { status: "PUBLISHED", available: true, deletedAt: null } }
    },
    include: {
      profile: {
        include: {
          community: true,
          craftTypes: { include: { craftType: true } }
        }
      },
      stories: {
        where: { publishedAt: { not: null }, deletedAt: null },
        include: { coverImage: true },
        orderBy: { publishedAt: "desc" },
        take: 1
      },
      products: {
        where: { status: "PUBLISHED", available: true, deletedAt: null },
        include: {
          category: true,
          community: true,
          craftType: true,
          images: { include: { file: true }, orderBy: { order: "asc" } }
        },
        orderBy: { updatedAt: "desc" }
      }
    }
  });

  if (!artisan) notFound();

  const story = artisan.stories[0];
  const displayName = artisan.profile?.displayName ?? artisan.name ?? "Artesana Warmi";
  const community = artisan.profile?.community?.name ?? "Comunidad Warmi";
  const craft =
    artisan.profile?.craftTypes[0]?.craftType.name ??
    artisan.products[0]?.craftType.name ??
    "Arte textil";
  const heroImage =
    artisan.profile?.avatarUrl ??
    story?.coverImage?.url ??
    artisan.products[0]?.images[0]?.file.url ??
    fallbackHero;

  return (
    <main className="min-h-screen bg-[#fffaf8] text-[#30130d]">
      <section className="mx-auto w-full max-w-[1760px] px-4 py-8 md:px-8 lg:px-12">
        <Link
          href="/mercado"
          className="mb-6 inline-flex items-center gap-2 font-ui text-sm font-bold text-[#7a3100]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la vitrina
        </Link>

        <section className="grid overflow-hidden border border-[#ead4ca] bg-white shadow-[0_22px_52px_rgba(122,49,0,0.08)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[420px] bg-[#fff0f5]">
            <Image
              src={heroImage}
              alt={displayName}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 48vw, 100vw"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-[#30130d]/55 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="font-ui text-sm font-bold uppercase tracking-[0.1em]">
                Vitrina cultural
              </p>
              <h1 className="mt-2 font-serif text-5xl font-bold leading-tight md:text-7xl">
                {displayName}
              </h1>
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 md:p-10 xl:p-14">
            <WarmiLogo compact markClassName="w-32 md:w-40" />
            <div className="mt-8 flex flex-wrap gap-3 font-ui text-sm font-bold">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fff0f5] px-4 py-2 text-[#b5245b]">
                <MapPin className="h-4 w-4" />
                {community}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fff7df] px-4 py-2 text-[#946300]">
                <Sparkles className="h-4 w-4" />
                {craft}
              </span>
            </div>
            <p className="mt-8 max-w-3xl font-serif text-3xl italic leading-tight text-[#7a3100] md:text-4xl">
              “
              {story?.summary ??
                artisan.profile?.bio ??
                "Cada pieza guarda memoria, técnica y amor por nuestra comunidad."}
              ”
            </p>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#6f4c42] md:text-lg">
              {story?.content ??
                "Esta vitrina presenta piezas creadas con identidad cultural. Primero habla la historia de la artesana; luego, cada producto muestra su proceso, materiales y significado."}
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 border-b border-[#e9cfc4] pb-5 md:flex-row md:items-end">
            <div>
              <p className="font-ui text-sm font-bold uppercase text-[#b5245b]">
                Piezas de {displayName.split(" ")[0]}
              </p>
              <h2 className="font-serif text-4xl font-bold text-[#7a3100] md:text-6xl">
                Productos con historia
              </h2>
            </div>
            <p className="font-ui text-sm text-[#6f4c42]">
              {artisan.products.length} piezas disponibles
            </p>
          </div>

          <div className="mt-7 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {artisan.products.map((product) => {
              const image = product.images[0]?.file.url ?? fallbackProduct;

              return (
                <Link
                  key={product.id}
                  href={`/mercado/${product.id}` as Route}
                  className="group overflow-hidden border border-[#ead4ca] bg-white shadow-[0_18px_42px_rgba(122,49,0,0.07)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#fffaf6_0%,#f8eadc_58%,#f3dfd1_100%)]">
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      className="object-contain p-5 transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width: 1280px) 30vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                  <div className="p-5">
                    <p className="font-ui text-sm font-bold text-[#b5245b]">
                      {product.technique ?? product.craftType.name}
                    </p>
                    <h3 className="mt-2 font-serif text-3xl font-bold text-[#7a3100]">
                      {product.name}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6f4c42]">
                      {product.culturalPhrase ??
                        product.description ??
                        "Una pieza con memoria cultural."}
                    </p>
                    <div className="mt-5 flex items-center justify-between font-ui text-sm font-bold">
                      <span className="text-[#30130d]">S/ {String(product.price)}</span>
                      <span className="text-[#b5245b]">Ver detalle</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
