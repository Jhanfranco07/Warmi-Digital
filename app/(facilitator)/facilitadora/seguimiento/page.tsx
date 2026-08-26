import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CircleAlert,
  Clock,
  MessageCircle,
  TrendingUp,
  UsersRound
} from "lucide-react";

import { requireRole } from "@/shared/server/auth/helpers";
import {
  ArtisanMonitoringService,
  FacilitatorReportService
} from "@/shared/services/facilitator.service";

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

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-[#e8c9b5] bg-[#fffaf6] p-6 text-sm text-[#6b5a4e]">
      {message}
    </div>
  );
}

export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const [artisans, report] = await Promise.all([
    new ArtisanMonitoringService().list(session.user.id),
    new FacilitatorReportService().getReport(session.user.id)
  ]);
  const needsAttention = [...artisans]
    .filter(
      (artisan) =>
        artisan.status === "NECESITA_APOYO" || artisan.status === "INACTIVA"
    )
    .sort((a, b) => a.progress - b.progress);
  const visibleAttention = needsAttention.length ? needsAttention : artisans.slice(0, 5);
  const maxProgress = Math.max(
    ...report.communityProgress.map((item) => item.averageProgress),
    1
  );

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10" />

      <section className="mx-auto max-w-[1560px] space-y-7 px-6 py-10 lg:px-10">
        <div className="grid gap-5 xl:grid-cols-[1fr_360px] xl:items-end">
          <div>
            <h1 className="font-display text-5xl leading-tight text-[#0f1f3d] xl:text-6xl">
              Seguimiento
            </h1>
            <p className="mt-3 font-ui text-lg text-[#6b5a4e]">
              Acompana a tus artesanas con datos reales de aprendizaje, talleres y
              conversaciones registradas.
            </p>
          </div>
          <blockquote className="rounded-[14px] border border-[#eed8bf] bg-white p-6 font-display text-xl italic text-[#8a1747] shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            &ldquo;Acompanarlas tambien es mirar a tiempo donde necesitan apoyo.&rdquo;
          </blockquote>
        </div>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Artesanas acompanadas",
              value: artisans.length,
              detail: "Asignadas a tu cuenta",
              Icon: UsersRound
            },
            {
              label: "Necesitan apoyo",
              value: report.needsSupport,
              detail: "Por avance, asistencia o actividad",
              Icon: CircleAlert
            },
            {
              label: "Progreso promedio",
              value: `${report.averageProgress}%`,
              detail: "Promedio de cursos inscritos",
              Icon: TrendingUp
            },
            {
              label: "Asistencia promedio",
              value: `${report.attendanceRate}%`,
              detail: "Talleres con asistencia registrada",
              Icon: CalendarDays
            }
          ].map(({ label, value, detail, Icon }) => (
            <article
              key={label}
              className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
                <Icon className="h-7 w-7" />
              </span>
              <p className="mt-5 font-ui text-sm font-bold text-[#6b5a4e]">{label}</p>
              <p className="font-display text-4xl text-[#171412]">{value}</p>
              <p className="mt-1 text-sm text-[#8a1747]">{detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
          <article className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl text-[#8a1747]">
                  Artesanas que requieren atencion
                </h2>
                <p className="mt-1 text-sm text-[#6b5a4e]">
                  Ordenadas por menor avance o falta de actividad reciente.
                </p>
              </div>
              <Link
                href="/facilitadora/artesanas"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#8a1747]"
              >
                Ver listado completo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {visibleAttention.length ? (
                visibleAttention.map((artisan) => (
                  <div
                    key={artisan.id}
                    className="grid gap-4 rounded-[14px] border border-[#f0d8c7] p-4 md:grid-cols-[1.2fr_1fr_1fr_auto]"
                  >
                    <div className="flex items-center gap-4">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#fff2cf] font-display text-2xl text-[#8a1747]">
                        {artisan.name.charAt(0)}
                      </span>
                      <div>
                        <p className="font-ui font-bold">{artisan.name}</p>
                        <p className="text-sm text-[#6b5a4e]">
                          {artisan.community} -{" "}
                          {artisan.craftTypes.join(", ") || "Sin especialidad"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-[#be1e5a]">
                        Avance
                      </p>
                      <p className="font-display text-2xl">{artisan.progress}%</p>
                      <span className="mt-1 block h-1.5 rounded-full bg-[#efe6dc]">
                        <span
                          className="block h-full rounded-full bg-[#be1e5a]"
                          style={{ width: `${artisan.progress}%` }}
                        />
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-[#be1e5a]">
                        Motivo
                      </p>
                      <p className="text-sm">{artisan.supportReason}</p>
                      <span
                        className={`mt-2 inline-flex rounded-[6px] px-3 py-1 text-xs font-bold ${statusClasses[artisan.status]}`}
                      >
                        {statusLabels[artisan.status]}
                      </span>
                    </div>
                    <div className="grid gap-2">
                      <Link
                        href={`/facilitadora/artesanas/${artisan.id}`}
                        className="rounded-[8px] bg-[#d79a00] px-4 py-2 text-center text-sm font-bold text-white"
                      >
                        Ver detalle
                      </Link>
                      <Link
                        href={`/facilitadora/artesanas/${artisan.id}/seguimiento`}
                        className="rounded-[8px] border border-[#d89b06] px-4 py-2 text-center text-sm font-bold text-[#9a6800]"
                      >
                        Registrar
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyBlock message="Aun no tienes artesanas asignadas para seguimiento." />
              )}
            </div>
          </article>

          <aside className="space-y-5">
            <article className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
              <h2 className="font-display text-3xl text-[#8a1747]">
                Progreso por comunidad
              </h2>
              <div className="mt-6 space-y-4">
                {report.communityProgress.length ? (
                  report.communityProgress.map((item) => (
                    <div key={item.community}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold">{item.community}</span>
                        <span>{item.averageProgress}%</span>
                      </div>
                      <span className="mt-2 block h-2 rounded-full bg-[#efe6dc]">
                        <span
                          className="block h-full rounded-full bg-[#d79a00]"
                          style={{
                            width: `${Math.max(
                              4,
                              (item.averageProgress / maxProgress) * 100
                            )}%`
                          }}
                        />
                      </span>
                      <p className="mt-1 text-xs text-[#7a5b4a]">
                        {item.total} artesanas, {item.needsSupport} alertas
                      </p>
                    </div>
                  ))
                ) : (
                  <EmptyBlock message="Sin comunidades asignadas." />
                )}
              </div>
            </article>

            <article className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
              <h2 className="font-display text-3xl text-[#8a1747]">
                Seguimientos recientes
              </h2>
              <div className="mt-6 space-y-4">
                {report.recentFollowUps.length ? (
                  report.recentFollowUps.slice(0, 4).map((followUp) => (
                    <Link
                      key={followUp.id}
                      href={`/facilitadora/artesanas/${followUp.artisanId}`}
                      className="flex gap-3 rounded-[12px] border border-[#f0d8c7] p-4 transition hover:bg-[#fffaf6]"
                    >
                      <Clock className="mt-1 h-5 w-5 shrink-0 text-[#d79a00]" />
                      <span>
                        <span className="block font-ui font-bold">
                          {followUp.artisanName}
                        </span>
                        <span className="block text-xs font-bold uppercase text-[#be1e5a]">
                          {followUp.type.replaceAll("_", " ")} -{" "}
                          {followUp.occurredAt.toLocaleDateString("es-PE")}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-sm text-[#6b5a4e]">
                          {followUp.observation}
                        </span>
                      </span>
                    </Link>
                  ))
                ) : (
                  <EmptyBlock message="Aun no se registran seguimientos." />
                )}
              </div>
            </article>
          </aside>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <Link
            href="/facilitadora/cursos"
            className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)] transition hover:-translate-y-0.5"
          >
            <BookOpen className="h-8 w-8 text-[#be1e5a]" />
            <h3 className="mt-4 font-display text-2xl">Revisar cursos</h3>
            <p className="mt-2 text-sm text-[#6b5a4e]">
              Mira que cursos tienen menos avance para acompanar mejor.
            </p>
          </Link>
          <Link
            href="/facilitadora/talleres"
            className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)] transition hover:-translate-y-0.5"
          >
            <CalendarDays className="h-8 w-8 text-[#d79a00]" />
            <h3 className="mt-4 font-display text-2xl">Ver talleres</h3>
            <p className="mt-2 text-sm text-[#6b5a4e]">
              Cruza asistencia con progreso para detectar necesidades reales.
            </p>
          </Link>
          <Link
            href="/facilitadora/mensajes"
            className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)] transition hover:-translate-y-0.5"
          >
            <MessageCircle className="h-8 w-8 text-[#8a1747]" />
            <h3 className="mt-4 font-display text-2xl">Enviar mensaje</h3>
            <p className="mt-2 text-sm text-[#6b5a4e]">
              Abre una conversacion de apoyo con la artesana que lo necesite.
            </p>
          </Link>
        </section>
      </section>
    </main>
  );
}
