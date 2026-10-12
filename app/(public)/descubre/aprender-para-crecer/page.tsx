import Image from "next/image";
import {
  GraduationCap,
  Mail,
  MessageCircle,
  Smartphone,
  Store,
  Trophy
} from "lucide-react";

import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";
import { WarmiLogo } from "@/shared/components/brand/warmi-logo";

const programModules = [
  {
    title: "Mi celular como herramienta de acceso al Estado",
    description:
      "Usa tu celular para crear documentos, conocer instituciones y acceder a capacitaciones.",
    icon: Mail,
    color: "bg-[#2f62a3]",
    sections: [
      "Crear cuenta Gmail y enviar correos con adjuntos",
      "Instituciones que acompañan a las artesanas y enlaces útiles para tu formación",
      "Requisitos generales previos",
      "Acceder a capacitaciones virtuales"
    ]
  },
  {
    title: "Oportunidades para mi negocio",
    description:
      "Reconoce oportunidades y prepara con calma una postulación para tu emprendimiento.",
    icon: Trophy,
    color: "bg-[#f17a2a]",
    sections: [
      "Conociendo las oportunidades",
      "Aprendiendo a postular: requisitos y documentos",
      "Preparando los documentos y llenando formularios",
      "Simulación de postulación"
    ]
  },
  {
    title: "Herramientas digitales para vender",
    description:
      "Comparte tu trabajo, elige dónde vender, cobra con seguridad y entrega tus pedidos.",
    icon: Store,
    color: "bg-[#c02a68]",
    sections: [
      "Publica tu arte en redes",
      "Conociendo tiendas virtuales que venden",
      "Aprende a cobrar desde el celular",
      "Simulación de primera venta en línea"
    ]
  },
  {
    title: "Estrategias de venta y autonomía digital",
    description:
      "Cuenta la historia de tu artesanía y practica una venta completa con autonomía.",
    icon: GraduationCap,
    color: "bg-[#14715d]",
    sections: [
      "Mi producto, mi historia, mi cultura",
      "Cómo presentar mi producto",
      "El valor de la artesanía",
      "Simulación de venta sin ayuda"
    ]
  }
] as const;

const palette = ["#2f62a3", "#b5245b", "#17c3cf", "#f15a24", "#ff8a3d", "#f5b900"];

export default function AprenderParaCrecerPage() {
  return (
    <main className="bg-white text-[#10124f]">
      <WarmiPublicHeader navOnly />

      <section className="mx-auto w-full max-w-[1860px] px-4 py-8 md:px-8 md:py-12 lg:px-12">
        <div className="warmi-scroll-reveal grid gap-8 border-t-2 border-[#d9d9d9] pt-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
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

            <h1 className="mt-8 font-serif text-4xl font-bold leading-tight text-[#b5245b] md:text-6xl">
              ¡Bienvenida, artesana!
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#123f78] md:text-2xl">
              Aprende a tu ritmo con videos cortos, guías prácticas y el acompañamiento de
              una facilitadora que te guiará en cada paso.
            </p>

            <div className="mt-8 rounded-2xl border border-[#ead4ca] bg-[#fffaf8] p-5 md:p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#b5245b] text-white">
                  <GraduationCap className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
                    Aprender para crecer
                  </p>
                  <h2 className="mt-1 font-serif text-3xl font-bold text-[#1b1c1a]">
                    Módulos y secciones
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#5b4a42]">
                    El programa se organiza en cuatro módulos. Cada uno tiene cuatro
                    secciones para avanzar paso a paso.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {programModules.map((module, moduleIndex) => {
                  const Icon = module.icon;

                  return (
                    <article
                      key={module.title}
                      className="overflow-hidden rounded-xl border border-[#ead4ca] bg-white shadow-[0_14px_34px_rgba(122,49,0,0.06)]"
                    >
                      <header className={`${module.color} p-4 text-white`}>
                        <div className="flex items-start gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="font-ui text-xs font-extrabold uppercase tracking-[0.08em]">
                              Módulo {moduleIndex + 1}
                            </p>
                            <h3 className="mt-1 font-serif text-xl font-bold leading-tight md:text-2xl">
                              {module.title}
                            </h3>
                          </div>
                        </div>
                      </header>
                      <div className="p-4">
                        <p className="text-sm leading-6 text-[#5b4a42]">
                          {module.description}
                        </p>
                        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                          {module.sections.map((section, sectionIndex) => (
                            <li
                              key={section}
                              className="flex gap-3 rounded-lg bg-[#fffaf8] p-3 text-sm leading-5 text-[#123f78]"
                            >
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#e7f0ff] font-ui text-xs font-extrabold text-[#2f62a3]">
                                {sectionIndex + 1}
                              </span>
                              <span>
                                <strong className="block font-ui text-xs uppercase tracking-[0.06em] text-[#b5245b]">
                                  Sección {sectionIndex + 1}
                                </strong>
                                {section}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="group relative min-h-[320px] overflow-hidden shadow-[0_24px_58px_rgba(122,49,0,0.12)] md:min-h-[520px] lg:sticky lg:top-6">
            <Image
              src="/images/learning/aprender-hero.png"
              alt="Artesana aprendiendo herramientas digitales"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#30130d]/80 to-transparent p-6 text-white md:p-8">
              <p className="font-ui text-sm font-bold uppercase tracking-[0.08em]">
                Ruta de aprendizaje
              </p>
              <p className="mt-2 max-w-xl text-base leading-7 md:text-xl">
                Revisa cada módulo en orden y avanza por sus secciones desde Mi
                aprendizaje.
              </p>
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
