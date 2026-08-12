import Link from "next/link";
import type { Route } from "next";
import { Grid2X2, MapPin, Search, Volume2 } from "lucide-react";

import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";
import { WarmiLogo } from "@/shared/components/brand/warmi-logo";
import { Input } from "@/shared/components/ui/input";
import { prisma } from "@/shared/server/db/prisma";

const fallbackArtisanImages = [
  "/images/auth/artesana.png",
  "/images/programa/programa-warmi.png",
  "/images/discover/emprende.png",
  "/images/discover/taller.png",
  "/images/discover/aprende.png",
  "/images/discover/recursos.png"
];

const fallbackTextures = [
  "/images/discover/aprende.png",
  "/images/discover/emprende.png",
  "/images/discover/taller.png",
  "/images/discover/recursos.png"
];

type MarketplacePageProps = {
  searchParams: Promise<{
    artisan?: string;
    product?: string;
  }>;
};

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const { artisan, product } = await searchParams;

  const artisans = await prisma.user.findMany({
    where: {
      deletedAt: null,
      products: {
        some: {
          status: "PUBLISHED",
          available: true,
          deletedAt: null,
          ...(product
            ? {
                OR: [
                  { name: { contains: product, mode: "insensitive" } },
                  { craftType: { name: { contains: product, mode: "insensitive" } } },
                  { category: { name: { contains: product, mode: "insensitive" } } }
                ]
              }
            : {})
        }
      },
      ...(artisan
        ? {
            profile: {
              is: {
                OR: [
                  { displayName: { contains: artisan, mode: "insensitive" } },
                  { firstName: { contains: artisan, mode: "insensitive" } },
                  { lastName: { contains: artisan, mode: "insensitive" } }
                ]
              }
            }
          }
        : {})
    },
    include: {
      profile: { include: { community: true } },
      stories: {
        where: { publishedAt: { not: null }, deletedAt: null },
        include: { coverImage: true },
        orderBy: { publishedAt: "desc" },
        take: 1
      },
      products: {
        where: {
          status: "PUBLISHED",
          available: true,
          deletedAt: null,
          ...(product
            ? {
                OR: [
                  { name: { contains: product, mode: "insensitive" } },
                  { craftType: { name: { contains: product, mode: "insensitive" } } },
                  { category: { name: { contains: product, mode: "insensitive" } } }
                ]
              }
            : {})
        },
        include: {
          community: true,
          craftType: true,
          images: { include: { file: true }, orderBy: { order: "asc" }, take: 1 }
        },
        orderBy: { updatedAt: "desc" },
        take: 4
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <main className="min-h-screen bg-[#fffaf8] text-[#30130d]">
      <WarmiPublicHeader navOnly />

      <section className="mx-auto w-full max-w-[1760px] px-4 py-8 md:px-8 lg:px-12">
        <header className="warmi-scroll-reveal grid gap-6 border-b border-[#e9cfc4] pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-4 w-28 md:w-36">
              <WarmiLogo compact markClassName="w-full" />
            </div>
            <h1 className="font-serif text-5xl font-bold leading-none text-[#7a3100] md:text-7xl">
              Mi vitrina virtual
            </h1>
            <p className="mt-3 font-ui text-sm font-bold text-[#b5245b] md:text-base">
              Mujeres que tejen cultura, historias que perduran.
            </p>
          </div>

          <form className="grid gap-3 md:grid-cols-[minmax(240px,360px)_minmax(240px,360px)_auto]">
            <label className="flex h-12 items-center gap-3 rounded-full border border-[#e2a0ba] bg-white/70 px-4">
              <Search className="h-5 w-5 text-[#b5245b]" />
              <Input
                name="artisan"
                defaultValue={artisan}
                className="h-10 border-0 bg-transparent px-0 font-ui text-sm shadow-none focus-visible:ring-0"
                placeholder="Buscar por nombre de artesana"
              />
            </label>
            <label className="flex h-12 items-center gap-3 rounded-full border border-[#e2a0ba] bg-white/70 px-4">
              <Grid2X2 className="h-5 w-5 text-[#b5245b]" />
              <Input
                name="product"
                defaultValue={product}
                className="h-10 border-0 bg-transparent px-0 font-ui text-sm shadow-none focus-visible:ring-0"
                placeholder="Buscar por producto"
              />
            </label>
            <button
              type="submit"
              className="grid h-12 w-12 place-items-center rounded-full bg-[#b5245b] text-white shadow-[0_12px_28px_rgba(181,36,91,0.22)]"
              aria-label="Buscar"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          </form>
        </header>

        <section className="mt-8 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {artisans.map((item, index) => {
            const story = item.stories[0];
            const firstProduct = item.products[0];
            const image =
              item.profile?.avatarUrl ??
              story?.coverImage?.url ??
              firstProduct?.images[0]?.file.url ??
              fallbackArtisanImages[index % fallbackArtisanImages.length];
            const texture =
              firstProduct?.images[0]?.file.url ??
              fallbackTextures[index % fallbackTextures.length];

            return (
              <Link
                key={item.id}
                href={`/artesanas/${item.id}` as Route}
                className="warmi-scroll-reveal group overflow-visible border border-[#ead4ca] bg-white shadow-[0_18px_42px_rgba(122,49,0,0.07)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_62px_rgba(122,49,0,0.13)]"
              >
                <div
                  className="relative min-h-[310px] bg-cover bg-center"
                  style={{ backgroundImage: `url(${image})` }}
                >
                  <span className="from-[#30130d]/28 absolute inset-0 bg-gradient-to-t to-transparent" />
                  <span
                    className="absolute -bottom-16 right-7 z-10 h-32 w-32 rounded-full border-4 border-white bg-cover bg-center shadow-[0_12px_34px_rgba(48,19,13,0.24)] transition-transform duration-500 group-hover:scale-110 md:-bottom-14"
                    style={{ backgroundImage: `url(${texture})` }}
                  />
                </div>
                <div className="p-5 pr-40 pt-8 md:pt-6">
                  <h2 className="font-serif text-3xl font-bold text-[#7a3100]">
                    {item.profile?.displayName ?? item.name ?? "Artesana Warmi"}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 font-ui text-sm text-[#b5245b]">
                    <MapPin className="h-4 w-4" />
                    {item.profile?.community?.name ??
                      firstProduct?.community.name ??
                      "Comunidad Warmi"}
                  </p>
                  <p className="mt-4 line-clamp-3 text-sm italic leading-6 text-[#6f4c42]">
                    {story?.summary ??
                      item.profile?.bio ??
                      firstProduct?.culturalPhrase ??
                      "Cada pieza nace de una historia, una técnica y una memoria compartida."}
                  </p>
                  <p className="mt-4 font-ui text-xs font-bold uppercase tracking-[0.08em] text-[#d39a12]">
                    {item.products.length} piezas en vitrina
                  </p>
                </div>
              </Link>
            );
          })}
        </section>

        <footer className="mx-auto mt-10 flex max-w-4xl items-center gap-5 text-center font-ui text-sm text-[#7a3100]">
          <span className="h-px flex-1 bg-[#e2a0ba]" />
          Gracias por valorar el trabajo de nuestras artesanas y por ser parte de esta
          historia.
          <span className="h-px flex-1 bg-[#e2a0ba]" />
        </footer>
      </section>
    </main>
  );
}
