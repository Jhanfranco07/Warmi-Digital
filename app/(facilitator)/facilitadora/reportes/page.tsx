import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarCheck,
  ChartNoAxesColumnIncreasing,
  CircleAlert,
  UserRound,
  UsersRound
} from "lucide-react";

import { requireRole } from "@/shared/server/auth/helpers";
import { FacilitatorReportService } from "@/shared/services/facilitator.service";

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

function MetricCard({
  label,
  value,
  detail,
  Icon
}: {
  label: string;
  value: string | number;
  detail: string;
  Icon: LucideIcon;
}) {
  return (
    <article className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
      <div className="flex items-center gap-5">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#fff2cf] text-[#d89b06]">
          <Icon className="h-8 w-8" />
        </span>
        <div>
          <p className="font-ui text-sm font-semibold text-[#5f4a3a]">{label}</p>
          <p className="font-display text-4xl text-[#171412]">{value}</p>
          <p className="mt-1 text-sm text-[#8a1747]">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-[#e8c9b5] bg-[#fffaf6] p-6 text-sm text-[#6b5a4e]">
      {message}
    </div>
  );
}

export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const report = await new FacilitatorReportService().getReport(session.user.id);
  const maxMonthlyLessons = Math.max(
    ...report.monthlyLearning.map((item) => item.completedLessons),
    1
  );
  const maxCommunityProgress = Math.max(
    ...report.communityProgress.map((item) => item.averageProgress),
    1
  );

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <section className="border-b border-[#ead4ca] bg-white/75 px-6 py-7 lg:px-10" />

      <section className="mx-auto max-w-[1560px] space-y-7 px-6 py-10 lg:px-10">
        <div>
          <h1 className="font-display text-5xl leading-tight text-[#0f1f3d] xl:text-6xl">
            Reportes
          </h1>
          <p className="mt-3 font-ui text-lg text-[#6b5a4e]">
            Consulta el impacto real de tu acompanamiento y el avance de las artesanas.
          </p>
        </div>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Progreso promedio"
            value={`${report.averageProgress}%`}
            detail={`${report.accompanied} artesanas acompanadas`}
            Icon={ChartNoAxesColumnIncreasing}
          />
          <MetricCard
            label="Cursos completados"
            value={report.completedCourses}
            detail={`${report.activeCourses} cursos publicados`}
            Icon={BookOpen}
          />
          <MetricCard
            label="Participacion en talleres"
            value={`${report.participationRate}%`}
            detail={`${report.workshopsCompleted} talleres realizados`}
            Icon={UsersRound}
          />
          <MetricCard
            label="Asistencia promedio"
            value={`${report.attendanceRate}%`}
            detail={`${report.needsSupport} requieren apoyo`}
            Icon={CalendarCheck}
          />
          <MetricCard
            label="Artesanas activas"
            value={report.active}
            detail={`${report.inactive} sin actividad reciente`}
            Icon={UserRound}
          />
          <MetricCard
            label="Alertas de seguimiento"
            value={report.needsSupport}
            detail="Calculado por avance, asistencia y actividad"
            Icon={CircleAlert}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr_1fr]">
          <article className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-2xl text-[#8a1747]">
              Progreso por comunidad
            </h2>
            {report.communityProgress.length ? (
              <div className="mt-7 flex h-64 items-end gap-5 overflow-x-auto border-b border-l border-[#ead4ca] px-4 pb-4">
                {report.communityProgress.map((item) => (
                  <div
                    key={item.community}
                    className="flex min-w-24 flex-1 flex-col items-center gap-2"
                  >
                    <span className="text-sm font-bold">
                      {item.averageProgress}%
                    </span>
                    <span
                      className="w-10 rounded-t-[10px] bg-gradient-to-t from-[#d79a00] to-[#f5c542]"
                      style={{
                        height: `${Math.max(
                          18,
                          (item.averageProgress / maxCommunityProgress) * 190
                        )}px`
                      }}
                    />
                    <span className="text-center text-xs text-[#7a5b4a]">
                      {item.community}
                    </span>
                    <span className="text-[11px] text-[#9a6c4f]">
                      {item.total} artesanas
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyBlock message="Aun no hay artesanas asignadas para calcular comunidades." />
              </div>
            )}
          </article>

          <article className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-2xl text-[#8a1747]">
              Lecciones completadas
            </h2>
            <div className="mt-8 space-y-5">
              {report.monthlyLearning.map((month) => (
                <div
                  key={month.label}
                  className="grid grid-cols-[42px_1fr_44px] items-center gap-3 text-sm"
                >
                  <span className="capitalize">{month.label}</span>
                  <span className="h-2 rounded-full bg-[#efe6dc]">
                    <span
                      className="block h-full rounded-full bg-[#be1e5a]"
                      style={{
                        width: `${Math.max(
                          4,
                          (month.completedLessons / maxMonthlyLessons) * 100
                        )}%`
                      }}
                    />
                  </span>
                  <span>{month.completedLessons}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-2xl text-[#8a1747]">
              Asistencia registrada
            </h2>
            <div className="mt-7 space-y-4">
              {report.attendanceDistribution.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      <strong>{item.label}</strong> ({item.description})
                    </span>
                    <span>{item.percentage}%</span>
                  </div>
                  <span className="mt-2 block h-2 rounded-full bg-[#efe6dc]">
                    <span
                      className="block h-full rounded-full bg-[#d79a00]"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-2xl text-[#8a1747]">
              Cursos con mayor avance
            </h2>
            {report.topCourses.length ? (
              <div className="mt-6 space-y-5">
                {report.topCourses.map((course) => (
                  <div
                    key={course.id}
                    className="grid gap-3 rounded-[12px] border border-[#f0d8c7] p-4 md:grid-cols-[1fr_130px_110px]"
                  >
                    <div>
                      <p className="font-ui font-bold">{course.title}</p>
                      <p className="text-sm text-[#7a5b4a]">
                        {course.enrolled} inscritas, {course.completed} completaron
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{course.averageProgress}%</p>
                      <span className="mt-2 block h-2 rounded-full bg-[#efe6dc]">
                        <span
                          className="block h-full rounded-full bg-[#d79a00]"
                          style={{ width: `${course.averageProgress}%` }}
                        />
                      </span>
                    </div>
                    <Link
                      href={`/facilitadora/cursos/${course.id}/editar`}
                      className="self-center rounded-[8px] border border-[#d89b06] px-4 py-2 text-center text-sm font-bold text-[#9a6800] transition hover:bg-[#fff2cf]"
                    >
                      Ver curso
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyBlock message="Aun no hay cursos gestionados para calcular avance." />
              </div>
            )}
          </article>

          <article className="rounded-[14px] border border-[#eed8bf] bg-white p-6 shadow-[0_18px_45px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-2xl text-[#8a1747]">
              Seguimientos recientes
            </h2>
            {report.recentFollowUps.length ? (
              <div className="mt-6 space-y-4">
                {report.recentFollowUps.map((item) => (
                  <Link
                    key={item.id}
                    href={`/facilitadora/artesanas/${item.artisanId}`}
                    className="block rounded-[12px] border border-[#f0d8c7] p-4 transition hover:-translate-y-0.5 hover:bg-[#fffaf6]"
                  >
                    <p className="font-ui font-bold">{item.artisanName}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-[#be1e5a]">
                      {item.type.replaceAll("_", " ")} -{" "}
                      {item.occurredAt.toLocaleDateString("es-PE")}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-[#5f4a3a]">
                      {item.observation}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyBlock message="Todavia no se han registrado seguimientos." />
              </div>
            )}
          </article>
        </section>

        <section className="overflow-hidden rounded-[14px] border border-[#eed8bf] bg-white shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
          <div className="border-b border-[#ead4ca] p-5">
            <h2 className="font-display text-2xl text-[#8a1747]">
              Resumen de artesanas
            </h2>
          </div>
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_1fr] bg-[#fffaf6] px-6 py-4 text-sm font-bold text-[#6b5a4e] xl:grid">
            <span>Artesana</span>
            <span>Comunidad</span>
            <span>Progreso</span>
            <span>Asistencia</span>
            <span>Talleres</span>
            <span>Cursos</span>
            <span>Estado</span>
          </div>
          <div className="divide-y divide-[#f1e1d5]">
            {report.rows.length ? (
              report.rows.map((artisan) => (
                <Link
                  key={artisan.id}
                  href={`/facilitadora/artesanas/${artisan.id}`}
                  className="grid gap-4 px-6 py-5 text-sm transition hover:bg-[#fffaf6] xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_1fr] xl:items-center"
                >
                  <span>
                    <span className="block font-bold">{artisan.name}</span>
                    <span className="text-[#7a5b4a]">
                      {artisan.craftTypes.join(", ") || "Sin especialidad registrada"}
                    </span>
                  </span>
                  <span>{artisan.community}</span>
                  <span>
                    <span className="font-bold">{artisan.progress}%</span>
                    <span className="mt-1 block h-1.5 rounded-full bg-[#efe6dc]">
                      <span
                        className="block h-full rounded-full bg-[#d79a00]"
                        style={{ width: `${artisan.progress}%` }}
                      />
                    </span>
                  </span>
                  <span>
                    <span className="font-bold">{artisan.attendanceRate}%</span>
                    <span className="mt-1 block h-1.5 rounded-full bg-[#efe6dc]">
                      <span
                        className="block h-full rounded-full bg-emerald-600"
                        style={{ width: `${artisan.attendanceRate}%` }}
                      />
                    </span>
                  </span>
                  <span>
                    {artisan.attendedWorkshops} de {artisan.registeredWorkshops}
                  </span>
                  <span>
                    {artisan.completedCourses} de {artisan.totalCourses}
                  </span>
                  <span>
                    <span
                      className={`rounded-[6px] px-3 py-1 text-xs font-bold ${statusClasses[artisan.status]}`}
                    >
                      {statusLabels[artisan.status]}
                    </span>
                  </span>
                </Link>
              ))
            ) : (
              <div className="p-6">
                <EmptyBlock message="Aun no tienes artesanas asignadas." />
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
