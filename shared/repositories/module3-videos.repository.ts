import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/server/db/prisma";
import { MODULE3_TITLE } from "@/shared/offline/module3-types";
import type {
  Module3Video,
  Module3ReplacementVideo
} from "@/shared/services/module3-videos.service";
import { LEARNING_PROGRAM } from "@/shared/learning/program";

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

  async repairReferences(videos: Module3ReplacementVideo[], apply: boolean) {
    if (
      videos.length !== 6 ||
      new Set(videos.map(({ fileId }) => fileId)).size !== 6 ||
      new Set(videos.map(({ lessonFileId }) => lessonFileId)).size !== 6
    )
      throw new Error("Se requieren exactamente seis referencias distintas.");
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Course" WHERE "id" = ${LEARNING_PROGRAM.id} FOR UPDATE`
        );
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Module" WHERE "id" = ${moduleId} FOR UPDATE`
        );
        const originalModule = await tx.module.findUnique({ where: { id: moduleId } });
        if (
          !originalModule ||
          originalModule.courseId !== LEARNING_PROGRAM.id ||
          originalModule.order !== 3
        )
          throw new Error("El destino no es el Modulo 3 de Aprender para crecer.");
        const originalLessons = await tx.lesson.findMany({
          where: { moduleId },
          orderBy: { id: "asc" }
        });
        const originalResources = await tx.lessonFile.findMany({
          where: { lesson: { moduleId } },
          orderBy: { id: "asc" }
        });
        const originalFiles = await tx.file.findMany({
          where: { id: { in: videos.map(({ fileId }) => fileId) } },
          orderBy: { id: "asc" }
        });
        const filesCount = await tx.file.count();
        const linksCount = await tx.lessonFile.count();
        const records = [];
        let writes = 0;
        for (const video of videos) {
          const file = originalFiles.find(({ id }) => id === video.fileId);
          const resource = originalResources.find(({ id }) => id === video.lessonFileId);
          const metadata = file?.metadata;
          if (
            !file ||
            !resource ||
            resource.fileId !== file.id ||
            resource.lessonId !== video.lessonId ||
            resource.title !== video.title ||
            resource.position !== video.position ||
            resource.type !== "VIDEO_UPLOAD" ||
            resource.provider !== "cloudinary" ||
            file.provider !== "cloudinary" ||
            file.type !== "VIDEO" ||
            file.mimeType !== "video/mp4" ||
            file.size !== video.bytes ||
            file.width !== video.width ||
            file.height !== video.height ||
            !metadata ||
            typeof metadata !== "object" ||
            Array.isArray(metadata) ||
            metadata.originalName !== `${video.name}.mp4` ||
            metadata.offlineModuleId !== moduleId ||
            typeof metadata.durationSeconds !== "number" ||
            Math.abs(metadata.durationSeconds - video.duration) > 0.1 ||
            ![`WARMI - VIDEOS/${video.name}`, video.public_id].includes(
              file.publicId ?? ""
            )
          )
            throw new Error(`El recurso o contenido original no coincide: ${video.name}`);
          const conflict = await tx.file.findFirst({
            where: {
              id: { not: file.id },
              OR: [
                { provider: "cloudinary", publicId: video.public_id },
                { url: video.secure_url }
              ]
            }
          });
          if (conflict) throw new Error(`Ya existe otro File para ${video.name}.`);
          if (
            file.publicId !== video.public_id ||
            file.url !== video.secure_url ||
            metadata.assetId !== video.asset_id
          ) {
            if (apply)
              await tx.file.update({
                where: { id: file.id },
                data: {
                  publicId: video.public_id,
                  url: video.secure_url,
                  metadata: { ...metadata, assetId: video.asset_id }
                }
              });
            writes++;
          }
          if (
            resource.externalId !== video.public_id ||
            resource.originalUrl !== video.secure_url
          ) {
            if (apply)
              await tx.lessonFile.update({
                where: { id: resource.id },
                data: {
                  externalId: video.public_id,
                  originalUrl: video.secure_url
                }
              });
            writes++;
          }
          records.push({
            name: video.name,
            fileId: file.id,
            lessonFileId: resource.id,
            position: resource.position,
            publicId: video.public_id,
            url: video.secure_url,
            bytes: video.bytes
          });
        }
        // Compare immutable fields, including every existing resource outside the six authorized references.
        const stableResources = (resources: typeof originalResources) =>
          resources.map((resource) => {
            if (!videos.some(({ lessonFileId }) => lessonFileId === resource.id))
              return resource;
            return Object.fromEntries(
              Object.entries(resource).filter(
                ([key]) => !["externalId", "originalUrl", "updatedAt"].includes(key)
              )
            );
          });
        const stableFiles = (files: typeof originalFiles) =>
          files.map((file) => {
            const stable = Object.fromEntries(
              Object.entries(file).filter(
                ([key]) => !["publicId", "url", "updatedAt", "metadata"].includes(key)
              )
            );
            const metadata = Object.fromEntries(
              Object.entries(file.metadata as Prisma.JsonObject).filter(
                ([key]) => key !== "assetId"
              )
            );
            return { ...stable, metadata };
          });
        const afterModule = await tx.module.findUnique({ where: { id: moduleId } });
        const afterLessons = await tx.lesson.findMany({
          where: { moduleId },
          orderBy: { id: "asc" }
        });
        const afterResources = await tx.lessonFile.findMany({
          where: { lesson: { moduleId } },
          orderBy: { id: "asc" }
        });
        const afterFiles = await tx.file.findMany({
          where: { id: { in: originalFiles.map(({ id }) => id) } },
          orderBy: { id: "asc" }
        });
        if (
          JSON.stringify(originalModule) !== JSON.stringify(afterModule) ||
          JSON.stringify(originalLessons) !== JSON.stringify(afterLessons) ||
          JSON.stringify(stableResources(originalResources)) !==
            JSON.stringify(stableResources(afterResources)) ||
          JSON.stringify(stableFiles(originalFiles)) !==
            JSON.stringify(stableFiles(afterFiles)) ||
          filesCount !== (await tx.file.count()) ||
          linksCount !== (await tx.lessonFile.count())
        )
          throw new Error(
            "Cambios fuera de las referencias autorizadas; se cancelo la operacion."
          );
        return {
          mode: apply ? "apply" : "dry-run",
          writes,
          filesCreated: 0,
          lessonFilesCreated: 0,
          identitiesAndContentPreserved: true,
          bytes: videos.reduce((sum, video) => sum + video.bytes, 0),
          records
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 }
    );
  }

  async link(videos: Module3Video[]) {
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Module" WHERE "id" = ${moduleId} FOR UPDATE`
        );
        const learningModule = await tx.module.findUnique({ where: { id: moduleId } });
        if (!learningModule) throw new Error("No existe el módulo autorizado.");
        const courseId = learningModule.courseId;
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Course" WHERE "id" = ${courseId} FOR UPDATE`
        );
        const course = await tx.course.findUnique({ where: { id: courseId } });
        if (
          !course ||
          course.deletedAt ||
          ![LEARNING_PROGRAM.id, LEARNING_PROGRAM.modules[2].previousCourseId].some(
            (id) => id === course.id
          ) ||
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
