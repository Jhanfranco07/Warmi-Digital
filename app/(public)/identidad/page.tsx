import Link from "next/link";
import { BookOpen, HandHeart, MapPin, Sparkles } from "lucide-react";

import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";

const identityItems = [
  {
    title: "Historia",
    text: "Cada artesana documenta su camino, su comunidad y el saber recibido.",
    icon: BookOpen,
    color: "bg-[#2f62a3]"
  },
  {
    title: "Territorio",
    text: "La pieza no aparece sola: nace de una comunidad, una tecnica y una memoria.",
    icon: MapPin,
    color: "bg-[#17c3cf]"
  },
  {
    title: "Tecnica",
    text: "La plataforma ayuda a preservar procesos, materiales y significados culturales.",
    icon: Sparkles,
    color: "bg-[#f17a2a]"
  },
  {
    title: "Comunidad",
    text: "El aprendizaje se acompana entre artesanas, facilitadoras y familias.",
    icon: HandHeart,
    color: "bg-[#f5b900]"
  }
];

export default function IdentidadPage() {
  return (
    <main className="bg-white text-[#123f78]">
      <WarmiPublicHeader compact />

      <section className="border-y-[6px] border-[#17c3cf] bg-[#e8fbfc]">
        <div className="mx-auto grid w-full max-w-[1860px] gap-8 px-4 py-12 md:grid-cols-[0.9fr_1.1fr] md:items-center md:px-8 md:py-16 lg:px-12">
          <div>
            <h1 className="font-serif text-4xl font-bold text-[#1b1c1a] md:text-7xl">
              Nuestra fuerza nace de la comunidad.
            </h1>
          </div>
          <p className="text-lg leading-8 text-[#4f4037] md:text-2xl md:leading-10">
            Cada tecnica, historia y pieza pertenece a una artesana y a su territorio. La
            tecnologia ayuda a documentar y compartir ese legado con respeto.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1860px] px-4 py-14 md:px-8 lg:px-12">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {identityItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="border border-[#ead4ca] bg-white p-7 shadow-[0_18px_42px_rgba(122,49,0,0.07)]"
              >
                <span className={`${item.color} inline-flex rounded-full p-4 text-white`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-6 font-serif text-3xl font-bold text-[#7a3100]">
                  {item.title}
                </h2>
                <p className="mt-3 text-base leading-7 text-[#5b4a42] md:text-lg md:leading-8">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            className="bg-[#17c3cf] px-8 py-5 text-center font-ui text-sm font-bold uppercase text-[#123f78] md:text-label-ui"
            href="/login"
          >
            Elegir mi camino
          </Link>
        </div>
      </section>
    </main>
  );
}
