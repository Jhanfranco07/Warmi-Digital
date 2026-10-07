import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/server/db/prisma";
import { LEARNING_PROGRAM } from "@/shared/learning/program";
import {
  MODULE3_SESSION1_ID,
  MODULE3_SESSION1_TOPICS
} from "@/shared/learning/module3-session1";
import type { Module3GuideAsset } from "@/shared/services/module3-guides.service";

export class Module3GuidesRepository {
  constructor(private readonly db = prisma) {}
  inspect() {
    return this.db.lessonFile.findMany({
      where: { lessonId: MODULE3_SESSION1_ID },
      orderBy: { position: "asc" },
      select: { id: true, title: true, position: true, fileId: true }
    });
  }
  publish(assets: Module3GuideAsset[]) {
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Lesson" WHERE "id" = ${MODULE3_SESSION1_ID} FOR UPDATE`
        );
        const lesson = await tx.lesson.findUniqueOrThrow({
          where: { id: MODULE3_SESSION1_ID },
          include: {
            module: { include: { course: true } },
            lessonFiles: { include: { file: true }, orderBy: { id: "asc" } }
          }
        });
        if (
          lesson.module.id !== LEARNING_PROGRAM.modules[2].id ||
          lesson.module.courseId !== LEARNING_PROGRAM.id ||
          lesson.order !== 1
        )
          throw new Error("La sesión no pertenece al Módulo 3 del programa.");
        const originalIds = lesson.lessonFiles.map((item) => item.id);
        const protectedSnapshot = async () =>
          JSON.stringify({
            modules: await tx.module.findMany({
              where: { courseId: LEARNING_PROGRAM.id },
              orderBy: { id: "asc" }
            }),
            lessons: await tx.lesson.findMany({
              where: { module: { courseId: LEARNING_PROGRAM.id } },
              orderBy: { id: "asc" },
              include: {
                lessonFiles: {
                  where: {
                    OR: [
                      { lessonId: { not: MODULE3_SESSION1_ID } },
                      { id: { in: originalIds } }
                    ]
                  },
                  orderBy: { id: "asc" },
                  include: { file: true }
                }
              }
            })
          });
        const before = await protectedSnapshot();
        let filesCreated = 0,
          lessonFilesCreated = 0;
        const records = [];
        for (const [index, asset] of assets.entries()) {
          const topic = MODULE3_SESSION1_TOPICS[index];
          const matches = await tx.file.findMany({
            where: {
              OR: [
                { provider: "cloudinary", publicId: asset.publicId },
                { url: asset.url }
              ]
            }
          });
          if (matches.length > 1) throw new Error(`File duplicado: ${asset.key}`);
          let file = matches[0];
          if (
            file &&
            (file.provider !== "cloudinary" ||
              file.publicId !== asset.publicId ||
              file.url !== asset.url ||
              file.size !== asset.bytes ||
              file.type !== "DOCUMENT" ||
              file.mimeType !== "application/pdf")
          )
            throw new Error(`File existente inesperado: ${asset.key}`);
          if (!file) {
            file = await tx.file.create({
              data: {
                provider: "cloudinary",
                publicId: asset.publicId,
                url: asset.url,
                type: "DOCUMENT",
                mimeType: "application/pdf",
                size: asset.bytes,
                ownerId: lesson.module.course.facilitatorId,
                metadata: {
                  originalName: asset.filename,
                  assetId: asset.assetId,
                  sha256: asset.sha256,
                  sourceSha256: asset.sourceSha256,
                  sourcePages: asset.sourcePages,
                  pages: asset.pages,
                  extractionMode: asset.mode
                }
              }
            });
            filesCreated++;
          }
          const links = await tx.lessonFile.findMany({
            where: {
              lessonId: lesson.id,
              OR: [
                { fileId: file.id },
                { title: topic.guideTitle },
                { externalId: asset.publicId, provider: "cloudinary" }
              ]
            }
          });
          if (links.length > 1) throw new Error(`LessonFile duplicado: ${asset.key}`);
          let link = links[0];
          const position = index + 10;
          if (
            link &&
            (link.provider !== "cloudinary" ||
              link.externalId !== asset.publicId ||
              link.fileId !== file.id ||
              link.position !== position ||
              link.type !== "PDF" ||
              link.title !== topic.guideTitle ||
              link.originalUrl !== asset.url)
          )
            throw new Error(`LessonFile existente inesperado: ${asset.key}`);
          if (!link) {
            if (await tx.lessonFile.count({ where: { lessonId: lesson.id, position } }))
              throw new Error(`Posición ocupada: ${position}`);
            link = await tx.lessonFile.create({
              data: {
                lessonId: lesson.id,
                fileId: file.id,
                type: "PDF",
                title: topic.guideTitle,
                description: `${asset.pages} ${asset.pages === 1 ? "página" : "páginas"}. Guía paso a paso para tu celular.`,
                position,
                provider: "cloudinary",
                externalId: asset.publicId,
                originalUrl: asset.url
              }
            });
            lessonFilesCreated++;
          }
          records.push({
            key: asset.key,
            fileId: file.id,
            lessonFileId: link.id,
            position: link.position,
            publicId: file.publicId,
            url: file.url,
            bytes: file.size
          });
        }
        if (before !== (await protectedSnapshot()))
          throw new Error("Se alteró contenido existente; se revierte la publicación.");
        return {
          filesCreated,
          lessonFilesCreated,
          writes: filesCreated + lessonFilesCreated,
          existingContentUnchanged: true,
          records
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 120000 }
    );
  }
}
