import Link from "next/link";
import { ArrowRight, BookOpen, HandHeart, MessagesSquare, Sparkles } from "lucide-react";

import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";

const discovery = [
  {
    title: "Aprender",
    text: "Cursos y talleres para usar herramientas digitales sin perder la raiz cultural.",
    href: "/login",
    icon: BookOpen,
    color: "bg-[#2f62a3]",
    image: "/images/discover/aprende.png",
    cta: "APRENDER PARA CRECER"
  },
  {
    title: "Emprender",
    text: "Una vitrina cultural donde primero habla la artesana, su comunidad y su historia.",
    href: "/mercado",
    icon: Sparkles,
    color: "bg-[#c02a68]",
    image: "/images/discover/emprende.png",
    cta: "EMPRENDE CON MI MERCADO DIGITAL"
  },
  {
    title: "Colaborar",
    text: "Acompanamiento de facilitadoras, convocatorias y comunidad activa.",
    href: "/login",
    icon: MessagesSquare,
    color: "bg-[#f17a2a]",
    image: "/images/discover/taller.png",
    cta: "TALLERES PRESENCIALES"
  },
  {
    title: "Compartir",
    text: "Historias, tecnicas y procesos documentados para preservar patrimonio vivo.",
    href: "/login",
    icon: HandHeart,
    color: "bg-[#f5b900]",
    image: "/images/discover/recursos.png",
    cta: "RECURSOS Y TALLERES"
  }
];

export default function DescubrePage() {
  return (
    <main className="bg-white text-[#10124f]">
      <WarmiPublicHeader compact />

      <section className="mx-auto w-full max-w-[1860px] px-4 py-10 md:px-8 md:py-14 lg:px-12">
        <div className="border-t-2 border-[#d9d9d9] pt-8">
          <p className="max-w-[1500px] font-ui text-lg leading-7 text-[#10124f] md:text-2xl">
            Con Warmi Digital, tu celular se convierte en tu mejor herramienta para
            aprender, vender y participar en nuevas oportunidades.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 overflow-hidden bg-white shadow-[0_18px_42px_rgba(18,63,120,0.08)] md:grid-cols-4">
          {discovery.map((item) => (
            <div
              key={item.title}
              className="group min-h-[180px] overflow-hidden sm:min-h-[260px] md:min-h-[390px]"
            >
              <div
                className="h-full min-h-[180px] bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105 sm:min-h-[260px] md:min-h-[390px]"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(27,28,26,0.16), rgba(255,255,255,0.03)), url(${item.image})`
                }}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-7">
          {discovery.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className={`group bg-white p-5 shadow-[0_14px_36px_rgba(18,63,120,0.06)] transition-transform hover:-translate-y-1 md:p-7 ${
                  index === 1 ? "xl:mt-10" : index === 3 ? "xl:mt-16" : ""
                }`}
              >
                <span className={`${item.color} inline-flex rounded-full p-3 text-white`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-serif text-2xl font-bold text-[#1b1c1a] md:mt-5 md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-[#5b4a42]">{item.text}</p>
                <span
                  className={`${item.color} mt-6 inline-flex min-h-touch-target w-full items-center justify-center px-3 py-3 text-center font-ui text-xs font-extrabold uppercase leading-snug text-white md:px-5 md:text-sm`}
                >
                  {item.cta}
                </span>
                <ArrowRight className="mt-5 h-5 w-5 text-[#f15a24]" />
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
