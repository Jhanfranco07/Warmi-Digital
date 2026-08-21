import Link from "next/link";
import { ArrowLeft, CheckCircle2, HeartHandshake, ImagePlus, Sparkles } from "lucide-react";

import { ProductForm } from "@/features/marketplace/product-form";
import { uniqueProductOptions } from "@/features/marketplace/product-options";
import { prisma } from "@/shared/server/db/prisma";

export default async function Page() {
  const [categories, craftTypes] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.craftType.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
  ]);

  return (
    <main className="min-h-screen bg-[#fffaf6] px-5 py-6 pb-28 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <Link
          href="/artesana/mi-vitrina"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#e8c4b1] bg-white px-5 font-ui text-sm font-extrabold text-[#7a3100] shadow-[0_12px_28px_rgba(122,49,0,0.08)] transition hover:-translate-y-0.5 hover:bg-[#fff1e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5245b]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a mi vitrina
        </Link>

        <section className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="relative overflow-hidden rounded-[30px] border border-[#f0c3cf] bg-white p-6 shadow-[0_22px_60px_rgba(122,16,66,0.08)] md:p-9">
            <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#ffe6ee]" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 translate-x-16 translate-y-16 rounded-full border-[28px] border-[#f5b900]/20" />
            <div className="relative max-w-4xl border-l-4 border-[#d99a00] pl-5 md:pl-7">
              <div className="mb-5 flex items-center gap-2">
                {["#3268a8", "#b5245b", "#17c3cf", "#f26f21", "#ff8a3d", "#f5b900"].map(
                  (color) => (
                    <span
                      key={color}
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                  )
                )}
              </div>
              <p className="font-ui text-xs font-extrabold uppercase tracking-[0.16em] text-[#b5245b]">
                Mi vitrina cultural
              </p>
              <h1 className="mt-3 font-serif text-5xl font-bold leading-none text-[#1b1c1a] md:text-6xl xl:text-7xl">
                Nueva pieza
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5b4a42] md:text-xl">
                Cuenta primero la historia, después los detalles de tu pieza. La venta
                llega como resultado de mostrar tu memoria, tu técnica y tu comunidad.
              </p>
            </div>
          </div>

          <aside className="rounded-[30px] border border-[#ecd0bd] bg-[linear-gradient(145deg,#fff_0%,#fff7e8_100%)] p-6 shadow-[0_22px_60px_rgba(122,49,0,0.1)]">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f5b900] text-[#1b1c1a] shadow-[0_14px_30px_rgba(245,185,0,0.22)]">
              <HeartHandshake className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-5 font-serif text-3xl font-bold text-[#7a3100]">
              Una guía sencilla
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#5b4a42]">
              Avanza por partes. Puedes guardar como borrador y publicar cuando la
              información esté lista.
            </p>
            <div className="mt-6 space-y-3">
              {[
                ["Foto clara", "Muestra la pieza completa o un detalle importante."],
                ["Historia", "Cuenta qué representa y de dónde nace."],
                ["Publicación", "Elige borrador o vitrina cuando esté completa."]
              ].map(([title, text], index) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-2xl border border-[#f0d7b7] bg-white/80 p-4"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fff1e5] text-[#b5245b]">
                    {index === 0 ? (
                      <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    ) : index === 1 ? (
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    )}
                  </span>
                  <span>
                    <strong className="block font-ui text-sm text-[#1b1c1a]">
                      {title}
                    </strong>
                    <span className="mt-1 block text-xs leading-5 text-[#5b4a42]">
                      {text}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <div className="mt-6">
          <ProductForm
            categories={uniqueProductOptions(categories)}
            craftTypes={uniqueProductOptions(craftTypes)}
          />
        </div>
      </div>
    </main>
  );
}
