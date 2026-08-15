import Link from "next/link";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  UserRound,
  UsersRound
} from "lucide-react";

import { requireRole } from "@/shared/server/auth/helpers";
import { ArtisanMonitoringService } from "@/shared/services/facilitator.service";

const timeline = [
  {
    date: "24 MAY 2024",
    type: "Visita presencial",
    observations:
      "Elena muestra interés por mejorar sus acabados y probar nuevos diseños.",
    recommendations:
      "Seguir practicando combinaciones de colores y participar en más ferias locales.",
    nextAction: "Visitar su taller en 3 semanas y revisar nuevos diseños."
  },
  {
    date: "08 MAY 2024",
    type: "Mensaje",
    observations: "Se coordinó el envío de materiales del curso de diseño y color.",
    recommendations: "Revisar la unidad 2 del curso y practicar con la paleta sugerida.",
    nextAction: "Hacer seguimiento del avance en la próxima semana."
  },
  {
    date: "25 ABR 2024",
    type: "Llamada",
    observations: "Se resolvieron dudas sobre tipos de lana y combinaciones de tonos.",
    recommendations: "Explorar nuevas texturas y documentar sus pruebas.",
    nextAction: "Invitarla al taller de fotografía para artesanas."
  }
];

const summaryCards: {
  title: string;
  value: string;
  detail: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Progreso de aprendizaje",
    value: "72%",
    detail: "Avance general",
    Icon: BookOpen
  },
  {
    title: "Curso actual",
    value: "Diseño y color",
    detail: "En progreso",
    Icon: BookOpen
  },
  {
    title: "Último taller",
    value: "Fotografía",
    detail: "Asistencia: 100%",
    Icon: CalendarDays
  }
];

export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const artisans = await new ArtisanMonitoringService().list(session.user.id);

  if (artisans[0]) {
    redirect(`/facilitadora/artesanas/${artisans[0].id}`);
  }

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-ui text-sm font-semibold text-[#624331]">
              Seguimiento <span className="mx-2 text-[#c69b76]">›</span> Elena Mamani
            </p>
            <h1 className="font-display mt-5 text-4xl leading-tight text-[#171412] lg:text-5xl">
              Detalle y seguimiento de artesana
            </h1>
            <p className="mt-2 font-ui text-lg text-[#6b5a4e]">
              Acompaña su desarrollo, identifica avances y brinda el apoyo que necesita.
            </p>
          </div>
          <Link
            href="/facilitadora/artesanas"
            className="inline-flex items-center gap-2 self-start rounded-[8px] border border-[#d89b06] px-5 py-3 font-ui font-bold text-[#b26f00] transition hover:bg-[#fff2cf] lg:self-center"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al listado
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] space-y-8 px-6 py-10 lg:px-10">
        <section className="grid gap-6 rounded-[10px] border border-[#eed8bf] bg-white p-8 shadow-[0_20px_50px_rgba(122,73,20,0.07)] xl:grid-cols-[1.3fr_repeat(3,260px)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="font-display grid h-44 w-44 place-items-center rounded-full bg-[#f7dfac] text-7xl text-[#8a1747]">
              E
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-4xl">Elena Mamani</h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  Activa
                </span>
              </div>
              <div className="mt-5 space-y-3 text-[#5f4a3a]">
                <p className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Comunidad: San Miguel, Cajamarca
                </p>
                <p className="flex items-center gap-2">
                  <UserRound className="h-5 w-5" /> Especialidad: Tejidos y bordados
                </p>
                <p className="flex items-center gap-2">
                  <UsersRound className="h-5 w-5" /> Artesana desde: 2018
                </p>
              </div>
            </div>
          </div>
          {summaryCards.map(({ title, value, detail, Icon }) => (
            <div key={title} className="rounded-[10px] border border-[#eed8bf] p-6">
              <p className="font-ui text-sm text-[#6b5a4e]">{title}</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
                  <Icon className="h-6 w-6" />
                </span>
                <p className="font-display text-3xl">{value}</p>
              </div>
              <p className="mt-5 text-sm font-bold text-emerald-700">{detail}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <article className="rounded-[10px] border border-[#eed8bf] bg-white p-8 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-3xl">Seguimiento y acompañamiento</h2>
            <p className="mt-2 text-[#6b5a4e]">
              Registra tus visitas, conversaciones y acuerdos para acompañar su
              desarrollo.
            </p>
            <div className="mt-8 space-y-5 border-l-2 border-[#d89b06] pl-8">
              {timeline.map((item) => (
                <div
                  key={item.date}
                  className="relative rounded-[10px] border border-[#eed8bf] bg-[#fffdfb] p-6"
                >
                  <span className="absolute -left-[42px] top-7 h-4 w-4 rounded-full border-4 border-white bg-[#d89b06]" />
                  <div className="grid gap-5 lg:grid-cols-[100px_1fr_1fr_1fr]">
                    <p className="font-display text-2xl leading-tight">{item.date}</p>
                    <p className="text-sm">
                      <span className="rounded-full bg-[#fff2cf] px-3 py-1 text-xs font-bold text-[#9a6800]">
                        {item.type}
                      </span>
                      <br />
                      <span className="mt-3 block">{item.observations}</span>
                    </p>
                    <p className="text-sm">{item.recommendations}</p>
                    <p className="text-sm">{item.nextAction}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
              <h3 className="font-display text-2xl">Acciones rápidas</h3>
              <div className="mt-5 grid gap-3">
                <Link
                  href="/facilitadora/mensajes"
                  className="rounded-[8px] bg-[#d89b06] px-5 py-3 text-center font-ui font-bold text-white"
                >
                  Enviar mensaje
                </Link>
                <Link
                  href="/facilitadora/artesanas"
                  className="rounded-[8px] border border-[#ead4ca] px-5 py-3 text-center font-ui font-bold text-[#624331]"
                >
                  Ver listado
                </Link>
              </div>
            </article>
            <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
              <h3 className="font-display text-2xl">Información de contacto</h3>
              <div className="mt-5 space-y-4 text-[#5f4a3a]">
                <p className="flex items-center gap-3">
                  <Phone className="h-5 w-5" /> +51 987 654 321
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="h-5 w-5" /> elena.mamani@gmail.com
                </p>
                <p className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5" /> WhatsApp disponible
                </p>
              </div>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}
