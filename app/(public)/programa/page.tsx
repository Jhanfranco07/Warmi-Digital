import {
  BookOpen,
  HandHeart,
  ShoppingBag,
  Smartphone,
  Target,
  UsersRound
} from "lucide-react";

import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";
import { WarmiLogo } from "@/shared/components/brand/warmi-logo";

const programPillars = [
  {
    title: "Objetivo general",
    icon: Target,
    text: "Que aprendan a usar su celular para vender sus productos, prepararse para participar en concursos, ferias y hacer sus propios tramites, con la ayuda de una facilitadora y de otras artesanas."
  },
  {
    title: "Mision",
    icon: ShoppingBag,
    text: "Ensenarles a usar herramientas digitales de forma practica y con acompanamiento, para que su celular sea una herramienta de trabajo, tengan mas ventas y participen en concursos que les ayuden a crecer."
  },
  {
    title: "Vision",
    icon: UsersRound,
    text: "Ser un ejemplo en la region Cajamarca de como las artesanas pueden usar la tecnologia junto al apoyo de su comunidad, para que ninguna se quede atras y todas tengan oportunidades de salir adelante con su trabajo."
  }
];

export default function ProgramaPage() {
  return (
    <main className="bg-white text-[#123f78]">
      <WarmiPublicHeader compact />

      <section className="mx-auto w-full max-w-[1680px] px-4 py-14 md:px-8 md:py-20">
        <div className="relative border-t-2 border-[#d9d9d9] pt-8">
          <div className="inline-flex bg-[#5576a7] px-8 py-4 md:absolute md:-top-9 md:left-0 md:px-12 md:py-5">
            <h2 className="font-ui text-2xl font-extrabold uppercase text-white md:text-3xl">
              Programa Warmi
            </h2>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="group min-h-[420px] overflow-hidden md:min-h-[640px]">
              <div
                className="h-full min-h-[420px] bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105 md:min-h-[640px]"
                style={{
                  backgroundImage:
                    "linear-gradient(to top, rgba(27,28,26,0.08), rgba(255,255,255,0)), url(/images/programa/programa-warmi.png)"
                }}
              />
            </div>

            <div>
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex gap-2">
                    {[
                      "#5576a7",
                      "#b5245b",
                      "#55d2dd",
                      "#fc6b22",
                      "#ff8941",
                      "#f0bf35"
                    ].map((color) => (
                      <span
                        key={color}
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="mt-5 font-serif text-2xl italic text-[#b5245b]">
                    La tecnologia no reemplaza la tradicion; la conecta con nuevas
                    oportunidades.
                  </p>
                </div>
                <WarmiLogo compact markClassName="w-36 md:w-44" />
              </div>

              <div className="mt-8 grid gap-5">
                {programPillars.map((pillar) => {
                  const Icon = pillar.icon;

                  return (
                    <article
                      key={pillar.title}
                      className="grid gap-3 md:grid-cols-[58px_1fr]"
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#b5245b] md:h-14 md:w-14">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="font-ui text-xl font-extrabold uppercase text-[#b5245b] md:text-2xl">
                          {pillar.title}:
                        </h3>
                        <p className="mt-2 bg-[#ea9b62] px-4 py-3 text-sm leading-6 text-[#1b1c1a] md:text-base">
                          {pillar.text}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ["Descubrir", Smartphone],
                  ["Aprender", BookOpen],
                  ["Preservar", HandHeart]
                ].map(([label, Icon]) => (
                  <div
                    key={label as string}
                    className="flex min-h-16 items-center justify-center gap-2 bg-[#f0bf35] px-4 py-3 text-center font-ui text-sm font-extrabold uppercase text-[#123f78]"
                  >
                    <Icon className="h-5 w-5" />
                    {label as string}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
