import Link from "next/link";
import { BookOpen, HandHeart, ShieldCheck, UsersRound } from "lucide-react";

import { Container } from "@/shared/components/layout/container";

const reasons = [
  {
    icon: BookOpen,
    title: "Aprender con acompanamiento",
    text: "Cursos, talleres y practicas para fortalecer autonomia digital paso a paso."
  },
  {
    icon: HandHeart,
    title: "Preservar la historia",
    text: "Un perfil cultural para documentar tecnicas, territorio, memoria y proposito."
  },
  {
    icon: ShieldCheck,
    title: "Crecer con seguridad",
    text: "La vitrina llega despues del aprendizaje, con identidad y confianza."
  }
];

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-[#fffaf8] text-[#123f78]">
      <section className="border-b-[6px] border-[#f0bf35] bg-[#f6efe8]">
        <Container className="grid gap-10 py-12 md:grid-cols-[0.85fr_1.15fr] md:items-center md:py-16">
          <div>
            <Link href="/" className="font-serif text-3xl font-bold text-[#7a3100]">
              Warmi Digital
            </Link>
            <p className="mt-10 font-ui text-label-ui text-[#b5245b]">UNETE A WARMI</p>
            <h1 className="mt-4 font-serif text-5xl font-bold leading-tight text-[#1b1c1a] md:text-6xl">
              Elige el camino con el que entras a la comunidad.
            </h1>
            <p className="mt-5 max-w-xl text-body-lg text-[#4f4037]">
              Warmi no empieza vendiendo. Empieza aprendiendo, compartiendo y reconociendo
              el valor cultural de cada artesana.
            </p>
          </div>

          <div className="grid gap-4">
            <Link
              href="/login?role=artesana"
              className="group border-l-[10px] border-[#e65578] bg-white p-7 shadow-[0_18px_50px_rgba(122,49,0,0.08)] transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <span className="rounded-full bg-[#ffd8c8] p-3 text-[#7a3100]">
                  <HandHeart className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-ui text-label-ui text-[#e65578]">Soy artesana</p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-[#1b1c1a]">
                    Quiero aprender y mostrar mi historia
                  </h2>
                  <p className="mt-3 text-body-md text-[#5b4a42]">
                    Accede a tu ruta, talleres, comunidad, historia cultural y vitrina
                    cuando tu proceso este listo.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/login?role=facilitadora"
              className="group border-l-[10px] border-[#55d2dd] bg-white p-7 shadow-[0_18px_50px_rgba(18,63,120,0.08)] transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <span className="rounded-full bg-[#d9fbff] p-3 text-[#123f78]">
                  <UsersRound className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-ui text-label-ui text-[#123f78]">Soy facilitadora</p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-[#1b1c1a]">
                    Quiero acompanar procesos formativos
                  </h2>
                  <p className="mt-3 text-body-md text-[#5b4a42]">
                    Organiza talleres, revisa avances y acompana a las artesanas sin
                    perder el enfoque comunitario.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      <Container className="grid gap-4 py-12 md:grid-cols-3">
        {reasons.map((reason) => {
          const Icon = reason.icon;

          return (
            <article key={reason.title} className="bg-white p-6">
              <Icon className="h-6 w-6 text-[#fc6b22]" />
              <h2 className="mt-5 font-serif text-2xl font-bold text-[#1b1c1a]">
                {reason.title}
              </h2>
              <p className="mt-3 text-body-md text-[#5b4a42]">{reason.text}</p>
            </article>
          );
        })}
      </Container>
    </main>
  );
}
