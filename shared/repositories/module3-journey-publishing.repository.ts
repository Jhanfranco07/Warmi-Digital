import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/server/db/prisma";
import { LEARNING_PROGRAM, learningProgress } from "@/shared/learning/program";
import {
  MODULE3_ID,
  MODULE3_SESSIONS,
  module3SessionText
} from "@/shared/learning/module3-journey";
import type { Module3JourneyAsset } from "@/shared/services/module3-journey-publishing.service";

const include = {
  lessons: {
    orderBy: { order: "asc" as const },
    include: {
      lessonFiles: { orderBy: { position: "asc" as const }, include: { file: true } }
    }
  }
};
export class Module3JourneyPublishingRepository {
  constructor(private readonly db = prisma) {}
  inspect() {
    return this.db.module.findUnique({ where: { id: MODULE3_ID }, include });
  }
  publish(assets: Module3JourneyAsset[]) {
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Course" WHERE "id" = ${LEARNING_PROGRAM.id} FOR UPDATE`
        );
        const learningModule = await tx.module.findUniqueOrThrow({
          where: { id: MODULE3_ID },
          include
        });
        if (
          learningModule.courseId !== LEARNING_PROGRAM.id ||
          learningModule.order !== 3 ||
          learningModule.lessons.some((l) => !MODULE3_SESSIONS.some((s) => s.id === l.id))
        )
          throw new Error("Estructura M3 inesperada; no se modifica.");
        const originals = learningModule.lessons.flatMap((l) => l.lessonFiles);
        const snapshot = async () =>
          JSON.stringify({
            modules: await tx.module.findMany({
              where: { courseId: LEARNING_PROGRAM.id, id: { not: MODULE3_ID } },
              orderBy: { id: "asc" },
              include
            }),
            session1: await tx.lesson.findUnique({
              where: { id: MODULE3_SESSIONS[0].id }
            }),
            resources: await tx.lessonFile.findMany({
              where: { id: { in: originals.map((r) => r.id) } },
              orderBy: { id: "asc" },
              include: { file: true }
            }),
            progress: await tx.lessonProgress.findMany({
              where: { enrollment: { courseId: LEARNING_PROGRAM.id } },
              orderBy: { id: "asc" }
            })
          });
        const protectedBefore = await snapshot();
        const created = { lessons: 0, files: 0, resources: 0, writes: 0 };
        for (const session of MODULE3_SESSIONS.slice(1)) {
          const lesson = await tx.lesson.findUnique({ where: { id: session.id } });
          if (
            lesson &&
            (lesson.moduleId !== MODULE3_ID || lesson.order !== session.order)
          )
            throw new Error("La sesión existente no coincide.");
          const data = {
            title: session.title,
            content: module3SessionText(session.order)
          };
          if (!lesson) {
            await tx.lesson.create({
              data: {
                id: session.id,
                moduleId: MODULE3_ID,
                order: session.order,
                slug: `module-3-session-${session.order}-learning-journey`,
                type: "TEXT",
                ...data
              }
            });
            created.lessons++;
            created.writes++;
          } else if (lesson.title !== data.title || lesson.content !== data.content) {
            await tx.lesson.update({ where: { id: session.id }, data });
            created.writes++;
          }
        }
        const records = [];
        for (const asset of assets) {
          const candidates = await tx.file.findMany({
            where: {
              OR: [
                { publicId: asset.publicId, provider: "cloudinary" },
                { url: asset.url }
              ]
            }
          });
          if (candidates.length > 1) throw new Error("File duplicado.");
          let file = candidates[0];
          const mimeType = asset.kind === "pdf" ? "application/pdf" : "video/mp4";
          if (
            file &&
            (file.publicId !== asset.publicId ||
              file.url !== asset.url ||
              file.mimeType !== mimeType ||
              file.size !== asset.bytes)
          )
            throw new Error("File existente incompatible.");
          if (!file) {
            file = await tx.file.create({
              data: {
                publicId: asset.publicId,
                provider: "cloudinary",
                url: asset.url,
                type: asset.kind === "pdf" ? "DOCUMENT" : "VIDEO",
                mimeType,
                size: asset.bytes,
                width: asset.width,
                height: asset.height,
                metadata: {
                  assetId: asset.assetId,
                  ...(asset.sha256 ? { sha256: asset.sha256 } : {}),
                  ...(asset.duration ? { durationSeconds: asset.duration } : {})
                }
              }
            });
            created.files++;
            created.writes++;
          }
          const matches = await tx.lessonFile.findMany({
            where: {
              lessonId: asset.lessonId,
              OR: [
                { fileId: file.id },
                { externalId: asset.publicId },
                { position: asset.position }
              ]
            }
          });
          if (matches.length > 1)
            throw new Error("LessonFile duplicado o posición ocupada.");
          let resource = matches[0];
          const type = asset.kind === "pdf" ? "PDF" : "VIDEO_UPLOAD";
          if (
            resource &&
            (resource.fileId !== file.id ||
              resource.type !== type ||
              resource.position !== asset.position ||
              resource.externalId !== asset.publicId ||
              resource.originalUrl !== asset.url)
          )
            throw new Error("LessonFile existente incompatible.");
          if (!resource) {
            resource = await tx.lessonFile.create({
              data: {
                lessonId: asset.lessonId,
                fileId: file.id,
                type,
                title: asset.title,
                position: asset.position,
                provider: "cloudinary",
                externalId: asset.publicId,
                originalUrl: asset.url
              }
            });
            created.resources++;
            created.writes++;
          }
          records.push({
            lessonId: asset.lessonId,
            fileId: file.id,
            lessonFileId: resource.id,
            position: resource.position,
            publicId: file.publicId,
            url: file.url,
            bytes: file.size
          });
        }
        if (protectedBefore !== (await snapshot()))
          throw new Error(
            "Cambió S1, un recurso original, M1/M2 o progreso; se revierte la publicación."
          );
        const after = await tx.module.findUniqueOrThrow({
          where: { id: MODULE3_ID },
          include
        });
        if (
          after.lessons.length !== 4 ||
          after.lessons.some(
            (l, i) =>
              l.id !== MODULE3_SESSIONS[i].id ||
              new Set(l.lessonFiles.map((r) => r.position)).size !== l.lessonFiles.length
          )
        )
          throw new Error("Sesiones o posiciones incorrectas.");
        const course = await tx.course.findUniqueOrThrow({
          where: { id: LEARNING_PROGRAM.id },
          include: { modules: { include: { lessons: true } } }
        });
        const enrollments = await tx.enrollment.findMany({
          where: { courseId: course.id },
          include: { lessonProgresses: true }
        });
        for (const enrollment of enrollments) {
          const progress = learningProgress(course, enrollment.lessonProgresses);
          const existing = await tx.courseProgress.findUnique({
            where: { enrollmentId: enrollment.id }
          });
          if (
            !existing ||
            existing.totalLessons !== progress.totalLessons ||
            existing.completedLessons !== progress.completedLessons ||
            existing.percentage !== progress.percentage
          ) {
            await tx.courseProgress.upsert({
              where: { enrollmentId: enrollment.id },
              create: { enrollmentId: enrollment.id, ...progress },
              update: progress
            });
            created.writes++;
          }
        }
        return { created, records, protectedContentUnchanged: true };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 120000 }
    );
  }
}
