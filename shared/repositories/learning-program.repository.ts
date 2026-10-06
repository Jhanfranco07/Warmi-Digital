import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/server/db/prisma";
import { LEARNING_PROGRAM } from "@/shared/learning/program";

export class LearningProgramRepository {
  constructor(private readonly db = prisma) {}

  async migrate() {
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw(Prisma.sql`SELECT pg_advisory_xact_lock(73032026)::text`);
        const moving = LEARNING_PROGRAM.modules.filter(
          (module) => module.id !== null && module.previousCourseId !== null
        );
        const sources = await tx.module.findMany({
          where: { id: { in: moving.map((module) => module.id!) } },
          include: {
            course: true,
            lessons: {
              include: {
                lessonFiles: { include: { file: true }, orderBy: { id: "asc" } }
              },
              orderBy: { id: "asc" }
            }
          },
          orderBy: { id: "asc" }
        });
        if (sources.length !== moving.length)
          throw new Error("Faltan módulos originales; no se modificó nada.");
        for (const learningModule of sources) {
          const target = moving.find((item) => item.id === learningModule.id)!;
          if (
            learningModule.course.deletedAt ||
            ![target.previousCourseId, LEARNING_PROGRAM.id].some(
              (id) => id === learningModule.courseId
            )
          )
            throw new Error("Un módulo cambió de contenedor; se canceló la migración.");
        }
        const videoLinks = sources
          .flatMap((module) => module.lessons)
          .flatMap((lesson) => lesson.lessonFiles)
          .filter((resource) => resource.file?.publicId?.startsWith("WARMI - VIDEOS/"));
        const videoIds = ["02", "03", "04", "08", "07", "09"].map(
          (n) => `WARMI - VIDEOS/video${n}`
        );
        if (
          videoLinks.length !== 6 ||
          videoIds.some(
            (id) => videoLinks.filter((r) => r.file?.publicId === id).length !== 1
          )
        )
          throw new Error("Las seis relaciones MP4 no coinciden; no se modificó nada.");
        const duplicateFiles = await tx.file.groupBy({
          by: ["publicId"],
          where: { provider: "cloudinary", publicId: { in: videoIds } },
          _count: { id: true }
        });
        if (duplicateFiles.some((file) => file._count.id !== 1))
          throw new Error("Existen File duplicados.");
        const before = JSON.stringify(sources.map((module) => module.lessons));
        const existing = await tx.course.findFirst({
          where: {
            OR: [
              { id: LEARNING_PROGRAM.id },
              { slug: LEARNING_PROGRAM.slug },
              { title: LEARNING_PROGRAM.title }
            ]
          }
        });
        if (existing && (existing.id !== LEARNING_PROGRAM.id || existing.deletedAt))
          throw new Error("Ya existe otro contenedor; revisar antes de continuar.");
        const course =
          existing ??
          (await tx.course.create({
            data: {
              id: LEARNING_PROGRAM.id,
              slug: LEARNING_PROGRAM.slug,
              title: LEARNING_PROGRAM.title,
              description:
                "Aprendizaje para la autonomía digital y el crecimiento de tu negocio artesanal.",
              facilitatorId: sources.find((module) => module.order === 3)?.course
                .facilitatorId,
              status: "PUBLISHED",
              publishedAt: new Date(),
              level: "BEGINNER"
            }
          }));
        for (const target of moving) {
          await tx.module.update({
            where: { id: target.id! },
            data: { courseId: course.id, title: target.title, order: target.order }
          });
        }
        const oldCourseIds = moving.map((module) => module.previousCourseId!);
        const enrollments = await tx.enrollment.findMany({
          where: { courseId: { in: oldCourseIds } },
          include: { lessonProgresses: true }
        });
        const movedLessonIds = new Set(
          sources.flatMap((module) => module.lessons.map((lesson) => lesson.id))
        );
        const affected = new Set(enrollments.map((enrollment) => enrollment.id));
        for (const source of enrollments) {
          const originals = enrollments.filter((item) => item.userId === source.userId);
          const status = originals.some(
            (item) => item.status === "ACTIVE" || item.status === "COMPLETED"
          )
            ? "ACTIVE"
            : originals.some((item) => item.status === "PAUSED")
              ? "PAUSED"
              : "CANCELLED";
          const target = await tx.enrollment.upsert({
            where: { userId_courseId: { userId: source.userId, courseId: course.id } },
            create: {
              userId: source.userId,
              courseId: course.id,
              status,
              enrolledAt: source.enrolledAt,
              lastActivityAt: source.lastActivityAt
            },
            update: {}
          });
          affected.add(target.id);
          for (const progress of source.lessonProgresses.filter((item) =>
            movedLessonIds.has(item.lessonId)
          )) {
            const conflict = await tx.lessonProgress.findUnique({
              where: {
                enrollmentId_lessonId: {
                  enrollmentId: target.id,
                  lessonId: progress.lessonId
                }
              }
            });
            if (conflict)
              throw new Error(
                "Progreso duplicado en destino; requiere revisión antes de mover."
              );
            await tx.lessonProgress.update({
              where: { id: progress.id },
              data: { enrollmentId: target.id }
            });
          }
        }
        for (const id of affected) {
          const enrollment = await tx.enrollment.findUniqueOrThrow({
            where: { id },
            include: {
              course: { include: { modules: { include: { lessons: true } } } },
              lessonProgresses: true
            }
          });
          const ids = new Set(
            enrollment.course.modules.flatMap((module) =>
              module.lessons.map((lesson) => lesson.id)
            )
          );
          const completedLessons = enrollment.lessonProgresses.filter(
            (p) => ids.has(p.lessonId) && p.completed
          ).length;
          const percentage = ids.size ? (completedLessons / ids.size) * 100 : 0;
          const data = { totalLessons: ids.size, completedLessons, percentage };
          await tx.courseProgress.upsert({
            where: { enrollmentId: id },
            create: { enrollmentId: id, ...data },
            update: data
          });
          // Old empty courses keep their historical enrollment and completion dates.
          if (
            ids.size > 0 &&
            enrollment.status !== "PAUSED" &&
            enrollment.status !== "CANCELLED"
          )
            await tx.enrollment.update({
              where: { id },
              data: {
                status: percentage === 100 ? "COMPLETED" : "ACTIVE",
                completedAt:
                  percentage === 100 ? (enrollment.completedAt ?? new Date()) : null
              }
            });
        }
        const after = await tx.module.findMany({
          where: { id: { in: moving.map((module) => module.id!) } },
          include: {
            lessons: {
              include: {
                lessonFiles: { include: { file: true }, orderBy: { id: "asc" } }
              },
              orderBy: { id: "asc" }
            }
          },
          orderBy: { id: "asc" }
        });
        if (JSON.stringify(after.map((module) => module.lessons)) !== before)
          throw new Error(
            "Los contenidos o archivos cambiaron; se canceló la migración."
          );
        return {
          courseId: course.id,
          created: !existing,
          modules: after.map((module) => ({
            id: module.id,
            title: module.title,
            order: module.order
          })),
          videoRelationsPreserved: videoLinks.map((r) => ({
            id: r.id,
            fileId: r.fileId,
            position: r.position
          })),
          enrollments: affected.size
        };
      },
      { timeout: 60000, isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  }
}
