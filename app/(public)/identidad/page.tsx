import Link from "next/link";
import { BookOpen, HandHeart, MapPin, Sparkles } from "lucide-react";

import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";
import { Container } from "@/shared/components/layout/container";

const identityItems = [
  {
    title: "Historia",
    text: "Cada artesana documenta su camino, su comunidad y el saber recibido.",
    icon: BookOpen,
    color: "bg-[#5576a7]"
  },
  {
    title: "Territorio",
    text: "La pieza no aparece sola: nace de una comunidad, una tecnica y una memoria.",
    icon: MapPin,
    color: "bg-[#55d2dd]"
  },
  {
    title: "Tecnica",
    text: "La plataforma ayuda a preservar procesos, materiales y significados culturales.",
    icon: Sparkles,
    color: "bg-[#ea9b62]"
  },
  {
    title: "Comunidad",
    text: "El aprendizaje se acompana entre artesanas, facilitadoras y familias.",
    icon: HandHeart,
    color: "bg-[#f0bf35]"
  }
];

export default function IdentidadPage() {
  return (
    <main className="bg-white text-[#123f78]">
      <WarmiPublicHeader compact />

      <section className="border-y-[6px] border-[#55d2dd] bg-[#ecfcfd]">
        <Container className="grid gap-8 px-4 py-12 md:grid-cols-3 md:items-center md:py-14">
          <div>
            <p className="font-ui text-label-ui text-[#123f78]">
              IDENTIDAD WARMI - RIQSICHIQ WARMI
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold text-[#1b1c1a] md:text-6xl">
              Nuestra fuerza nace de la comunidad.
            </h1>
          </div>
          <p className="text-body-lg text-[#4f4037] md:col-span-2">
            Cada tecnica, historia y pieza pertenece a una artesana y a su territorio. La
            tecnologia ayuda a documentar y compartir ese legado con respeto.
          </p>
        </Container>
      </section>

      <section className="mx-auto w-full max-w-[1500px] px-4 py-14 md:px-8 lg:px-12">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {identityItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="border border-[#ead4ca] bg-white p-6 shadow-[0_18px_42px_rgba(122,49,0,0.07)]"
              >
                <span className={`${item.color} inline-flex rounded-full p-4 text-white`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-6 font-serif text-3xl font-bold text-[#7a3100]">
                  {item.title}
                </h2>
                <p className="mt-3 text-base leading-7 text-[#5b4a42]">{item.text}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            className="bg-[#55d2dd] px-8 py-5 text-center font-ui text-sm font-bold uppercase text-[#123f78] md:text-label-ui"
            href="/login"
          >
            Elegir mi camino
          </Link>
        </div>
      </section>
    </main>
  );
}
