import { createRequire } from "node:module";
import { basename, resolve } from "node:path";
import { stat } from "node:fs/promises";
import { FileType, LessonResourceType, PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { isOfflineModule } from "../shared/offline/module3-types";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);

async function main() {
  const [lessonId, inputPath, title] = process.argv.slice(2);
  if (!lessonId || !inputPath || !title || !inputPath.toLowerCase().endsWith(".mp4")) {
    throw new Error(
      'Uso: pnpm exec tsx scripts/import-module3-video.ts <lessonId> "<archivo.mp4>" "<titulo>"'
    );
  }
  const path = resolve(inputPath);
  const info = await stat(path);
  if (!info.isFile() || info.size === 0 || info.size > 100 * 1024 * 1024)
    throw new Error("El MP4 debe pesar entre 1 byte y 100 MB.");
  const db = new PrismaClient();
  let uploadedId: string | undefined;
  try {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } }
    });
    if (!lesson || !isOfflineModule(lesson.module.id) || lesson.module.course.deletedAt) {
      throw new Error(
        "La lección debe pertenecer al Módulo 3 existente con capacidad offline."
      );
    }
    const duplicate = await db.lessonFile.findFirst({
      where: { lessonId, type: "VIDEO_UPLOAD", title }
    });
    if (duplicate) throw new Error("Ya existe un video con este título en la lección.");
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    const uploaded = await cloudinary.uploader.upload(path, {
      resource_type: "video",
      folder: `warmi/module3/${lesson.module.id}`,
      format: "mp4",
      transformation: [{ video_codec: "h264", audio_codec: "aac" }]
    });
    uploadedId = uploaded.public_id;
    await db.$transaction(async (tx) => {
      const last = await tx.lessonFile.findFirst({
        where: { lessonId },
        orderBy: { position: "desc" },
        select: { position: true }
      });
      await tx.lessonFile.create({
        data: {
          lesson: { connect: { id: lessonId } },
          title,
          type: LessonResourceType.VIDEO_UPLOAD,
          position: (last?.position ?? -1) + 1,
          file: {
            create: {
              url: uploaded.secure_url,
              provider: "cloudinary",
              publicId: uploaded.public_id,
              type: FileType.VIDEO,
              mimeType: "video/mp4",
              size: uploaded.bytes,
              ownerId: lesson.module.course.facilitatorId,
              metadata: {
                originalName: basename(path),
                offlineModuleId: lesson.module.id
              }
            }
          }
        }
      });
    });
    uploadedId = undefined;
    console.log("Video vinculado a la lección del Módulo 3.");
  } finally {
    if (uploadedId)
      await cloudinary.uploader.destroy(uploadedId, { resource_type: "video" });
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "No se pudo importar el video.");
  process.exitCode = 1;
});
