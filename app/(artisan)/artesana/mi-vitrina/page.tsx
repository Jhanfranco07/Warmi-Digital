import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Heart, MapPin, Plus, SlidersHorizontal } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { requireRole } from "@/shared/server/auth/helpers";
import { ArtisanShowcaseService } from "@/shared/services/artisan-showcase.service";

export default async function ArtisanShowcasePage() {
  const session = await requireRole("ARTESANA");
  const [artisan, showcase] = await Promise.all([
    new ArtisanRepository().findProfile(session.user.id),
    new ArtisanShowcaseService().getShowcase(session.user.id)
  ]);

  const artisanName =
    artisan?.profile?.displayName ?? session.user.name ?? "Artesana Warmi";
  const communityName = artisan?.profile?.community?.name ?? "San Miguel, Cajamarca";
  const avatarUrl = artisan?.profile?.avatarUrl ?? null;
  const products = showcase.products.map((product) => ({
    id: product.id,
    name: product.name,
    community: product.community.name,
    technique: product.technique ?? product.craftType.name,
    phrase:
      product.culturalPhrase ??
      "Cada pieza conserva una historia transmitida por generaciones.",
    image: product.images[0]?.file.url ?? null,
    status: product.status
  }));

  return (
    <>
      <section className="relative overflow-hidden bg-[#fffaf6] px-5 pb-7 pt-6 lg:hidden">
        <div className="pointer-events-none absolute -right-16 top-5 h-44 w-44 rounded-full bg-[#ffe6ee]" />
        <div className="pointer-events-none absolute -right-4 top-9 h-40 w-40 opacity-80">
          <Image
            src="/images/brand/warmi-isotipo.png"
            alt=""
            fill
            sizes="160px"
            className="object-contain"
          />
        </div>

        <div className="relative">
          <h1 className="font-serif text-4xl font-bold leading-tight text-[#7a1042]">
            Mi vitrina <span className="text-[#c93772]">-</span>
          </h1>
          <p className="mt-2 max-w-[250px] text-sm leading-5 text-[#5b4a42]">
            Comparte tu arte y conecta con personas que valoran lo artesanal.
          </p>

          <article className="mt-6 grid grid-cols-[1fr_144px] overflow-hidden rounded-2xl border border-[#f0c3cf] bg-white shadow-[0_14px_30px_rgba(122,16,66,0.1)]">
            <div className="p-5">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-[#ffe6ee] text-[#b5245b]">
                W
              </div>
              <h2 className="font-serif text-xl font-bold text-[#7a1042]">
                {artisanName}
              </h2>
              <p className="mt-4 font-serif text-sm italic leading-5 text-[#7a3100]">
                &quot;Tejo historias con mis manos y colores de mi tierra.&quot;
              </p>
              <p className="mt-4 flex items-center gap-1 text-[11px] text-[#5b4a42]">
                <MapPin className="h-3.5 w-3.5 text-[#b5245b]" />
                {communityName}
              </p>
            </div>
            <div className="relative min-h-[170px]">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={artisanName}
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              ) : (
                <ProductImagePlaceholder compact />
              )}
            </div>
          </article>

          <Button
            asChild
            className="mt-5 min-h-12 w-full rounded-full bg-[#b5245b] text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(181,36,91,0.22)] hover:bg-[#941747]"
          >
            <Link href="/artesana/mi-vitrina/nuevo">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Agregar nueva pieza
            </Link>
          </Button>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {["Todos", "Tejido", "Bordado", "Cerámica", "Más"].map((filter, index) => (
              <span
                key={filter}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${
                  index === 0
                    ? "border-[#b5245b] bg-[#b5245b] text-white"
                    : "border-[#f0c3cf] bg-white text-[#b5245b]"
                }`}
              >
                {filter}
              </span>
            ))}
          </div>

          {products.length ? (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-[#f5d2dc] bg-white shadow-[0_12px_26px_rgba(122,16,66,0.08)]"
                >
                  <div className="relative h-36">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="50vw"
                        className="object-cover"
                      />
                    ) : (
                      <ProductImagePlaceholder />
                    )}
                    <button
                      type="button"
                      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white text-[#b5245b] shadow"
                      aria-label="Guardar pieza"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-1 font-ui text-sm font-extrabold text-[#1b1c1a]">
                      {product.name}
                    </h3>
                    <span className="mt-2 inline-flex rounded-full bg-[#ffe6ee] px-2 py-1 text-[10px] font-bold text-[#b5245b]">
                      {product.technique}
                    </span>
                    <p className="mt-2 flex items-center gap-1 text-[10px] text-[#5b4a42]">
                      <MapPin className="h-3 w-3 text-[#b5245b]" />
                      {product.community}
                    </p>
                    <p className="mt-2 line-clamp-2 font-serif text-[11px] italic leading-4 text-[#7a3100]">
                      &quot;{product.phrase}&quot;
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <MobileEmptyState />
          )}
        </div>
      </section>

      <main className="hidden min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:block lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
        <div className="mx-auto w-full max-w-[1760px]">
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl 2xl:text-7xl">
                Mi vitrina <span className="text-4xl text-[#b5245b]">-</span>
              </h1>
              <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
                Comparte tu arte, tus saberes y la esencia de tu comunidad con el mundo.
              </p>
            </div>
            <span className="relative hidden h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-white shadow-[0_12px_28px_rgba(122,49,0,0.16)] md:block">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={artisanName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <ProductImagePlaceholder compact />
              )}
            </span>
          </header>

          <section className="mt-8 overflow-hidden rounded-[22px] border border-[#ecd0bd] bg-white shadow-[0_24px_70px_rgba(122,49,0,0.11)]">
            <div className="relative min-h-[430px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(181,36,91,0.18),transparent_32%),linear-gradient(120deg,#fffaf6_0%,#fff_48%,#f9efe4_100%)]" />
              <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(135deg,rgba(245,185,0,0.18),rgba(23,195,207,0.12))] lg:block" />
              <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-20 translate-y-20 rounded-full border-[36px] border-[#f5b900]/25" />
              <div className="absolute right-28 top-20 h-32 w-32 rounded-full border-[22px] border-[#17c3cf]/20" />
              <div className="relative max-w-2xl px-8 py-10 md:px-12 md:py-14">
                <p className="font-ui text-xl font-extrabold text-[#b5245b]">Hola, soy</p>
                <h2 className="mt-2 font-serif text-6xl font-bold leading-none text-[#b5245b] md:text-7xl">
                  {artisanName}
                </h2>
                <p className="mt-4 text-xl text-[#5b4a42]">Artesana de {communityName}</p>
                <blockquote className="mt-9 max-w-md border-l-4 border-[#d8b899] pl-6 font-serif text-3xl italic leading-tight text-[#7a3100]">
                  Tejo historias que vienen de mis abuelas y florecen en mis manos.
                </blockquote>
                <div className="mt-8 h-px w-48 bg-[#d8b899]" />
                <p className="mt-6 max-w-sm font-serif text-xl italic text-[#7a3100]">
                  Gracias por valorar lo hecho con corazón.
                </p>
                <Button
                  asChild
                  className="mt-8 rounded-full bg-[#b5245b] px-8 text-white hover:bg-[#941747]"
                >
                  <Link href="/artesana/mi-vitrina/nuevo">
                    <Plus className="h-5 w-5" />
                    Agregar pieza
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="mt-9">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 className="font-serif text-4xl font-bold text-[#b5245b]">
                  Piezas artesanales
                </h2>
                <div className="mt-2 h-px w-28 bg-[#f26f21]" />
                <p className="mt-4 text-base text-[#5b4a42]">
                  Cada creación nace de nuestra tierra, nuestras manos y nuestra historia.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-lg border-[#ecd0bd] bg-white px-7 text-[#7a3100] hover:bg-[#fff1e5]"
              >
                <SlidersHorizontal className="h-5 w-5" />
                Filtrar por técnica
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {products.length ? (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[18px] border border-[#ecd0bd] bg-white shadow-[0_18px_44px_rgba(122,49,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_64px_rgba(122,49,0,0.13)]"
                  >
                    <div className="relative h-56">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1280px) 380px, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <ProductImagePlaceholder />
                      )}
                      <button
                        type="button"
                        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-[#b5245b] shadow-lg"
                        aria-label="Guardar pieza"
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-ui text-xl font-extrabold text-[#1b1c1a]">
                          {product.name}
                        </h3>
                        <span className="rounded-full bg-[#fff1e5] px-3 py-1 text-xs font-bold text-[#a95511]">
                          {product.status === "PUBLISHED" ? "Publicado" : "Borrador"}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-sm text-[#5b4a42]">
                        <MapPin className="h-4 w-4 text-[#b5245b]" />
                        {product.community}
                      </p>
                      <span className="mt-4 inline-flex rounded-lg bg-[#f8eadc] px-3 py-2 text-sm font-bold text-[#7a3100]">
                        {product.technique}
                      </span>
                      <p className="mt-5 font-serif text-lg italic leading-7 text-[#7a3100]">
                        &quot;{product.phrase}&quot;
                      </p>
                      <div className="mt-5 flex justify-end text-[#b5245b]">W</div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[18px] border border-dashed border-[#ecd0bd] bg-white px-8 py-14 text-center shadow-[0_18px_44px_rgba(122,49,0,0.06)]">
                <h3 className="font-serif text-3xl font-bold text-[#7a1042]">
                  Todavía no tienes piezas registradas.
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-[#5b4a42]">
                  Crea tu primera pieza para documentar su historia, técnica, materiales e
                  imagen principal.
                </p>
                <Button
                  asChild
                  className="mt-7 rounded-full bg-[#b5245b] px-8 text-white hover:bg-[#941747]"
                >
                  <Link href="/artesana/mi-vitrina/nuevo">
                    <Plus className="h-5 w-5" />
                    Crear mi primera pieza
                  </Link>
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function MobileEmptyState() {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-[#f0c3cf] bg-white p-5 text-center shadow-[0_12px_26px_rgba(122,16,66,0.06)]">
      <h3 className="font-serif text-xl font-bold text-[#7a1042]">
        Todavía no tienes piezas.
      </h3>
      <p className="mt-2 text-xs leading-5 text-[#5b4a42]">
        Crea tu primera pieza para que aparezca en tu vitrina.
      </p>
      <Button
        asChild
        className="mt-4 rounded-full bg-[#b5245b] text-white hover:bg-[#941747]"
      >
        <Link href="/artesana/mi-vitrina/nuevo">Crear pieza</Link>
      </Button>
    </div>
  );
}

function ProductImagePlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex h-full min-h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(245,185,0,0.24),transparent_30%),linear-gradient(135deg,#fff1e5,#ffe6ee)]">
      <div
        className={`grid place-items-center rounded-full border border-white/70 bg-white/65 text-[#b5245b] shadow-sm ${
          compact ? "h-20 w-20 text-3xl" : "h-24 w-24 text-4xl"
        }`}
      >
        W
      </div>
    </div>
  );
}
