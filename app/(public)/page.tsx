import Link from "next/link";
import { ArrowRight, BookOpen, HandHeart, MessagesSquare, Sparkles } from "lucide-react";

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

export default function LandingPage() {
  return (
    <main className="bg-white text-[#123f78]">
      <section
        className="relative min-h-[430px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(245,247,246,.72),rgba(245,247,246,.72)),url(${hero})`
        }}
      >
        <Container className="flex min-h-[360px] items-center justify-center px-4 text-center md:min-h-[430px]">
          <div className="flex max-w-4xl flex-col items-center">
            <WarmiLogo
              className="flex-col gap-2"
              markClassName="h-24 w-52 md:h-36 md:w-72"
              textClassName="hidden"
            />
            <h1 className="mt-5 font-serif text-4xl font-bold leading-tight tracking-[0.06em] text-[#123f78] sm:text-5xl md:text-7xl md:tracking-[0.12em]">
              WARMI DIGITAL
            </h1>
            <p className="mt-4 max-w-sm text-lg italic text-[#c22b61] md:max-w-none md:text-2xl">
              Artesanas conectadas, historias que transforman.
            </p>
          </div>
        </Container>
      </section>

      <nav className="grid grid-cols-2 font-ui text-sm font-bold text-white md:grid-cols-4 md:text-label-ui">
        {actions.map((action) => (
          <Link
            key={action.label}
            className={`${action.color} flex min-h-16 items-center justify-center px-3 py-5 text-center leading-tight transition-opacity hover:opacity-90 md:min-h-20 md:px-5 md:py-7`}
            href={action.href}
          >
            {action.label}
          </Link>
        ))}
      </nav>

      <section id="programa" className="bg-white">
        <Container className="grid gap-8 px-4 py-12 md:grid-cols-[0.95fr_1.05fr] md:items-center md:py-14">
          <div>
            <div className="flex gap-3">
              {["#5576a7", "#b5245b", "#55d2dd", "#fc6b22", "#ff8941", "#f0bf35"].map(
                (color) => (
                  <span
                    key={color}
                    className="h-5 w-5 rounded-full md:h-7 md:w-7"
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
            <h2 className="mt-6 border-t-4 border-[#123f78] pt-6 font-serif text-3xl font-bold uppercase leading-tight text-[#1b1c1a] md:mt-8 md:pt-8 md:text-5xl">
              Sllapan wawqaykunaman allin hamuy
            </h2>
            <p className="mt-5 max-w-xl text-body-lg text-[#4f4037]">
              Bienvenidas a un espacio donde la tecnologia acompana la memoria, el
              aprendizaje y la autonomia economica de las artesanas.
            </p>
            <p className="mt-7 inline-block bg-[#d497b1] px-5 py-4 text-center font-ui text-sm font-bold text-white md:text-label-ui">
              BIENVENIDAS A WARMI
            </p>
          </div>

          <div className="grid gap-4">
            <article className="border-l-[8px] border-[#ea9b62] bg-[#fff6ef] p-5 md:border-l-[10px] md:p-6">
              <h3 className="font-serif text-2xl font-bold text-[#1b1c1a] md:text-3xl">
                La venta es una consecuencia, no el centro.
              </h3>
              <p className="mt-3 text-body-md text-[#5b4a42]">
                Warmi acompana primero el proceso: aprender, practicar, narrar la
                historia, fortalecer la comunidad y luego compartir las piezas con nuevos
                mercados.
              </p>
            </article>
            <article className="border-l-[8px] border-[#55d2dd] bg-[#edfcfd] p-5 md:border-l-[10px] md:p-6">
              <h3 className="font-serif text-2xl font-bold text-[#1b1c1a] md:text-3xl">
                Cada perfil cultural protege un saber.
              </h3>
              <p className="mt-3 text-body-md text-[#5b4a42]">
                La artesana registra su comunidad, tecnica, relato e inspiracion para que
                cada producto tenga contexto y dignidad.
              </p>
            </article>
          </div>
        </Container>
      </section>

      <section id="descubre" className="bg-[#f7f3ef]">
        <Container className="px-4 py-14 md:py-16">
          <div className="relative border-t-4 border-[#5576a7] pt-7">
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

          <div className="mt-8 grid grid-cols-2 overflow-hidden bg-white shadow-[0_18px_50px_rgba(122,49,0,0.08)] md:grid-cols-4">
            {discovery.map((item) => (
              <div
                key={item.title}
                className="min-h-[135px] bg-cover bg-center sm:min-h-[180px] md:min-h-[210px]"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(27,28,26,0.16), rgba(255,255,255,0.03)), url(${item.image})`
                }}
              />
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 md:grid-cols-4 md:gap-x-8 md:gap-y-5">
            {discovery.map((item, index) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`group bg-white p-4 shadow-[0_18px_50px_rgba(122,49,0,0.08)] transition-transform hover:-translate-y-1 md:p-5 ${
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
        </Container>
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
