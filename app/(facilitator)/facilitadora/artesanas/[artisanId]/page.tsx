import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Phone,
  UserRound,
  UsersRound
} from "lucide-react";

import { requireRole } from "@/shared/server/auth/helpers";
import { ArtisanMonitoringService } from "@/shared/services/facilitator.service";

const tabs = ["Resumen", "Aprendizaje", "Talleres", "Mi historia", "Seguimiento"];
const fallbackTimeline = [
  {
    date: "24 MAY 2024",
    type: "Visita presencial",
    observations:
      "La artesana mostró interés por mejorar sus acabados y probar nuevos diseños.",
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
    observations: "Resolvió dudas sobre tipos de lana y combinaciones de tonos.",
    recommendations:
      "Explorar nuevas texturas de lana de alpaca y documentar sus pruebas.",
    nextAction: "Invitarla al taller de fotografía para artesanas."
  }
];

export default async function Page({
  params
}: {
  params: Promise<{ artisanId: string }>;
}) {
  const session = await requireRole("FACILITADORA");
  const { artisanId } = await params;
  const assignment = await new ArtisanMonitoringService().detail(
    session.user.id,
    artisanId
  );

  if (!assignment) notFound();

  const artisan = assignment.artisan;
  const displayName =
    artisan.profile?.displayName ?? artisan.name ?? artisan.email ?? "Elena Mamani";
  const community = artisan.profile?.community?.name ?? "San Miguel, Cajamarca";
  const phone = artisan.profile?.phone ?? "+51 987 654 321";
  const progress = Math.round(
    artisan.enrollments.length
      ? artisan.enrollments.reduce(
          (sum, item) => sum + (item.courseProgress?.percentage ?? 0),
          0
        ) / artisan.enrollments.length
      : 72
  );
  const currentCourse =
    artisan.enrollments.find((item) => item.status === "ACTIVE")?.course.title ??
    "Diseño y color en tejidos tradicionales";
  const followUps =
    assignment.followUps.length > 0
      ? assignment.followUps.slice(0, 4).map((item) => ({
          date: item.occurredAt.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          }),
          type: item.type.replaceAll("_", " "),
          observations: item.observation,
          recommendations: "Mantener acompañamiento cercano.",
          nextAction: "Revisar avance en la próxima sesión."
        }))
      : fallbackTimeline;

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-ui text-sm font-semibold text-[#624331]">
              Seguimiento <span className="mx-2 text-[#c69b76]">›</span> {displayName}
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
              {displayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-4xl">{displayName}</h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  Activa
                </span>
              </div>
              <div className="mt-5 space-y-3 text-[#5f4a3a]">
                <p className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Comunidad: {community}
                </p>
                <p className="flex items-center gap-2">
                  <UserRound className="h-5 w-5" /> Especialidad: Tejidos y bordados
                </p>
                <p className="flex items-center gap-2">
                  <UsersRound className="h-5 w-5" /> Artesana desde: 2018
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Tejidos en telar", "Bordado tradicional"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-[#fff2cf] px-4 py-2 text-sm font-bold text-[#8a5d00]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[10px] border border-[#eed8bf] p-6 text-center">
            <p className="font-ui text-sm text-[#6b5a4e]">Progreso de aprendizaje</p>
            <div className="font-display mx-auto mt-5 grid h-28 w-28 place-items-center rounded-full border-[10px] border-[#d89b06] bg-[#fffaf6] text-3xl">
              {progress}%
            </div>
            <p className="mt-4 text-sm text-[#6b5a4e]">Avance general</p>
            <p className="text-sm font-bold text-emerald-700">+10% desde el mes pasado</p>
          </div>

          <div className="rounded-[10px] border border-[#eed8bf] p-6">
            <p className="font-ui text-sm text-[#6b5a4e]">Curso actual</p>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
                <BookOpen className="h-6 w-6" />
              </span>
              <p className="font-ui font-bold">{currentCourse}</p>
            </div>
            <p className="mt-5 text-sm text-[#6b5a4e]">En progreso</p>
            <p className="text-sm font-bold text-emerald-700">
              {Math.max(progress, 60)}% completado
            </p>
          </div>

          <div className="rounded-[10px] border border-[#eed8bf] p-6">
            <p className="font-ui text-sm text-[#6b5a4e]">Último taller</p>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
                <CalendarDays className="h-6 w-6" />
              </span>
              <p className="font-ui font-bold">Fotografía para artesanas</p>
            </div>
            <p className="mt-5 text-sm text-[#6b5a4e]">Asistió el 24 de mayo</p>
            <p className="text-sm font-bold text-emerald-700">Asistencia: 100%</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <article className="rounded-[10px] border border-[#eed8bf] bg-white shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <nav className="grid grid-cols-5 border-b border-[#eed8bf] text-center font-ui text-sm font-bold text-[#6b5a4e]">
              {tabs.map((tab) => (
                <span
                  key={tab}
                  className={
                    tab === "Seguimiento"
                      ? "border-b-2 border-[#d89b06] px-4 py-5 text-[#d89b06]"
                      : "px-4 py-5"
                  }
                >
                  {tab}
                </span>
              ))}
            </nav>
            <div className="p-8">
              <h2 className="font-display text-3xl">Seguimiento y acompañamiento</h2>
              <p className="mt-2 text-[#6b5a4e]">
                Registra tus visitas, conversaciones y acuerdos para acompañar su
                desarrollo.
              </p>

              <div className="mt-8 space-y-5 border-l-2 border-[#d89b06] pl-8">
                {followUps.map((item) => (
                  <div
                    key={`${item.date}-${item.type}`}
                    className="relative rounded-[10px] border border-[#eed8bf] bg-[#fffdfb] p-6"
                  >
                    <span className="absolute -left-[42px] top-7 h-4 w-4 rounded-full border-4 border-white bg-[#d89b06]" />
                    <div className="grid gap-5 lg:grid-cols-[100px_1fr_1fr_1fr_auto]">
                      <p className="font-display text-2xl leading-tight">{item.date}</p>
                      <div>
                        <span className="rounded-full bg-[#fff2cf] px-3 py-1 text-xs font-bold text-[#9a6800]">
                          {item.type}
                        </span>
                        <p className="mt-3 text-sm">
                          <span className="font-bold">Observaciones</span>
                          <br />
                          {item.observations}
                        </p>
                      </div>
                      <p className="text-sm">
                        <span className="font-bold">Recomendaciones</span>
                        <br />
                        {item.recommendations}
                      </p>
                      <p className="text-sm">
                        <span className="font-bold">Próxima acción</span>
                        <br />
                        {item.nextAction}
                      </p>
                      <MoreHorizontal className="h-5 w-5 text-[#7a5b4a]" />
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={`/facilitadora/artesanas/${artisanId}/seguimiento`}
                className="mx-auto mt-8 flex w-fit rounded-[8px] border border-[#d89b06] px-8 py-3 font-ui font-bold text-[#b26f00] transition hover:bg-[#fff2cf]"
              >
                Cargar más seguimiento
              </Link>
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
              <h3 className="font-display text-2xl">Alertas de seguimiento</h3>
              <div className="mt-5 space-y-4">
                {[
                  [
                    "Puede requerir acompañamiento",
                    "Su progreso es menor al promedio del grupo."
                  ],
                  [
                    "Sin actividad reciente",
                    "No registra actividad en los últimos 14 días."
                  ],
                  ["Participación en talleres", "No ha participado en talleres este mes."]
                ].map(([title, description]) => (
                  <div key={title} className="rounded-[8px] bg-[#fff8ed] p-4">
                    <p className="font-ui font-bold">{title}</p>
                    <p className="mt-1 text-sm text-[#6b5a4e]">{description}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/facilitadora/reportes"
                className="mt-5 inline-flex items-center gap-2 font-ui font-bold text-[#8a1747]"
              >
                Ver todas las alertas
              </Link>
            </article>

            <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
              <h3 className="font-display text-2xl">Acciones rápidas</h3>
              <div className="mt-5 grid gap-3">
                <Link
                  href={`/facilitadora/artesanas/${artisanId}/seguimiento`}
                  className="rounded-[8px] bg-[#d89b06] px-5 py-3 text-center font-ui font-bold text-white"
                >
                  Registrar seguimiento
                </Link>
                <Link
                  href="/facilitadora/mensajes"
                  className="rounded-[8px] border border-[#ead4ca] px-5 py-3 text-center font-ui font-bold text-[#624331]"
                >
                  Enviar mensaje
                </Link>
              </div>
            </article>

            <article className="rounded-[10px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
              <h3 className="font-display text-2xl">Información de contacto</h3>
              <div className="mt-5 space-y-4 text-[#5f4a3a]">
                <p className="flex items-center gap-3">
                  <Phone className="h-5 w-5" /> {phone}
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="h-5 w-5" /> {artisan.email}
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
