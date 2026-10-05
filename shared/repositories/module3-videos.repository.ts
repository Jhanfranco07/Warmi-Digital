import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/server/db/prisma";
import { MODULE3_TITLE } from "@/shared/offline/module3-types";
import type { Module3Video } from "@/shared/services/module3-videos.service";

const courseId = "3889134e-620b-40db-98cf-8f6b2a0c43ec";
const moduleId = "6c96bcdf-0b41-48d2-bdcd-394d06acd9d2";

export class Module3VideosRepository {
  constructor(private readonly db = prisma) {}

  inspect() {
    return this.db.module.findUnique({
      where: { id: moduleId },
      include: {
        course: true,
        lessons: {
          orderBy: { order: "asc" },
          include: {
            lessonFiles: { orderBy: { position: "asc" }, include: { file: true } }
          }
        }
      }
    });
  }

  async link(videos: Module3Video[]) {
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Course" WHERE "id" = ${courseId} FOR UPDATE`
        );
        const course = await tx.course.findUnique({ where: { id: courseId } });
        const learningModule = await tx.module.findUnique({ where: { id: moduleId } });
        if (
          !course ||
          course.deletedAt ||
          course.title !== "Aprende a usar WhatsApp Business para tu negocio" ||
          !learningModule ||
          learningModule.courseId !== courseId ||
          learningModule.title !== MODULE3_TITLE ||
          learningModule.order !== 3
        )
          throw new Error("El módulo o curso no coincide con el destino autorizado.");
        const lessons = await tx.lesson.findMany({
          where: { module: { courseId } },
          orderBy: { id: "asc" }
        });
        const originalResources = await tx.lessonFile.findMany({
          where: { lesson: { module: { courseId } } },
          orderBy: { id: "asc" }
        });
        const records = [];
        for (const video of videos) {
          const lesson = lessons.find((item) => item.id === video.lessonId);
          const expectedTitle =
            video.name === "video07" || video.name === "video09"
              ? "Sesión 2: Llega a nuevos clientes"
              : "Sesión 1: Publica tu arte en redes";
          if (!lesson || lesson.moduleId !== moduleId || lesson.title !== expectedTitle)
            throw new Error("La sesión destino cambió; no se vinculó el video.");
          const matches = await tx.file.findMany({
            where: {
              OR: [
                { provider: "cloudinary", publicId: video.public_id },
                { url: video.secure_url }
              ]
            }
          });
          if (matches.length > 1)
            throw new Error(`Hay archivos duplicados previos: ${video.name}`);
          let file = matches[0];
          const fileCreated = !file;
          if (
            file &&
            (file.provider !== "cloudinary" ||
              file.publicId !== video.public_id ||
              file.url !== video.secure_url ||
              file.mimeType !== "video/mp4" ||
              file.type !== "VIDEO" ||
              file.size !== video.bytes)
          )
            throw new Error(`El File existente no coincide: ${video.name}`);
          if (!file)
            file = await tx.file.create({
              data: {
                provider: "cloudinary",
                publicId: video.public_id,
                url: video.secure_url,
                mimeType: "video/mp4",
                type: "VIDEO",
                size: video.bytes,
                width: video.width,
                height: video.height,
                ownerId: course.facilitatorId,
                metadata: {
                  assetId: video.asset_id,
                  durationSeconds: video.duration,
                  offlineModuleId: moduleId,
                  originalName: `${video.name}.mp4`
                }
              }
            });
          const links = await tx.lessonFile.findMany({
            where: {
              lessonId: lesson.id,
              OR: [
                { fileId: file.id },
                { title: video.title },
                { provider: "cloudinary", externalId: video.public_id }
              ]
            }
          });
          if (links.length > 1)
            throw new Error(`Hay vínculos duplicados previos: ${video.name}`);
          let resource = links[0];
          const lessonFileCreated = !resource;
          if (
            resource &&
            (resource.fileId !== file.id ||
              resource.type !== "VIDEO_UPLOAD" ||
              resource.title !== video.title)
          )
            throw new Error(`El recurso existente no coincide: ${video.name}`);
          if (!resource) {
            const last = await tx.lessonFile.aggregate({
              where: { lessonId: lesson.id },
              _max: { position: true }
            });
            resource = await tx.lessonFile.create({
              data: {
                lessonId: lesson.id,
                fileId: file.id,
                title: video.title,
                description:
                  "Video de formación. Disponible sin conexión al descargar el módulo.",
                type: "VIDEO_UPLOAD",
                provider: "cloudinary",
                externalId: video.public_id,
                originalUrl: video.secure_url,
                position: (last._max.position ?? -1) + 1
              }
            });
          }
          records.push({
            name: video.name,
            title: video.title,
            lessonId: lesson.id,
            fileId: file.id,
            lessonFileId: resource.id,
            position: resource.position,
            fileCreated,
            lessonFileCreated,
            publicId: file.publicId,
            url: file.url,
            bytes: file.size
          });
        }
        const afterLessons = await tx.lesson.findMany({
          where: { module: { courseId } },
          orderBy: { id: "asc" }
        });
        const afterResources = await tx.lessonFile.findMany({
          where: { id: { in: originalResources.map((resource) => resource.id) } },
          orderBy: { id: "asc" }
        });
        if (
          JSON.stringify(lessons) !== JSON.stringify(afterLessons) ||
          JSON.stringify(originalResources) !== JSON.stringify(afterResources)
        )
          throw new Error(
            "Las lecciones o recursos existentes cambiaron; se canceló la operación."
          );
        return {
          records,
          originalsUnchanged: true,
          filesCreated: records.filter((item) => item.fileCreated).length,
          lessonFilesCreated: records.filter((item) => item.lessonFileCreated).length,
          bytes: records.reduce((sum, record) => sum + record.bytes, 0)
        };
      },
      { timeout: 30000 }
    );
  }
}
