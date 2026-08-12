import Image from "next/image";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  Landmark,
  Mail,
  Megaphone,
  MessageCircle,
  PlayCircle,
  Smartphone,
  Store,
  Trophy
} from "lucide-react";

import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";
import { WarmiLogo } from "@/shared/components/brand/warmi-logo";

const formationCards = [
  {
    title: "Mi correo para el Estado",
    subtitle: "Crear Gmail y enviar adjuntos",
    description:
      "Aprende a crear tu correo, guardar tu contraseña y enviar archivos desde el celular.",
    icon: Mail,
    color: "bg-[#2f62a3]",
    lessons: [
      "Crear una cuenta Gmail",
      "Adjuntar documentos",
      "Usar el correo con seguridad"
    ]
  },
  {
    title: "Instituciones que acompañan",
    subtitle: "Tu crecimiento",
    description:
      "Conoce entidades, ferias, convocatorias y canales de orientación para artesanas.",
    icon: Building2,
    color: "bg-[#f17a2a]",
    lessons: ["MINCETUR", "DIRCETUR Cajamarca", "Municipalidad de San Miguel"]
  },
  {
    title: "Oportunidades para mi negocio",
    subtitle: "Ferias y concursos",
    description:
      "Prepárate para postular con documentos, fotos y una historia clara de tus productos.",
    icon: Trophy,
    color: "bg-[#f5b900]",
    lessons: ["RUC y cuenta bancaria", "RNA", "Fotos y descripción de productos"]
  },
  {
    title: "WhatsApp Business",
    subtitle: "Catálogo y pedidos",
    description:
      "Organiza catálogos, responde consultas y atiende pedidos con mayor confianza.",
    icon: MessageCircle,
    color: "bg-[#c02a68]",
    lessons: ["Catálogo", "Listas de difusión", "Gestión de pedidos"]
  }
];

const courseSpoilers = [
  {
    title: "¿Cómo crear una cuenta en Gmail?",
    duration: "4:34 minutos",
    description:
      "Primeros pasos para crear tu correo y usarlo en trámites, concursos y comunicaciones."
  },
  {
    title: "¿Cómo cargar y enviar documentos adjuntos?",
    duration: "1:27 minutos",
    description: "Aprende a enviar fotos, constancias, PDF y documentos desde tu celular."
  },
  {
    title: "¿Qué necesito antes de postular a un concurso?",
    duration: "Guía práctica",
    description:
      "Revisa RUC, RNA, cuenta bancaria, CCI, documentos PDF, fotos y descripción de productos."
  },
  {
    title: "¿Cómo configurar WhatsApp Business?",
    duration: "4:34 minutos",
    description:
      "Una vista previa sobre catálogos, listas, costos, pedidos y pagos con Yape o Plin."
  }
];

const officialLinks = [
  {
    title: "Somos Artesanía 2026",
    description: "Concurso público de MINCETUR para fortalecer talleres artesanales.",
    href: "https://www.gob.pe/institucion/mincetur/campa%C3%B1as/140677-somos-artesania-2026",
    icon: Trophy,
    color: "bg-[#ffe3ed] text-[#b5245b]"
  },
  {
    title: "Artesanías del Perú",
    description:
      "Plataforma con eventos comerciales, exposición y contacto de artesanas del país.",
    href: "https://www.artesaniasdelperu.gob.pe/",
    icon: Store,
    color: "bg-[#dff9fb] text-[#0b7f88]"
  },
  {
    title: "DIRCETUR Cajamarca",
    description: "Dirección regional vinculada a turismo, comercio exterior y artesanía.",
    href: "https://dircetur.regioncajamarca.gob.pe/",
    icon: Landmark,
    color: "bg-[#ffe8d5] text-[#9c430f]"
  },
  {
    title: "Municipalidad Provincial de San Miguel",
    description: "Información municipal y canales de atención para trámites locales.",
    href: "https://www.gob.pe/municipalidad-provincial-de-san-miguel-mpsm",
    icon: Building2,
    color: "bg-[#fff0bd] text-[#8b6500]"
  },
  {
    title: "Mesa de Partes San Miguel",
    description: "Canal municipal para presentar documentos y hacer seguimiento.",
    href: "https://www.muni-sanmiguel.gob.pe/tramites-virtuales/mesa-de-partes-virtual/79-tramites-virtuales",
    icon: FileText,
    color: "bg-[#e7f0ff] text-[#2f62a3]"
  }
];

