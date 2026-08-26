import Link from "next/link";
import { notFound } from "next/navigation";
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

const statusLabels = {
  AL_DIA: "Al dia",
  DESTACADA: "Destacada",
  NECESITA_APOYO: "Necesita apoyo",
  INACTIVA: "Inactiva"
} as const;

const statusClasses = {
  AL_DIA: "bg-emerald-100 text-emerald-700",
  DESTACADA: "bg-[#fff2cf] text-[#9a6800]",
  NECESITA_APOYO: "bg-[#ffe8f0] text-[#9d0f4f]",
  INACTIVA: "bg-stone-200 text-stone-700"
} as const;

const tabs = ["Resumen", "Aprendizaje", "Talleres", "Mi historia", "Seguimiento"];

function formatDate(date: Date | null) {
  if (!date) return "Sin registro";
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function fullDate(date: Date | null | undefined) {
  if (!date) return "Sin fecha";
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-[#e8c9b5] bg-[#fffaf6] p-6 text-sm text-[#6b5a4e]">
      {message}
    </div>
  );
}

export default async function Page({
  params
}: {
  params: Promise<{ artisanId: string }>;
}) {
  const session = await requireRole("FACILITADORA");
  const { artisanId } = await params;
  const detail = await new ArtisanMonitoringService().detailSummary(
    session.user.id,
    artisanId
  );

  if (!detail) notFound();

  const { assignment, summary } = detail;
  const joinedAt = assignment.assignedAt.getFullYear();
  const latestFollowUps = summary.followUps.slice(0, 5);
  const alerts = [
    summary.status === "INACTIVA"
      ? "No registra actividad reciente en sus lecciones."
      : null,
    summary.progress < 25
      ? "Su progreso de aprendizaje esta en etapa inicial."
      : null,
    summary.registeredWorkshops > 0 && summary.attendanceRate < 50
      ? "Su asistencia a talleres esta por debajo del promedio."
      : null
  ].filter((item): item is string => Boolean(item));

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-ui text-sm font-semibold text-[#624331]">
              Seguimiento <span className="mx-2 text-[#c69b76]">/</span>{" "}
              {summary.name}
            </p>
            <h1 className="font-display mt-5 text-4xl leading-tight text-[#0f1f3d] lg:text-5xl">
              Detalle y seguimiento de artesana
            </h1>
            <p className="mt-2 font-ui text-lg text-[#6b5a4e]">
              Acompana su desarrollo, identifica avances y registra acuerdos de apoyo.
            </p>
          </div>
          <Link
            href="/facilitadora/seguimiento"
            className="inline-flex items-center gap-2 self-start rounded-[8px] border border-[#d89b06] px-5 py-3 font-ui font-bold text-[#b26f00] transition hover:bg-[#fff2cf] lg:self-center"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a seguimiento
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1560px] space-y-8 px-6 py-10 lg:px-10">
        <section className="grid gap-6 rounded-[14px] border border-[#eed8bf] bg-white p-8 shadow-[0_20px_50px_rgba(122,73,20,0.07)] xl:grid-cols-[1.3fr_repeat(3,260px)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="font-display grid h-44 w-44 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f7dfac] text-7xl text-[#8a1747]">
              {summary.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={summary.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                summary.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-4xl">{summary.name}</h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses[summary.status]}`}
                >
                  {statusLabels[summary.status]}
                </span>
              </div>
              <div className="mt-5 space-y-3 text-[#5f4a3a]">
                <p className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Comunidad: {summary.community}
                </p>
                <p className="flex items-center gap-2">
                  <UserRound className="h-5 w-5" /> Especialidad:{" "}
                  {summary.craftTypes.join(", ") || "Sin especialidad registrada"}
                </p>
                <p className="flex items-center gap-2">
                  <UsersRound className="h-5 w-5" /> Acompanada desde: {joinedAt}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {summary.craftTypes.slice(0, 4).map((chip) => (
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

          <div className="rounded-[12px] border border-[#eed8bf] p-6 text-center">
            <p className="font-ui text-sm text-[#6b5a4e]">Progreso de aprendizaje</p>
            <div className="font-display mx-auto mt-5 grid h-28 w-28 place-items-center rounded-full border-[10px] border-[#d89b06] bg-[#fffaf6] text-3xl">
              {summary.progress}%
            </div>
            <p className="mt-4 text-sm text-[#6b5a4e]">
              {summary.completedLessons} de {summary.totalLessons} lecciones
            </p>
          </div>

          <div className="rounded-[12px] border border-[#eed8bf] p-6">
            <p className="font-ui text-sm text-[#6b5a4e]">Curso actual</p>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
                <BookOpen className="h-6 w-6" />
              </span>
              <p className="font-ui font-bold">{summary.currentCourse}</p>
            </div>
            <p className="mt-5 text-sm text-[#6b5a4e]">
              {summary.completedCourses} de {summary.totalCourses} cursos completados
            </p>
          </div>

          <div className="rounded-[12px] border border-[#eed8bf] p-6">
            <p className="font-ui text-sm text-[#6b5a4e]">Ultimo taller</p>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
                <CalendarDays className="h-6 w-6" />
              </span>
              <p className="font-ui font-bold">
                {summary.latestWorkshop?.title ?? "Sin taller registrado"}
              </p>
            </div>
            <p className="mt-5 text-sm text-[#6b5a4e]">
              {fullDate(summary.latestWorkshop?.startsAt)}
            </p>
            <p className="text-sm font-bold text-emerald-700">
              Asistencia: {summary.attendanceRate}%
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <article className="rounded-[14px] border border-[#eed8bf] bg-white shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <nav className="grid grid-cols-2 border-b border-[#eed8bf] text-center font-ui text-sm font-bold text-[#6b5a4e] md:grid-cols-5">
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
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl text-[#8a1747]">
                    Seguimiento y acompanamiento
                  </h2>
                  <p className="mt-2 text-[#6b5a4e]">
                    Visitas, conversaciones y acuerdos registrados para esta artesana.
                  </p>
                </div>
                <Link
                  href={`/facilitadora/artesanas/${artisanId}/seguimiento`}
                  className="rounded-[8px] bg-[#d79a00] px-5 py-3 font-ui font-bold text-white"
                >
                  Registrar seguimiento
                </Link>
              </div>

              <div className="mt-8 space-y-5 border-l-2 border-[#d89b06] pl-8">
                {latestFollowUps.length ? (
                  latestFollowUps.map((item) => (
                    <div
                      key={item.id}
                      className="relative rounded-[12px] border border-[#eed8bf] bg-[#fffdfb] p-6"
                    >
                      <span className="absolute -left-[42px] top-7 h-4 w-4 rounded-full border-4 border-white bg-[#d89b06]" />
                      <div className="grid gap-5 lg:grid-cols-[120px_1fr_1fr_1fr]">
                        <p className="font-display text-2xl leading-tight">
                          {formatDate(item.occurredAt)}
                        </p>
                        <div>
                          <span className="rounded-full bg-[#fff2cf] px-3 py-1 text-xs font-bold text-[#9a6800]">
                            {item.type.replaceAll("_", " ")}
                          </span>
                          <p className="mt-3 text-sm">
                            <span className="font-bold">Observacion</span>
                            <br />
                            {item.observation}
                          </p>
                        </div>
                        <p className="text-sm">
                          <span className="font-bold">Recomendacion</span>
                          <br />
                          {item.recommendation ?? "Sin recomendacion registrada."}
                        </p>
                        <p className="text-sm">
                          <span className="font-bold">Proxima accion</span>
                          <br />
                          {item.commitment ??
                            (item.nextFollowUpAt
                              ? `Revisar el ${formatDate(item.nextFollowUpAt)}.`
                              : "Definir siguiente acompanamiento.")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyBlock message="Todavia no se han registrado seguimientos para esta artesana." />
                )}
              </div>
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
              <h3 className="font-display text-2xl text-[#8a1747]">
                Alertas de seguimiento
              </h3>
              <div className="mt-5 space-y-4">
                {alerts.length ? (
                  alerts.map((alert) => (
                    <div key={alert} className="rounded-[10px] bg-[#fff8ed] p-4">
                      <p className="font-ui font-bold">{alert}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[10px] bg-emerald-50 p-4 text-sm text-emerald-700">
                    Sin alertas criticas por ahora.
                  </div>
                )}
              </div>
              <Link
                href="/facilitadora/reportes"
                className="mt-5 inline-flex items-center gap-2 font-ui font-bold text-[#8a1747]"
              >
                Ver reportes generales
              </Link>
            </article>

            <article className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
              <h3 className="font-display text-2xl text-[#8a1747]">
                Acciones rapidas
              </h3>
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

            <article className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
              <h3 className="font-display text-2xl text-[#8a1747]">
                Informacion de contacto
              </h3>
              <div className="mt-5 space-y-4 text-[#5f4a3a]">
                <p className="flex items-center gap-3">
                  <Phone className="h-5 w-5" /> {summary.phone ?? "Sin telefono"}
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="h-5 w-5" /> {summary.email}
                </p>
                <p className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5" /> Comunidad: {summary.community}
                </p>
              </div>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}
