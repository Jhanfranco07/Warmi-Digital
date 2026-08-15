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
    text: "Fortalecer las capacidades digitales de las artesanas de la región Cajamarca, mediante un proceso de formación y acompañamiento personalizado, que les permita emplear su dispositivo móvil como una herramienta estratégica para la comercialización de sus productos, la postulación a concursos y ferias, y la gestión autónoma de trámites vinculados a su actividad productiva, con el soporte de una facilitadora especializada y el respaldo de la red de artesanas."
  },
  {
    title: "Misión",
    icon: ShoppingBag,
    text: "Desarrollar competencias digitales prácticas en las artesanas, mediante un acompañamiento técnico continuo, orientado a transformar su teléfono celular en un instrumento de trabajo efectivo que potencie sus canales de comercialización, facilite su participación en certámenes de reconocimiento y contribuya al fortalecimiento de su emprendimiento."
  },
  {
    title: "Visión",
    icon: UsersRound,
    text: "Constituirnos en un modelo de referencia en la región Cajamarca, que demuestre la viabilidad de articular tecnologías digitales con el tejido asociativo y comunitario del sector artesanal, garantizando que ninguna artesana quede excluida del acceso a oportunidades de desarrollo y que todas cuenten con los recursos técnicos y organizativos necesarios para la sostenibilidad de su actividad productiva."
  }
];

export default function ProgramaPage() {
  return (
    <main className="bg-white text-[#123f78]">
      <WarmiPublicHeader compact />

      <section className="mx-auto w-full max-w-[1860px] px-4 py-10 md:px-8 md:py-16 lg:px-12">
        <div className="warmi-scroll-reveal border-t-2 border-[#d9d9d9] pt-8">
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="group min-h-[440px] overflow-hidden md:min-h-[700px]">
              <div
                className="h-full min-h-[440px] bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105 md:min-h-[700px]"
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
                      "#2f62a3",
                      "#b5245b",
                      "#17c3cf",
                      "#f15a24",
                      "#ff8941",
                      "#f5b900"
                    ].map((color) => (
                      <span
                        key={color}
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="mt-5 max-w-3xl font-serif text-3xl italic leading-tight text-[#b5245b]">
                    La tecnología no reemplaza la tradición; la conecta con nuevas
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
                      className="group grid gap-3 transition-transform duration-500 hover:translate-x-1 md:grid-cols-[58px_1fr]"
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#fff3e8] text-[#b5245b] shadow-[0_12px_28px_rgba(181,36,91,0.12)] transition-colors duration-300 group-hover:bg-[#b5245b] group-hover:text-white md:h-14 md:w-14">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="font-ui text-xl font-extrabold uppercase text-[#b5245b] md:text-2xl">
                          {pillar.title}:
                        </h3>
                        <p className="mt-2 border-l-[8px] border-[#f17a2a] bg-[#fff4ec] px-5 py-4 text-base leading-7 text-[#3a2118] shadow-[0_12px_30px_rgba(122,49,0,0.08)] transition-colors duration-300 group-hover:bg-[#ffe8d9] md:text-lg">
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
                    className="flex min-h-16 items-center justify-center gap-2 bg-[#f5b900] px-4 py-3 text-center font-ui text-sm font-extrabold uppercase text-[#123f78] shadow-[0_12px_24px_rgba(245,185,0,0.16)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#ffd23c]"
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
