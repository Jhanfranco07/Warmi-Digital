import { notFound } from "next/navigation";

import {
  CourseEditor,
  type CourseEditorData
} from "@/features/facilitator/course-editor/course-editor";
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

  return <CourseEditor course={course as CourseEditorData} />;
}