const opportunities = [
  "Ferias artesanales",
  "Concursos",
  "Capacitaciones",
  "Registro Nacional del Artesano",
  "Promoción y articulación comercial",
  "Trámites municipales"
];

const palette = ["#2f62a3", "#b5245b", "#17c3cf", "#f15a24", "#ff8a3d", "#f5b900"];

export default function AprenderParaCrecerPage() {
  return (
    <main className="bg-white text-[#10124f]">
      <WarmiPublicHeader navOnly />

      <section className="mx-auto w-full max-w-[1860px] px-4 py-8 md:px-8 md:py-12 lg:px-12">
        <div className="warmi-scroll-reveal grid gap-8 border-t-2 border-[#d9d9d9] pt-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <div className="flex gap-2">
              {palette.map((color) => (
                <span
                  key={color}
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <h2 className="mt-8 font-serif text-4xl font-bold leading-tight text-[#b5245b] md:text-6xl">
              ¡Bienvenida, artesana!
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#123f78] md:text-2xl">
              Aprende a tu ritmo con videos cortos, guías prácticas y el acompañamiento de
              una facilitadora que te guiará en cada paso.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {formationCards.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="group border border-[#ead4ca] bg-white p-5 shadow-[0_16px_36px_rgba(18,63,120,0.07)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_26px_58px_rgba(18,63,120,0.12)]"
                  >
                    <span
                      className={`${item.color} inline-flex rounded-full p-3 text-white`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-4 font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
                      {item.subtitle}
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-bold text-[#1b1c1a]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#5b4a42]">
                      {item.description}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-[#123f78]">
                      {item.lessons.map((lesson) => (
                        <li key={lesson} className="flex gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#17c3cf]" />
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="group relative min-h-[380px] overflow-hidden shadow-[0_24px_58px_rgba(122,49,0,0.12)] md:min-h-[620px]">
            <Image
              src="/images/learning/aprender-hero.png"
              alt="Artesana aprendiendo herramientas digitales"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#30130d]/80 to-transparent p-6 text-white md:p-8">
              <p className="font-ui text-sm font-bold uppercase tracking-[0.08em]">
                Vista previa de cursos
              </p>
              <p className="mt-2 max-w-xl text-base leading-7 md:text-xl">
                Estos contenidos son un adelanto de lo que encontrarás dentro de tu ruta
                de aprendizaje.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf8]">
        <div className="mx-auto grid w-full max-w-[1860px] gap-10 px-4 py-12 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
          <div className="warmi-scroll-reveal">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-10 w-10 text-[#b5245b]" />
              <h2 className="font-ui text-3xl font-extrabold uppercase text-[#b5245b] md:text-5xl">
                Formación
              </h2>
            </div>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5b4a42]">
              En los cursos aprenderás paso a paso. Aquí solo verás un adelanto:
              herramientas digitales, documentos básicos, ferias, concursos y atención por
              WhatsApp Business.
            </p>

            <div className="mt-8 overflow-hidden shadow-[0_20px_50px_rgba(18,63,120,0.12)]">
              <Image
                src="/images/learning/cursos-spoiler.png"
                alt="Artesana revisando documentos y herramientas digitales"
                width={1600}
                height={900}
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="grid gap-5">
            {courseSpoilers.map((preview, index) => (
              <article
                key={preview.title}
                className="warmi-scroll-reveal grid gap-4 border border-[#ead4ca] bg-white p-5 shadow-[0_14px_34px_rgba(122,49,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(122,49,0,0.11)] md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <span
                  className={`grid h-14 w-14 place-items-center rounded-full text-white ${
                    index === 0
                      ? "bg-[#2f62a3]"
                      : index === 1
                        ? "bg-[#f17a2a]"
                        : index === 2
                          ? "bg-[#c02a68]"
                          : "bg-[#14715d]"
                  }`}
                >
                  <PlayCircle className="h-7 w-7" />
                </span>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#1b1c1a]">
                    {preview.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#5b4a42]">
                    {preview.description}
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-[#123f78] px-4 py-2 font-ui text-sm font-bold text-white">
                  {preview.duration}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1860px] px-4 py-12 md:px-8 lg:px-12">
        <div className="warmi-scroll-reveal grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <h2 className="font-serif text-4xl font-bold leading-tight text-[#123f78] md:text-6xl">
              Instituciones que acompañan a las artesanas y enlaces útiles para tu
              formación.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#5b4a42]">
              Estos accesos te ayudan a encontrar convocatorias, ferias, capacitaciones y
              canales oficiales relacionados con artesanía y trámites locales.
            </p>
            <div className="mt-8 overflow-hidden shadow-[0_20px_50px_rgba(18,63,120,0.12)]">
              <Image
                src="/images/learning/instituciones.png"
                alt="Artesanas recibiendo acompañamiento digital"
                width={1600}
                height={900}
                className="h-auto w-full"
              />
            </div>
          </div>

          <div>
            <h3 className="font-ui text-2xl font-extrabold uppercase text-[#b5245b] md:text-4xl">
              Enlaces oficiales
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {officialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group border border-[#ead4ca] bg-white p-5 shadow-[0_14px_34px_rgba(122,49,0,0.06)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_54px_rgba(122,49,0,0.12)]"
                  >
                    <span
                      className={`${item.color} inline-flex rounded-full p-3 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h4 className="mt-4 font-serif text-2xl font-bold text-[#1b1c1a]">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-[#5b4a42]">
                      {item.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 font-ui text-sm font-bold text-[#b5245b]">
                      Abrir enlace <ExternalLink className="h-4 w-4" />
                    </span>
                  </a>
                );
              })}
            </div>

            <div className="mt-8 border border-[#ead4ca] bg-[#fff4ec] p-6">
              <h4 className="font-serif text-3xl font-bold text-[#7a3100]">
                ¿Qué encontrarás aquí?
              </h4>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {opportunities.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 bg-white px-4 py-3 font-ui text-sm font-bold text-[#123f78]"
                  >
                    <Megaphone className="h-5 w-5 text-[#f17a2a]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#ead4ca] bg-[#f7e6d8]">
        <div className="mx-auto grid w-full max-w-[1860px] gap-6 px-4 py-8 md:grid-cols-[auto_1fr_1fr_auto] md:items-center md:px-8 lg:px-12">
          <WarmiLogo compact markClassName="w-32" />
          <div>
            <p className="font-serif text-3xl font-bold text-[#b5245b]">
              ¿Necesitas ayuda?
            </p>
            <p className="mt-1 font-ui font-bold text-[#123f78]">
              Estamos para apoyarte.
            </p>
          </div>
          <div className="grid gap-2 font-ui text-[#123f78]">
            <p className="flex items-center gap-2 font-bold">
              <Mail className="h-5 w-5 text-[#b5245b]" />
              warmidigital@gmail.com
            </p>
            <p className="flex items-center gap-2 font-bold">
              <MessageCircle className="h-5 w-5 text-[#14715d]" />
              +51 999 666 333
            </p>
          </div>
          <a
            href="https://wa.me/51999666333"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-touch-target items-center justify-center gap-2 bg-[#14715d] px-5 py-3 font-ui text-sm font-extrabold uppercase text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#0f5c4b]"
          >
            <Smartphone className="h-5 w-5" />
            Canal de WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
