import Link from "next/link";
import type { Route } from "next";
import { format } from "date-fns";
import { BookOpen, CheckCircle2, Clock, GraduationCap, PlayCircle } from "lucide-react";

import {
  ArtisanHero,
  ArtisanListItem,
  ArtisanPanel,
  ArtisanShell,
  ArtisanStatCard
} from "@/features/artisan/artisan-panel";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { LearningService } from "@/shared/services/learning.service";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanLearningPage() {
  const session = await requireRole("ARTESANA");
  const data = await new LearningService().getLearningPage(session.user.id);
  const inProgress = data.enrolledCourses.filter((course) => course.status === "ACTIVE");
  const completed = data.enrolledCourses.filter(
    (course) => course.status === "COMPLETED"
  );
  const averageProgress = data.enrolledCourses.length
    ? Math.round(
        data.enrolledCourses.reduce((total, course) => total + course.progress, 0) /
          data.enrolledCourses.length
      )
    : 0;

  return (
    <ArtisanShell>
      <ArtisanHero
        eyebrow="Mi aprendizaje"
        title="Tu camino de aprendizaje"
        description="Avanza a tu ritmo. Cada lección suma a tu autonomía digital y fortalece la historia cultural de tu trabajo."
        imageUrl="/images/learning/aprender-hero.png"
      />

      <section className="grid gap-5 md:grid-cols-3">
        <ArtisanStatCard
          title="Cursos activos"
          value={inProgress.length}
          description="Rutas que puedes continuar hoy."
          icon={BookOpen}
          color="bg-[#2f62a3]"
        />
        <ArtisanStatCard
          title="Avance promedio"
          value={`${averageProgress}%`}
          description="Progreso acumulado de tus cursos."
          icon={PlayCircle}
          color="bg-[#b5245b]"
        />
        <ArtisanStatCard
          title="Cursos completados"
          value={completed.length}
          description="Logros que fortalecen tu autonomía."
          icon={CheckCircle2}
          color="bg-[#17c3cf]"
        />
      </section>

      <ArtisanPanel title="Cursos de mi ruta" eyebrow="Formación">
        <Tabs defaultValue="todos">
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-[#fff4ec] p-2">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="progreso">En progreso</TabsTrigger>
            <TabsTrigger value="completados">Completados</TabsTrigger>
            <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          </TabsList>
          <TabsContent value="todos" className="mt-6">
            <CourseGrid courses={data.enrolledCourses} />
          </TabsContent>
          <TabsContent value="progreso" className="mt-6">
            <CourseGrid courses={inProgress} />
          </TabsContent>
          <TabsContent value="completados" className="mt-6">
            <CourseGrid courses={completed} />
          </TabsContent>
          <TabsContent value="pendientes" className="mt-6">
            {data.availableCourses.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {data.availableCourses.map((course) => (
                  <CoursePreview
                    key={course.id}
                    title={course.title}
                    description={course.description ?? "Curso disponible para tu ruta."}
                    level={course.level}
                    meta={`${course.modulesCount} módulos · ${course.durationMin} min`}
                    progress={0}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No hay cursos pendientes" />
            )}
          </TabsContent>
        </Tabs>
      </ArtisanPanel>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <ArtisanPanel title="Lo que practicarás" eyebrow="Spoiler de cursos">
          <div className="grid gap-4 md:grid-cols-2">
            <ArtisanListItem
              meta="Herramientas"
              title="Correo, documentos y celular"
              description="Crear cuentas, enviar adjuntos y organizar archivos para trámites."
            />
            <ArtisanListItem
              meta="Vitrina"
              title="Fotografía de productos"
              description="Usar luz, fondo y encuadre para mostrar una pieza con respeto cultural."
            />
            <ArtisanListItem
              meta="Comunicación"
              title="WhatsApp Business"
              description="Preparar catálogo, mensajes y atención básica para pedidos."
            />
            <ArtisanListItem
              meta="Oportunidades"
              title="Ferias y concursos"
              description="Revisar requisitos antes de postular a convocatorias."
            />
          </div>
        </ArtisanPanel>

        <ArtisanPanel title="Acompañamiento" eyebrow="Facilitadora">
          <p className="text-lg leading-8 text-[#5b4a42]">
            Si una lección se complica, puedes pedir apoyo desde Mensajes o reforzarla en
            un taller presencial. El aprendizaje no depende solo del video: también cuenta
            la práctica, la pregunta y la comunidad.
          </p>
        </ArtisanPanel>
      </section>
    </ArtisanShell>
  );
}

function CourseGrid({
  courses
}: {
  courses: Awaited<ReturnType<LearningService["getLearningPage"]>>["enrolledCourses"];
}) {
  if (!courses.length) {
    return <EmptyState title="Aún no tienes cursos en esta sección" />;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <Link key={course.id} href={course.href as Route}>
          <CoursePreview
            title={course.title}
            description={course.description ?? "Curso de tu ruta Warmi."}
            level={course.level}
            progress={course.progress}
            meta={`${course.modulesCount} módulos · ${course.durationMin} min · ${
              course.lastAccessedAt
                ? `Último acceso ${format(course.lastAccessedAt, "dd/MM/yyyy")}`
                : "Por comenzar"
            }`}
          />
        </Link>
      ))}
    </div>
  );
}

function CoursePreview({
  title,
  description,
  level,
  meta,
  progress
}: {
  title: string;
  description: string;
  level?: string;
  meta: string;
  progress: number;
}) {
  return (
    <article className="group min-h-full border border-[#f0c7bb] bg-white p-5 shadow-[0_16px_40px_rgba(122,49,0,0.06)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_26px_58px_rgba(122,49,0,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex rounded-full bg-[#2f62a3] p-3 text-white">
          <GraduationCap className="h-5 w-5" />
        </span>
        {level ? <Badge variant="outline">{level}</Badge> : null}
      </div>
      <h3 className="mt-5 font-serif text-3xl font-bold leading-tight text-[#1b1c1a]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#5b4a42]">{description}</p>
      <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#123f78]">
        <Clock className="h-4 w-4" />
        {meta}
      </div>
      <Progress value={progress} className="mt-5 h-2 bg-[#eadfe2] [&>div]:bg-[#e65578]" />
      <p className="mt-2 text-sm font-bold text-[#b5245b]">{progress}% completado</p>
    </article>
  );
}
