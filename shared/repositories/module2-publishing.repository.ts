import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/server/db/prisma";
import { LEARNING_PROGRAM, learningProgress } from "@/shared/learning/program";
import {
  MODULE2_ID,
  MODULE2_TITLE,
  MODULE2_SUMMARY,
  MODULE2_SESSIONS,
  MODULE2_VIDEOS,
  module2SessionText
} from "@/shared/learning/module2";
import type { Module2Asset } from "@/shared/services/module2-publishing.service";

const protectedInclude = {
  lessons: {
    orderBy: { id: "asc" as const },
    include: { lessonFiles: { orderBy: { id: "asc" as const }, include: { file: true } } }
  }
};
function differs(current: object, data: object) {
  return Object.entries(data).some(
    ([key, value]) =>
      JSON.stringify(current[key as keyof typeof current]) !== JSON.stringify(value)
  );
}
export class Module2PublishingRepository {
  constructor(private readonly db = prisma) {}
  inspect() {
    return this.db.module.findMany({
      where: { OR: [{ id: MODULE2_ID }, { courseId: LEARNING_PROGRAM.id, order: 2 }] },
      include: protectedInclude
    });
  }
  async publish(assets: Module2Asset[]) {
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Course" WHERE "id" = ${LEARNING_PROGRAM.id} FOR UPDATE`
        );
        const course = await tx.course.findUnique({ where: { id: LEARNING_PROGRAM.id } });
        if (!course || course.deletedAt || course.status !== "PUBLISHED")
          throw new Error("El programa publicado no está disponible.");
        const candidates = await tx.module.findMany({
          where: { OR: [{ id: MODULE2_ID }, { courseId: course.id, order: 2 }] },
          include: protectedInclude
        });
        if (
          candidates.length > 1 ||
          candidates.some(
            (item) =>
              item.id !== MODULE2_ID ||
              item.courseId !== course.id ||
              item.order !== 2 ||
              item.title !== MODULE2_TITLE
          )
        )
          throw new Error(
            "Hay un módulo previo no inspeccionado; no se duplica ni mueve."
          );
        const learningModule = candidates[0];
        if (
          learningModule?.lessons.some(
            (item) => !MODULE2_SESSIONS.some((session) => session.id === item.id)
          )
        )
          throw new Error("Existen lecciones no inspeccionadas en M2.");
        const protectedWhere = { courseId: course.id, id: { not: MODULE2_ID } };
        const snapshot = async () =>
          JSON.stringify({
            modules: await tx.module.findMany({
              where: protectedWhere,
              orderBy: { id: "asc" },
              include: protectedInclude
            }),
            progress: await tx.lessonProgress.findMany({
              where: { lesson: { module: protectedWhere } },
              orderBy: { id: "asc" }
            })
          });
        const before = await snapshot();
        let writes = 0;
        let filesCreated = 0;
        let lessonFilesCreated = 0;
        let lessonsCreated = 0;
        const moduleData = {
          title: MODULE2_TITLE,
          description: MODULE2_SUMMARY,
          durationMin: MODULE2_SESSIONS.reduce(
            (sum, session) => sum + session.durationMin,
            0
          )
        };
        if (!learningModule) {
          await tx.module.create({
            data: { id: MODULE2_ID, courseId: course.id, order: 2, ...moduleData }
          });
          writes++;
        } else if (differs(learningModule, moduleData)) {
          await tx.module.update({ where: { id: MODULE2_ID }, data: moduleData });
          writes++;
        }
        for (const session of MODULE2_SESSIONS) {
          const existing = await tx.lesson.findUnique({ where: { id: session.id } });
          if (existing && existing.moduleId !== MODULE2_ID)
            throw new Error("La sesión pertenece a otro módulo.");
          const data = {
            moduleId: MODULE2_ID,
            title: session.title,
            order: session.order,
            slug: session.slug,
            type: "TEXT" as const,
            content: module2SessionText(session.order),
            durationMin: session.durationMin
          };
          if (!existing) {
            await tx.lesson.create({ data: { id: session.id, ...data } });
            lessonsCreated++;
            writes++;
          } else if (differs(existing, data)) {
            await tx.lesson.update({ where: { id: session.id }, data });
            writes++;
          }
        }
        const records = [];
        for (const video of MODULE2_VIDEOS) {
          const asset = assets.find((item) => item.public_id === video.publicId)!;
          const matches = await tx.file.findMany({
            where: {
              OR: [
                { provider: "cloudinary", publicId: asset.public_id },
                { url: asset.secure_url }
              ]
            }
          });
          if (matches.length > 1)
            throw new Error(`File duplicados previos: ${video.key}`);
          let file = matches[0];
          const fileCreated = !file;
          if (
            file &&
            (file.publicId !== asset.public_id ||
              file.url !== asset.secure_url ||
              file.provider !== "cloudinary" ||
              file.mimeType !== "video/mp4" ||
              file.type !== "VIDEO" ||
              file.size !== asset.bytes)
          )
            throw new Error(`El File existente no coincide: ${video.key}`);
          if (!file) {
            file = await tx.file.create({
              data: {
                provider: "cloudinary",
                publicId: asset.public_id,
                url: asset.secure_url,
                type: "VIDEO",
                mimeType: "video/mp4",
                size: asset.bytes,
                width: asset.width,
                height: asset.height,
                ownerId: course.facilitatorId,
                metadata: {
                  assetId: asset.asset_id,
                  durationSeconds: asset.duration,
                  learningModuleId: MODULE2_ID,
                  role: video.role
                }
              }
            });
            filesCreated++;
            writes++;
          }
          const lessonId = MODULE2_SESSIONS[video.session - 1].id;
          const links = await tx.lessonFile.findMany({
            where: {
              lessonId,
              OR: [
                { fileId: file.id },
                { title: video.title },
                { provider: "cloudinary", externalId: asset.public_id }
              ]
            }
          });
          if (links.length > 1)
            throw new Error(`LessonFile duplicados previos: ${video.key}`);
          let link = links[0];
          const lessonFileCreated = !link;
          if (link && link.fileId !== file.id)
            throw new Error("El vínculo apunta a otro File.");
          const data = {
            fileId: file.id,
            title: video.title,
            type: "VIDEO_UPLOAD" as const,
            position: video.position,
            description:
              video.role === "additional"
                ? "Material adicional: alternativa desde navegador."
                : "Video principal de este paso.",
            provider: "cloudinary",
            externalId: asset.public_id,
            originalUrl: asset.secure_url
          };
          if (!link) {
            link = await tx.lessonFile.create({ data: { lessonId, ...data } });
            lessonFilesCreated++;
            writes++;
          } else if (differs(link, data)) {
            link = await tx.lessonFile.update({ where: { id: link.id }, data });
            writes++;
          }
          records.push({
            key: video.key,
            fileId: file.id,
            lessonFileId: link.id,
            position: link.position,
            publicId: file.publicId,
            url: file.url,
            fileCreated,
            lessonFileCreated
          });
        }
        const updatedCourse = await tx.course.findUniqueOrThrow({
          where: { id: course.id },
          include: { modules: { include: { lessons: true } } }
        });
        for (const enrollment of await tx.enrollment.findMany({
          where: { courseId: course.id },
          include: { lessonProgresses: true, courseProgress: true }
        })) {
          const progress = learningProgress(updatedCourse, enrollment.lessonProgresses);
          if (
            !enrollment.courseProgress ||
            differs(enrollment.courseProgress, progress)
          ) {
            await tx.courseProgress.upsert({
              where: { enrollmentId: enrollment.id },
              create: { enrollmentId: enrollment.id, ...progress },
              update: progress
            });
            writes++;
          }
          if (enrollment.status === "COMPLETED" && progress.percentage < 100) {
            await tx.enrollment.update({
              where: { id: enrollment.id },
              data: { status: "ACTIVE", completedAt: null }
            });
            writes++;
          }
        }
        if (before !== (await snapshot()))
          throw new Error(
            "Se alteró M1/M3/M4 o su progreso; se revierte toda la publicación."
          );
        const sessions = await tx.lesson.findMany({
          where: { moduleId: MODULE2_ID },
          orderBy: { order: "asc" }
        });
        if (
          sessions.length !== 4 ||
          sessions.some(
            (item, index) =>
              item.id !== MODULE2_SESSIONS[index].id || item.order !== index + 1
          )
        )
          throw new Error(
            "Las cuatro sesiones no coinciden; se revierte la publicación."
          );
        return {
          writes,
          moduleCreated: !learningModule,
          lessonsCreated,
          filesCreated,
          lessonFilesCreated,
          records,
          protectedModulesAndProgressUnchanged: true
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 120000 }
    );
  }
}
