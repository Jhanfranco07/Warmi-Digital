"use server";

import { revalidatePath } from "next/cache";

import { CourseRepository } from "@/shared/repositories/course.repository";
import { ProgressService } from "@/shared/services/progress.service";
import { requireRole } from "@/shared/server/auth/helpers";

type CompleteLessonResult = {
  ok: boolean;
  message: string;
};

export async function completeLessonAction(
  courseId: string,
  lessonId: string
): Promise<CompleteLessonResult> {
  const session = await requireRole("ARTESANA");
  const userId = session.user.id;
  const courseRepository = new CourseRepository();
  const enrollment = await courseRepository.findEnrollmentCourse(userId, courseId);

  if (!enrollment) {
    return {
      ok: false,
      message: "No encontramos tu inscripción a este curso."
    };
  }

  const ownsLesson = enrollment.course.modules.some((module) =>
    module.lessons.some((lesson) => lesson.id === lessonId)
  );

  if (!ownsLesson) {
    return {
      ok: false,
      message: "Esta lección no pertenece a tu ruta de aprendizaje."
    };
  }

  await new ProgressService().completeLesson(enrollment.id, lessonId);

  revalidatePath(`/artesana/aprender/${courseId}`);
  revalidatePath(`/artesana/aprender/${courseId}/lecciones/${lessonId}`);
  revalidatePath("/artesana/aprender");
  revalidatePath("/artesana/dashboard");

  return {
    ok: true,
    message: "Lección completada. Tu avance se actualizó correctamente."
  };
}
