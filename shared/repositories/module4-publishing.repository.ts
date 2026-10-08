import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/server/db/prisma";
import { LEARNING_PROGRAM, learningProgress } from "@/shared/learning/program";
import {
  MODULE4_ID,
  MODULE4_SESSIONS,
  MODULE4_IMAGES,
  module4LessonText
} from "@/shared/learning/module4";
import type { Module4Asset } from "@/shared/services/module4-publishing.service";
const protectedInclude = {
  lessons: {
    orderBy: { order: "asc" as const },
    include: {
      lessonFiles: { orderBy: { position: "asc" as const }, include: { file: true } }
    }
  }
};
export class Module4PublishingRepository {
  constructor(private readonly db = prisma) {}
  publish(assets: Module4Asset[]) {
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Course" WHERE "id" = ${LEARNING_PROGRAM.id} FOR UPDATE`
        );
        const snapshot = async () =>
          JSON.stringify({
            modules: await tx.module.findMany({
              where: { courseId: LEARNING_PROGRAM.id, id: { not: MODULE4_ID } },
              orderBy: { id: "asc" },
              include: protectedInclude
            }),
            progress: await tx.lessonProgress.findMany({
              where: { enrollment: { courseId: LEARNING_PROGRAM.id } },
              orderBy: { id: "asc" }
            }),
            enrollments: await tx.enrollment.findMany({
              where: { courseId: LEARNING_PROGRAM.id },
              orderBy: { id: "asc" }
            })
          });
        const before = await snapshot(),
          created = { modules: 0, lessons: 0, files: 0, resources: 0, writes: 0 };
        const collisions = await tx.module.findMany({
          where: { courseId: LEARNING_PROGRAM.id, order: 4, id: { not: MODULE4_ID } }
        });
        if (collisions.length)
          throw new Error("Order 4 ya está ocupado; no se reemplaza.");
        let learningModule = await tx.module.findUnique({ where: { id: MODULE4_ID } });
        if (
          learningModule &&
          (learningModule.courseId !== LEARNING_PROGRAM.id || learningModule.order !== 4)
        )
          throw new Error("Módulo existente incompatible.");
        if (!learningModule) {
          learningModule = await tx.module.create({
            data: {
              id: MODULE4_ID,
              courseId: LEARNING_PROGRAM.id,
              order: 4,
              durationMin: 45,
              title: LEARNING_PROGRAM.modules[3].title,
              description:
                "Cuento mi historia, presento el valor de mi artesanía y practico una venta con autonomía."
            }
          });
          created.modules++;
          created.writes++;
        }
        if (learningModule.durationMin !== 45) {
          await tx.module.update({
            where: { id: MODULE4_ID },
            data: { durationMin: 45 }
          });
          created.writes++;
        }
        for (const session of MODULE4_SESSIONS) {
          const data = {
            title: session.title,
            durationMin: session.order === 4 ? 15 : 10,
            content: module4LessonText(session.order)
          };
          const existing = await tx.lesson.findUnique({ where: { id: session.id } });
          if (
            existing &&
            (existing.moduleId !== MODULE4_ID || existing.order !== session.order)
          )
            throw new Error("Sesión existente incompatible.");
          if (!existing) {
            await tx.lesson.create({
              data: {
                id: session.id,
                moduleId: MODULE4_ID,
                order: session.order,
                slug: `module-4-session-${session.order}`,
                type: "TEXT",
                ...data
              }
            });
            created.lessons++;
            created.writes++;
          } else if (
            existing.title !== data.title ||
            existing.content !== data.content ||
            existing.durationMin !== data.durationMin
          ) {
            await tx.lesson.update({ where: { id: session.id }, data });
            created.writes++;
          }
        }
        const files = new Map<string, string>();
        for (const asset of assets) {
          const matches = await tx.file.findMany({
            where: {
              OR: [
                { provider: "cloudinary", publicId: asset.publicId },
                { url: asset.url }
              ]
            }
          });
          if (matches.length > 1) throw new Error("File duplicado.");
          let file = matches[0];
          if (
            file &&
            (file.publicId !== asset.publicId ||
              file.url !== asset.url ||
              file.size !== asset.bytes ||
              file.mimeType !== "image/webp" ||
              file.width !== asset.width ||
              file.height !== asset.height)
          )
            throw new Error("File existente incompatible.");
          if (!file) {
            file = await tx.file.create({
              data: {
                url: asset.url,
                provider: "cloudinary",
                publicId: asset.publicId,
                type: "IMAGE",
                mimeType: "image/webp",
                size: asset.bytes,
                width: asset.width,
                height: asset.height,
                altText: MODULE4_IMAGES.find((i) => i.key === asset.key)!.alt,
                metadata: {
                  sha256: asset.sha256,
                  sourcePage: asset.page,
                  sourceXref: asset.xref,
                  crop: asset.crop
                }
              }
            });
            created.files++;
            created.writes++;
          }
          files.set(asset.key, file.id);
        }
        const records = [];
        for (const session of MODULE4_SESSIONS) {
          for (const [i, key] of session.images.entries()) {
            const asset = assets.find((a) => a.key === key)!;
            const fileId = files.get(key)!;
            const position = (i + 1) * 10;
            const matches = await tx.lessonFile.findMany({
              where: {
                lessonId: session.id,
                OR: [{ fileId }, { position }, { externalId: asset.publicId }]
              }
            });
            if (matches.length > 1)
              throw new Error("LessonFile duplicado o posición ocupada.");
            let relation = matches[0];
            if (
              relation &&
              (relation.fileId !== fileId ||
                relation.position !== position ||
                relation.type !== "IMAGE" ||
                relation.originalUrl !== asset.url ||
                relation.externalId !== asset.publicId)
            )
              throw new Error("Relación incompatible.");
            if (!relation) {
              relation = await tx.lessonFile.create({
                data: {
                  lessonId: session.id,
                  fileId,
                  position,
                  type: "IMAGE",
                  title: MODULE4_IMAGES.find((a) => a.key === key)!.alt,
                  provider: "cloudinary",
                  externalId: asset.publicId,
                  originalUrl: asset.url
                }
              });
              created.resources++;
              created.writes++;
            }
            records.push({
              lessonId: session.id,
              fileId,
              lessonFileId: relation.id,
              position,
              key,
              publicId: asset.publicId,
              url: asset.url,
              bytes: asset.bytes
            });
          }
        }
        const final = await tx.module.findUniqueOrThrow({
          where: { id: MODULE4_ID },
          include: protectedInclude
        });
        if (
          final.lessons.length !== 4 ||
          final.lessons.some(
            (l, i) =>
              l.id !== MODULE4_SESSIONS[i].id ||
              l.lessonFiles.length !== MODULE4_SESSIONS[i].images.length ||
              new Set(l.lessonFiles.map((r) => r.position)).size !== l.lessonFiles.length
          )
        )
          throw new Error("Estructura final inesperada.");
        if ((await snapshot()) !== before)
          throw new Error(
            "Cambió contenido, progreso o inscripción protegidos; se revierte."
          );
        const course = await tx.course.findUniqueOrThrow({
          where: { id: LEARNING_PROGRAM.id },
          include: { modules: { include: { lessons: true } } }
        });
        const enrollments = await tx.enrollment.findMany({
          where: { courseId: course.id },
          include: { lessonProgresses: true }
        });
        for (const e of enrollments) {
          const progress = learningProgress(course, e.lessonProgresses);
          const current = await tx.courseProgress.findUnique({
            where: { enrollmentId: e.id }
          });
          if (
            !current ||
            current.totalLessons !== progress.totalLessons ||
            current.completedLessons !== progress.completedLessons ||
            current.percentage !== progress.percentage
          ) {
            await tx.courseProgress.upsert({
              where: { enrollmentId: e.id },
              create: { enrollmentId: e.id, ...progress },
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
