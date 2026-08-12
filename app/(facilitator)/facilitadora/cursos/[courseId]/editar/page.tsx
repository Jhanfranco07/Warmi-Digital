import { notFound } from "next/navigation";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CourseRepository } from "@/shared/repositories/course.repository";
import { requireRole } from "@/shared/server/auth/helpers";
export default async function Page({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await requireRole("FACILITADORA");
  const course = await new CourseRepository().findManagedCourse(
    session.user.id,
    (await params).courseId
  );
  if (!course) notFound();
  return (
    <Container className="space-y-6 py-8">
      <PageHeader
        title={`Editar: ${course.title}`}
        description="Los módulos y lecciones existentes se conservan en esta ruta."
      />
      <Card>
        <CardContent className="space-y-3 pt-6">
          {course.modules.map((module) => (
            <div key={module.id}>
              <p className="font-semibold">{module.title}</p>
              <p className="text-body-sm text-muted-foreground">
                {module.lessons.map((lesson) => lesson.title).join(" · ") ||
                  "Sin lecciones"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
}
