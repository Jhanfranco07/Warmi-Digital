import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Award, BadgeCheck, BookOpen, Download, Sprout } from "lucide-react";

import {
  ArtisanPanel,
  ArtisanShell,
  ArtisanStatCard
} from "@/features/artisan/artisan-panel";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Button } from "@/shared/components/ui/button";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanAchievementsPage() {
  const session = await requireRole("ARTESANA");
  const artisan = await new ArtisanRepository().findProfile(session.user.id);
  const badges = artisan?.userBadges ?? [];
  const certificates = artisan?.certificates ?? [];
  const completedCourses =
    artisan?.enrollments.filter(
      (enrollment) =>
        enrollment.status === "COMPLETED" ||
        (enrollment.courseProgress?.percentage ?? 0) >= 100
    ) ?? [];
  const averageProgress = artisan?.enrollments.length
    ? Math.round(
        artisan.enrollments.reduce(
          (total, enrollment) => total + (enrollment.courseProgress?.percentage ?? 0),
          0
        ) / artisan.enrollments.length
      )
    : 0;

  return (
    <ArtisanShell>
      <header>
        <h1 className="font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl 2xl:text-7xl">
          Mis logros <span className="text-4xl text-[#b5245b]">-</span>
        </h1>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
          Revisa los avances, insignias y certificados obtenidos en tu ruta de
          aprendizaje.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <ArtisanStatCard
          title="Insignias"
          value={badges.length}
          description="Reconocimientos ganados por tu progreso."
          icon={Award}
          color="bg-[#b5245b]"
        />
        <ArtisanStatCard
          title="Certificados"
          value={certificates.length}
          description="Constancias emitidas por cursos completados."
          icon={BadgeCheck}
          color="bg-[#d89911]"
        />
        <ArtisanStatCard
          title="Avance promedio"
          value={`${averageProgress}%`}
          description="Promedio de tu aprendizaje activo."
          icon={Sprout}
          color="bg-[#17c3cf]"
        />
      </section>

      <section className="grid gap-7 xl:grid-cols-[1fr_1fr]">
        <ArtisanPanel title="Insignias obtenidas" eyebrow="Reconocimientos">
          {badges.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {badges.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#ecd0bd] bg-[#fffaf6] p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(122,49,0,0.1)]"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[#fff0c7] text-[#d89911]">
                    <Award className="h-7 w-7" />
                  </span>
                  <h2 className="mt-4 font-serif text-3xl font-bold text-[#7a1042]">
                    {item.badge.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#5b4a42]">
                    {item.badge.description ??
                      item.reason ??
                      "Insignia otorgada por Warmi Digital."}
                  </p>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-[#b5245b]">
                    {format(item.awardedAt, "dd MMM yyyy", { locale: es })}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aun no tienes insignias"
              description="Completa cursos, talleres e hitos para desbloquear tus primeros reconocimientos."
            />
          )}
        </ArtisanPanel>

        <ArtisanPanel title="Certificados" eyebrow="Constancias">
          {certificates.length ? (
            <div className="space-y-4">
              {certificates.map((certificate) => (
                <article
                  key={certificate.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#ecd0bd] bg-white p-5"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[#e8fbfc] text-[#17c3cf]">
                    <BadgeCheck className="h-7 w-7" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-ui text-lg font-extrabold text-[#1b1c1a]">
                      {certificate.course.title}
                    </h2>
                    <p className="text-sm text-[#5b4a42]">
                      Emitido el{" "}
                      {format(certificate.issuedAt, "dd/MM/yyyy", { locale: es })}
                    </p>
                  </div>
                  {certificate.file?.url ? (
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href={certificate.file.url} target="_blank">
                        <Download className="h-4 w-4" />
                        Descargar
                      </Link>
                    </Button>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No hay certificados emitidos"
              description="Cuando completes un curso certificado, aparecera aqui."
            />
          )}
        </ArtisanPanel>
      </section>

      <ArtisanPanel title="Cursos completados" eyebrow="Aprendizaje">
        {completedCourses.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {completedCourses.map((enrollment) => (
              <article
                key={enrollment.id}
                className="rounded-2xl border border-[#ecd0bd] bg-white p-5"
              >
                <BookOpen className="h-7 w-7 text-[#2f62a3]" />
                <h2 className="mt-3 font-serif text-2xl font-bold text-[#101833]">
                  {enrollment.course.title}
                </h2>
                <p className="mt-2 text-sm text-[#5b4a42]">
                  {enrollment.completedAt
                    ? `Completado el ${format(enrollment.completedAt, "dd/MM/yyyy", { locale: es })}`
                    : "Curso completado"}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Todavia no completaste cursos"
            description="Continua tu aprendizaje para registrar tu primer curso completado."
          />
        )}
      </ArtisanPanel>
    </ArtisanShell>
  );
}
