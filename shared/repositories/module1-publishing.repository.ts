import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/server/db/prisma";
import { LEARNING_PROGRAM, learningProgress } from "@/shared/learning/program";
import {
  MODULE1_GMAIL_SUPPORT_ID,
  MODULE1_ID,
  MODULE1_INSTITUTIONS,
  MODULE1_SESSIONS,
  MODULE1_SUMMARY,
  MODULE1_SUPPORT_VIDEOS,
  MODULE1_VIDEOS,
  module1SessionText
} from "@/shared/learning/module1";
import { parseYouTubeVideoId } from "@/shared/lib/youtube";
import type { Module1Asset } from "@/shared/services/module1-publishing.service";

const legacyCourseId = LEARNING_PROGRAM.modules[0].previousCourseId;
const legacyModuleId = "c83cf0be-a744-4e27-b241-eb31359f36dd";
const includeLessons = {
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

export class Module1PublishingRepository {
  constructor(private readonly db = prisma) {}

  inspect() {
    return this.db.module.findUnique({
      where: { id: MODULE1_ID },
      include: includeLessons
    });
  }

  async publish(assets: Module1Asset[]) {
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Course" WHERE "id" = ${LEARNING_PROGRAM.id} FOR UPDATE`
        );
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Module" WHERE "id" = ${MODULE1_ID} FOR UPDATE`
        );
        const learningModule = await tx.module.findUnique({
          where: { id: MODULE1_ID },
          include: { course: true, ...includeLessons }
        });
        if (
          !learningModule ||
          learningModule.courseId !== LEARNING_PROGRAM.id ||
          learningModule.order !== 1 ||
          learningModule.course.deletedAt ||
          learningModule.course.status !== "PUBLISHED"
        )
          throw new Error("El destino no coincide con el Módulo 1 publicado.");
        const allowedLessons = new Set<string>([
          MODULE1_GMAIL_SUPPORT_ID,
          ...MODULE1_SESSIONS.map((item) => item.id)
        ]);
        if (learningModule.lessons.some((lesson) => !allowedLessons.has(lesson.id)))
          throw new Error(
            "Hay lecciones nuevas no inspeccionadas; no se altera su contenido."
          );
        const protectedWhere = { courseId: LEARNING_PROGRAM.id, id: { not: MODULE1_ID } };
        const before = JSON.stringify(
          await tx.module.findMany({
            where: protectedWhere,
            orderBy: { id: "asc" },
            include: includeLessons
          })
        );
        const protectedProgressBefore = JSON.stringify(
          await tx.lessonProgress.findMany({
            where: { lesson: { module: protectedWhere } },
            orderBy: { id: "asc" }
          })
        );
        let writes = 0;
        const records: object[] = [];
        const historicalIntro = await tx.lesson.findUnique({
          where: { id: MODULE1_GMAIL_SUPPORT_ID }
        });
        if (historicalIntro?.moduleId === MODULE1_ID) {
          const oldCourse = await tx.course.findUnique({ where: { id: legacyCourseId } });
          if (!oldCourse || oldCourse.deletedAt || oldCourse.status !== "PUBLISHED")
            throw new Error("Falta el curso histórico para conservar el apoyo de Gmail.");
          let legacyModule = await tx.module.findUnique({
            where: { id: legacyModuleId }
          });
          if (legacyModule && legacyModule.courseId !== legacyCourseId)
            throw new Error("ID histórico de apoyo ocupado.");
          if (!legacyModule) {
            legacyModule = await tx.module.create({
              data: {
                id: legacyModuleId,
                courseId: legacyCourseId,
                title: "Material de apoyo de Gmail",
                description:
                  "Introducción histórica de Gmail, conservada como material adicional.",
                order: 1
              }
            });
            writes++;
          }
          await tx.lesson.update({
            where: { id: historicalIntro.id },
            data: { moduleId: legacyModule.id }
          });
          writes++;
          records.push({
            kind: "historicalSupport",
            id: historicalIntro.id,
            movedToModuleId: legacyModule.id,
            resourcesPreserved: true
          });
        } else if (historicalIntro && historicalIntro.moduleId !== legacyModuleId) {
          throw new Error(
            "La introducción histórica cambió de ubicación; revisarla antes de publicar."
          );
        }
        const moduleData = {
          description: MODULE1_SUMMARY,
          durationMin: MODULE1_SESSIONS.reduce((sum, item) => sum + item.durationMin, 0)
        };
        if (differs(learningModule, moduleData)) {
          await tx.module.update({ where: { id: MODULE1_ID }, data: moduleData });
          writes++;
        }
        for (const session of MODULE1_SESSIONS) {
          const existing = await tx.lesson.findUnique({ where: { id: session.id } });
          if (existing && existing.moduleId !== MODULE1_ID)
            throw new Error("La sesión pertenece a otro módulo.");
          const data = {
            moduleId: MODULE1_ID,
            title: session.title,
            slug: session.slug,
            order: session.order,
            type: "TEXT" as const,
            content: module1SessionText(session.order),
            durationMin: session.durationMin
          };
          if (!existing) {
            await tx.lesson.create({ data: { id: session.id, ...data } });
            writes++;
          } else if (differs(existing, data)) {
            await tx.lesson.update({ where: { id: session.id }, data });
            writes++;
          }
          records.push({
            kind: "session",
            id: session.id,
            order: session.order,
            created: !existing
          });
        }
        const resource = async (
          lessonId: string,
          key: string,
          data: Omit<Prisma.LessonFileUncheckedCreateInput, "lessonId" | "id">
        ) => {
          const matches = await tx.lessonFile.findMany({
            where: {
              lessonId,
              OR: [
                { provider: data.provider, externalId: data.externalId },
                { title: data.title },
                ...(data.fileId ? [{ fileId: data.fileId }] : [])
              ]
            }
          });
          if (matches.length > 1) throw new Error(`Recursos duplicados previos: ${key}`);
          const existing = matches[0];
          if (existing && existing.fileId !== (data.fileId ?? null))
            throw new Error(`El recurso ${key} apunta a otro File.`);
          let result = existing;
          if (!result) {
            result = await tx.lessonFile.create({ data: { lessonId, ...data } });
            writes++;
          } else if (differs(result, data)) {
            result = await tx.lessonFile.update({ where: { id: result.id }, data });
            writes++;
          }
          records.push({
            kind: "resource",
            key,
            id: result.id,
            fileId: result.fileId,
            position: result.position,
            created: !existing
          });
        };
        for (const video of MODULE1_VIDEOS) {
          const asset = assets.find((item) => item.public_id === video.publicId)!;
          const matches = await tx.file.findMany({
            where: {
              OR: [
                { provider: "cloudinary", publicId: asset.public_id },
                { url: asset.secure_url }
              ]
            }
          });
          if (matches.length > 1) throw new Error(`File duplicado previo: ${video.key}`);
          let file = matches[0];
          const created = !file;
          if (
            file &&
            (file.provider !== "cloudinary" ||
              file.publicId !== asset.public_id ||
              file.url !== asset.secure_url ||
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
                ownerId: learningModule.course.facilitatorId,
                metadata: {
                  assetId: asset.asset_id,
                  durationSeconds: asset.duration,
                  learningModuleId: MODULE1_ID,
                  role: video.role
                }
              }
            });
            writes++;
          }
          records.push({
            kind: "file",
            key: video.key,
            id: file.id,
            publicId: file.publicId,
            url: file.url,
            created
          });
          await resource(MODULE1_SESSIONS[video.session - 1].id, video.key, {
            fileId: file.id,
            type: "VIDEO_UPLOAD",
            title: video.title,
            description:
              video.role === "additional"
                ? "Material adicional: otra forma de realizar esta acción."
                : "Video principal de este paso.",
            position: video.position,
            provider: "cloudinary",
            externalId: asset.public_id,
            originalUrl: asset.secure_url
          });
        }
        for (const [key, video] of Object.entries(MODULE1_SUPPORT_VIDEOS)) {
          await resource(MODULE1_SESSIONS[video.session - 1].id, key, {
            fileId: null,
            type: "VIDEO_YOUTUBE",
            title: video.title,
            description: `Video de apoyo de ${video.author}. Recurso temporal configurable en shared/learning/module1.ts. Necesita internet.`,
            position: video.position,
            provider: "YOUTUBE",
            externalId: parseYouTubeVideoId(video.url)!,
            originalUrl: video.url
          });
        }
        for (const [index, institution] of MODULE1_INSTITUTIONS.entries()) {
          await resource(MODULE1_SESSIONS[1].id, institution.key, {
            fileId: null,
            type: "EXTERNAL_LINK",
            title: institution.name,
            description: institution.description,
            position: 100 + index,
            provider: "module1",
            externalId: institution.key,
            originalUrl: institution.url
          });
        }
        await resource(MODULE1_SESSIONS[1].id, "artesanias-link", {
          fileId: null,
          type: "EXTERNAL_LINK",
          title: "Plataforma Artesanías del Perú",
          description: "Conoce artesanos y productos del país.",
          position: 104,
          provider: "module1",
          externalId: "artesanias-link",
          originalUrl: "https://www.artesaniasdelperu.gob.pe/"
        });
        if (historicalIntro)
          await resource(MODULE1_SESSIONS[0].id, "gmail-support", {
            fileId: null,
            type: "EXTERNAL_LINK",
            title: "¿Qué es Gmail?",
            description: "Introducción histórica de apoyo.",
            position: 50,
            provider: "warmi",
            externalId: historicalIntro.id,
            originalUrl: `/artesana/aprender/${legacyCourseId}/lecciones/${historicalIntro.id}`
          });
        const course = await tx.course.findUniqueOrThrow({
          where: { id: LEARNING_PROGRAM.id },
          include: { modules: { include: { lessons: true } } }
        });
        const enrollments = await tx.enrollment.findMany({
          where: { courseId: course.id },
          include: { lessonProgresses: true, courseProgress: true }
        });
        for (const enrollment of enrollments) {
          const data = learningProgress(course, enrollment.lessonProgresses);
          const progressData = {
            totalLessons: data.totalLessons,
            completedLessons: data.completedLessons,
            percentage: data.percentage
          };
          if (
            !enrollment.courseProgress ||
            differs(enrollment.courseProgress, progressData)
          ) {
            await tx.courseProgress.upsert({
              where: { enrollmentId: enrollment.id },
              create: { enrollmentId: enrollment.id, ...progressData },
              update: progressData
            });
            writes++;
          }
          if (enrollment.status === "COMPLETED" && data.percentage < 100) {
            await tx.enrollment.update({
              where: { id: enrollment.id },
              data: { status: "ACTIVE", completedAt: null }
            });
            writes++;
          }
        }
        const after = JSON.stringify(
          await tx.module.findMany({
            where: protectedWhere,
            orderBy: { id: "asc" },
            include: includeLessons
          })
        );
        const protectedProgressAfter = JSON.stringify(
          await tx.lessonProgress.findMany({
            where: { lesson: { module: protectedWhere } },
            orderBy: { id: "asc" }
          })
        );
        if (before !== after || protectedProgressBefore !== protectedProgressAfter)
          throw new Error("Otro módulo fue alterado; se revierte toda la publicación.");
        const sessions = await tx.lesson.findMany({
          where: { moduleId: MODULE1_ID },
          orderBy: { order: "asc" }
        });
        if (
          sessions.length !== 4 ||
          sessions.some(
            (item, index) =>
              item.id !== MODULE1_SESSIONS[index].id || item.order !== index + 1
          )
        )
          throw new Error(
            "Las cuatro sesiones no coinciden; se revierte la publicación."
          );
        return {
          writes,
          records,
          protectedModulesUnchanged: true,
          protectedLessonProgressUnchanged: true,
          sessions: sessions.map(({ id, title, order }) => ({ id, title, order }))
        };
      },
      { timeout: 120000, isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  }
}
