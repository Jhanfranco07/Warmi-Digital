import Link from "next/link";
import { ArrowRight, BookOpen, HandHeart, MessagesSquare, Sparkles } from "lucide-react";

import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";

const discovery = [
  {
    title: "Aprender",
    text: "Cursos y talleres para usar herramientas digitales sin perder la raiz cultural.",
    href: "/login",
    icon: BookOpen,
    color: "bg-[#5576a7]",
    image: "/images/discover/aprende.png",
    cta: "APRENDER PARA CRECER"
  },
  {
    title: "Emprender",
    text: "Una vitrina cultural donde primero habla la artesana, su comunidad y su historia.",
    href: "/mercado",
    icon: Sparkles,
    color: "bg-[#d497b1]",
    image: "/images/discover/emprende.png",
    cta: "EMPRENDE CON MI MERCADO DIGITAL"
  },
  {
    title: "Colaborar",
    text: "Acompanamiento de facilitadoras, convocatorias y comunidad activa.",
    href: "/login",
    icon: MessagesSquare,
    color: "bg-[#ea9b62]",
    image: "/images/discover/taller.png",
    cta: "TALLERES PRESENCIALES"
  },
  {
    title: "Compartir",
    text: "Historias, tecnicas y procesos documentados para preservar patrimonio vivo.",
    href: "/login",
    icon: HandHeart,
    color: "bg-[#f0bf35]",
    image: "/images/discover/recursos.png",
    cta: "RECURSOS Y TALLERES"
  }
];

export default function DescubrePage() {
  return (
    <main className="bg-white text-[#10124f]">
      <WarmiPublicHeader compact />

      <section className="mx-auto w-full max-w-[1680px] px-4 py-14 md:px-8 md:py-16">
        <div className="relative border-t-2 border-[#d9d9d9] pt-7">
          <div className="inline-flex bg-[#ea9b62] px-8 py-4 md:absolute md:-top-9 md:left-0 md:px-10 md:py-5">
            <h2 className="font-ui text-2xl font-extrabold uppercase text-white md:text-3xl">
              Descubre
            </h2>
          </div>
          <p className="pt-5 font-ui text-lg leading-7 text-[#10124f] md:pt-9 md:text-2xl">
            Con Warmi Digital, tu celular se convierte en tu mejor herramienta para
            aprender, vender y participar en nuevas oportunidades.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 overflow-hidden bg-white md:grid-cols-4">
          {discovery.map((item) => (
            <div
              key={item.title}
              className="group min-h-[160px] overflow-hidden sm:min-h-[220px] md:min-h-[310px]"
            >
              <div
                className="h-full min-h-[160px] bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105 sm:min-h-[220px] md:min-h-[310px]"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(27,28,26,0.16), rgba(255,255,255,0.03)), url(${item.image})`
                }}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 md:grid-cols-4 md:gap-x-8 md:gap-y-5">
          {discovery.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className={`group bg-white p-4 transition-transform hover:-translate-y-1 md:p-5 ${
                  index === 1 ? "md:mt-12" : index === 3 ? "md:mt-20" : ""
                }`}
              >
                <span className={`${item.color} inline-flex rounded-full p-3 text-white`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-serif text-2xl font-bold text-[#1b1c1a] md:mt-5 md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-body-md text-[#5b4a42]">{item.text}</p>
                <span
                  className={`${item.color} mt-6 inline-flex min-h-touch-target w-full items-center justify-center px-3 py-3 text-center font-ui text-xs font-extrabold uppercase leading-snug text-white md:px-5 md:text-sm`}
                >
                  {item.cta}
                </span>
                <ArrowRight className="mt-5 h-5 w-5 text-[#fc6b22]" />
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
