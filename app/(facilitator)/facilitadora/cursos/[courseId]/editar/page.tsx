import { notFound } from "next/navigation";
<<<<<<< HEAD

import {
  CourseEditor,
  type CourseEditorData
} from "@/features/facilitator/course-editor/course-editor";
=======
import Link from "next/link";

import { CourseLearningBuilder } from "@/features/facilitator/course-learning-builder";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
>>>>>>> origin/main
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

<<<<<<< HEAD
  return <CourseEditor course={course as CourseEditorData} />;
=======
  const serializedCourse = {
    id: course.id,
    title: course.title,
    description: course.description,
    level: course.level,
    status: course.status,
    durationMin: course.durationMin,
    imageUrl: course.imageUrl,
    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      order: module.order,
      durationMin: module.durationMin,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        type: lesson.type,
        order: lesson.order,
        durationMin: lesson.durationMin,
        lessonFiles: lesson.lessonFiles.map((resource) => ({
          id: resource.id,
          type: resource.type,
          title: resource.title,
          description: resource.description,
          position: resource.position,
          provider: resource.provider,
          externalId: resource.externalId,
          originalUrl: resource.originalUrl,
          file: resource.file
            ? {
                id: resource.file.id,
                url: resource.file.url,
                type: resource.file.type,
                mimeType: resource.file.mimeType,
                altText: resource.file.altText
              }
            : null
        }))
      }))
    }))
  };

  return (
    <Container className="space-y-6 py-8">
      <PageHeader
        title={`Editar: ${course.title}`}
        description="Gestiona módulos, lecciones y recursos formativos reales."
        actions={
          <Button asChild variant="outline">
            <Link href="/facilitadora/cursos">Volver</Link>
          </Button>
        }
      />
      <CourseLearningBuilder course={serializedCourse} />
    </Container>
  );
>>>>>>> origin/main
}
