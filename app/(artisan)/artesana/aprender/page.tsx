import Link from "next/link";
import type { Route } from "next";
import { format } from "date-fns";

import { CourseCard } from "@/shared/components/domain";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
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

  return (
    <Container className="space-y-8 py-6 md:py-10">
      <PageHeader
        eyebrow="Mi aprendizaje"
        title="Tu camino de aprendizaje"
        description="Avanza a tu ritmo. Cada lección suma a tu autonomía digital y cultural."
      />

      <Tabs defaultValue="todos">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="progreso">En progreso</TabsTrigger>
          <TabsTrigger value="completados">Completados</TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
        </TabsList>
        <TabsContent value="todos">
          <CourseGrid courses={data.enrolledCourses} />
        </TabsContent>
        <TabsContent value="progreso">
          <CourseGrid courses={inProgress} />
        </TabsContent>
        <TabsContent value="completados">
          <CourseGrid courses={completed} />
        </TabsContent>
        <TabsContent value="pendientes">
          {data.availableCourses.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.availableCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  description={course.description ?? "Curso disponible para tu ruta."}
                  level={course.level}
                  meta={`${course.modulesCount} módulos · ${course.durationMin} min`}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No hay cursos pendientes" />
          )}
        </TabsContent>
      </Tabs>
    </Container>
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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <Link key={course.id} href={course.href as Route}>
          <CourseCard
            title={course.title}
            description={course.description ?? "Curso de tu ruta Warmi."}
            level={course.level}
            progress={course.progress}
            meta={`${course.modulesCount} módulos · ${course.durationMin} min · ${
              course.lastAccessedAt
                ? `Ultimo acceso ${format(course.lastAccessedAt, "dd/MM/yyyy")}`
                : "Por comenzar"
            }`}
          />
        </Link>
      ))}
    </div>
  );
}
