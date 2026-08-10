import Link from "next/link";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { requireRole } from "@/shared/server/auth/helpers";
import { CourseRepository } from "@/shared/repositories/course.repository";
export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const courses = await new CourseRepository().findManagedCourses(session.user.id);
  return (
    <Container className="space-y-6 py-8">
      <PageHeader
        title="Cursos"
        description="Rutas formativas a tu cargo."
        actions={
          <Button asChild>
            <Link href="/facilitadora/cursos/nuevo">Crear curso</Link>
          </Button>
        }
      />
      <div className="grid gap-4">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-semibold">{course.title}</p>
                <p className="text-body-sm text-muted-foreground">
                  {course.modules.length} modulos · {course.enrollments.length} artesanas
                  inscritas · {course.status}
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/facilitadora/cursos/${course.id}/editar`}>Editar</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
