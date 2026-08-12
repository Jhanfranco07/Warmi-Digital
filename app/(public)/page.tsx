import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HandHeart,
  MessagesSquare,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  UsersRound
} from "lucide-react";

import { WarmiLogo } from "@/shared/components/brand/warmi-logo";
import { Container } from "@/shared/components/layout/container";

const hero =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAx1EYaB9Blh965Nub9RDokUeqX6dIW3zuusAKDcWEaZwtlK2mZC18YCzYeKF9a-Djz_ft7lsqcXZwhx2VhRwJKAVrSy_sFvB4jp3SUDvQlUCv6MnrH9K1Mc4ABDVTjfK_MJ1a-LfuwRS7yAUAIDk2FRw0xGyGjMeLqKzHh_9FXLAjGR4CmiytIgLLt-fQ2C_3E7DMFWc8ufz2Bop1AckIX-lgdkfKoXK-AITeYCIk8C7ym7G_Ey1TI";

const actions = [
  {
    href: "#programa",
    label: "PROGRAMA WARMI",
    color: "bg-[#5576a7]"
  },
  {
    href: "#descubre",
    label: "DESCUBRE",
    color: "bg-[#ea9b62]"
  },
  {
    href: "#identidad",
    label: "IDENTIDAD WARMI",
    color: "bg-[#55d2dd]"
  },
  {
    href: "/login",
    label: "UNETE A WARMI",
    color: "bg-[#f0bf35]"
  }
];

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

export default function LandingPage() {
  return (
    <main className="bg-white text-[#123f78]">
      <section className="relative min-h-[520px] overflow-hidden">
        <div
          className="warmi-hero-photo absolute inset-0 bg-cover bg-center grayscale"
          style={{
            backgroundImage: `linear-gradient(rgba(27,28,26,.42),rgba(27,28,26,.42)),url(${hero})`
          }}
        />
        <Container className="flex min-h-[520px] items-center justify-center px-4 text-center">
          <div className="relative flex max-w-4xl flex-col items-center">
            <WarmiLogo
              className="flex-col gap-2"
              markClassName="w-56 md:w-80"
              textClassName="hidden"
            />
            <h1 className="mt-5 font-serif text-4xl font-bold leading-tight tracking-[0.18em] text-white sm:text-5xl md:text-7xl">
              WARMI DIGITAL
            </h1>
            <p className="mt-4 max-w-sm text-lg italic text-white md:max-w-none md:text-2xl">
              Artesanas conectadas, historias que transforman.
            </p>
          </div>
        </Container>
      </section>

      <nav className="sticky top-0 z-30 grid grid-cols-2 font-ui text-sm font-bold text-white shadow-[0_8px_18px_rgba(27,28,26,0.16)] md:grid-cols-4 md:text-label-ui">
        {actions.map((action) => (
          <Link
            key={action.label}
            className={`${action.color} flex min-h-16 items-center justify-center px-3 py-5 text-center leading-tight transition-opacity hover:brightness-105 md:min-h-20 md:px-5 md:py-7`}
            href={action.href}
          >
            {action.label}
          </Link>
        ))}
      </nav>

      <section id="programa" className="bg-white">
        <div className="mx-auto w-full max-w-[1680px] px-4 py-14 md:px-8 md:py-20">
          <div className="relative border-t-2 border-[#d9d9d9] pt-8">
            <div className="inline-flex bg-[#5576a7] px-8 py-4 md:absolute md:-top-9 md:left-0 md:px-12 md:py-5">
              <h2 className="font-ui text-2xl font-extrabold uppercase text-white md:text-3xl">
                Programa Warmi
              </h2>
            </div>

            <div className="warmi-scroll-reveal mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="group min-h-[420px] overflow-hidden md:min-h-[640px]">
                <div
                  className="h-full min-h-[420px] bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105 md:min-h-[640px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to top, rgba(27,28,26,0.08), rgba(255,255,255,0)), url(/images/programa/programa-warmi.png)"
                  }}
                />
              </div>

              <div className="warmi-scroll-reveal">
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
        </div>
      </section>

      <section id="descubre" className="bg-white">
        <div className="mx-auto w-full max-w-[1680px] px-4 py-14 md:px-8 md:py-16">
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

          <div className="warmi-scroll-reveal mt-8 grid grid-cols-2 overflow-hidden bg-white md:grid-cols-4">
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

          <div className="warmi-scroll-reveal mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 md:grid-cols-4 md:gap-x-8 md:gap-y-5">
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
                  <span
                    className={`${item.color} inline-flex rounded-full p-3 text-white`}
                  >
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
        </div>
      </section>

      <section id="identidad" className="border-y-[6px] border-[#55d2dd] bg-[#ecfcfd]">
        <Container className="grid gap-8 px-4 py-12 md:grid-cols-3 md:items-center md:py-14">
          <div>
            <p className="font-ui text-label-ui text-[#123f78]">IDENTIDAD WARMI</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-[#1b1c1a] md:text-4xl">
              Nuestra fuerza nace de la comunidad.
            </h2>
          </div>
          <p className="text-body-lg text-[#4f4037]">
            Cada tecnica, historia y pieza pertenece a una artesana y a su territorio. La
            tecnologia ayuda a documentar y compartir ese legado con respeto.
          </p>
          <Link
            className="bg-[#55d2dd] px-6 py-4 text-center font-ui text-sm font-bold text-[#123f78] md:text-label-ui"
            href="/login"
          >
            Elegir mi camino
          </Link>
        </Container>
      </section>
    </main>
  );
}
