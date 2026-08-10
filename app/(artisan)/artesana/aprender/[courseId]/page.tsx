import Link from "next/link";
import type { Route } from "next";
import { UserRound } from "lucide-react";

import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { LearningService } from "@/shared/services/learning.service";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanCourseDetailPage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await requireRole("ARTESANA");
  const { enrollment, progress, firstIncompleteLesson, lessonProgress } =
    await new LearningService().getCourseDetail(session.user.id, courseId);

  return (
    <Container className="space-y-8 py-6 md:py-10">
      <PageHeader
        eyebrow="Curso"
        title={enrollment.course.title}
        description={enrollment.course.description ?? "Curso de la ruta Warmi."}
      />

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge>{enrollment.course.level}</Badge>
              <Badge variant="outline">{enrollment.status}</Badge>
            </div>
            <Progress value={progress} />
            <p className="text-body-md text-muted-foreground">
              Has completado {progress}% de este curso.
            </p>
          </div>
          {firstIncompleteLesson ? (
            <Button asChild size="lg" className="min-h-touch-target">
              <Link
                href={
                  `/artesana/aprender/${courseId}/lecciones/${firstIncompleteLesson.id}` as Route
                }
              >
                Continuar mi leccion
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <section className="space-y-4">
        {enrollment.course.modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {module.lessons.map((lesson) => {
                const progressItem = lessonProgress.get(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    href={
                      `/artesana/aprender/${courseId}/lecciones/${lesson.id}` as Route
                    }
                    className="flex min-h-touch-target items-center justify-between rounded-md border border-border p-3 hover:bg-surface-high"
                  >
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-body-sm text-muted-foreground">
                        {lesson.type} · {lesson.durationMin ?? 0} min
                      </p>
                    </div>
                    <Badge variant={progressItem?.completed ? "default" : "outline"}>
                      {progressItem?.completed ? "Completada" : "Pendiente"}
                    </Badge>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5" />
            Facilitadora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-md text-muted-foreground">
            La facilitadora vinculada aparecera en los talleres asociados al curso.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
