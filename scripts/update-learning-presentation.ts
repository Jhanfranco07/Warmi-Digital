import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);

async function main() {
  const { prisma } = await import("../shared/server/db/prisma");
  const { LEARNING_PROGRAM } = await import("../shared/learning/program");
  const { LearningProgramRepository } =
    await import("../shared/repositories/learning-program.repository");
  try {
    const moduleId = LEARNING_PROGRAM.modules[2].id;
    const current = await prisma.module.findUniqueOrThrow({
      where: { id: moduleId },
      include: {
        course: { select: { id: true, title: true, imageUrl: true, deletedAt: true } },
        lessons: {
          include: {
            lessonFiles: { include: { file: true }, orderBy: { position: "asc" } }
          },
          orderBy: { order: "asc" }
        }
      }
    });
    if (current.courseId !== LEARNING_PROGRAM.id || current.course.deletedAt)
      throw new Error("El módulo no está en el programa esperado.");
    console.log(
      JSON.stringify(
        {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME,
          course: current.course,
          module: { id: current.id, title: current.title, order: current.order },
          lessons: current.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.order,
            videos: lesson.lessonFiles
              .filter((r) => r.file?.mimeType === "video/mp4")
              .map((r) => ({
                id: r.id,
                fileId: r.fileId,
                position: r.position,
                publicId: r.file?.publicId
              }))
          }))
        },
        null,
        2
      )
    );
    if (!process.argv.includes("--apply")) return;
    if (process.env.CLOUDINARY_CLOUD_NAME !== "szhwzy4q")
      throw new Error("La cuenta Cloudinary no coincide.");
    const { getCloudinary } = await import("../shared/lib/cloudinary");
    const cloudinary = getCloudinary();
    const publicId = "warmi/courses/aprender-para-crecer-cover-v1";
    let image;
    try {
      image = await cloudinary.api.resource(publicId, { resource_type: "image" });
    } catch (error) {
      if ((error as { error?: { http_code?: number } }).error?.http_code !== 404)
        throw error;
      image = await cloudinary.uploader.upload(
        resolve("public/images/courses/aprender-para-crecer.webp"),
        { public_id: publicId, resource_type: "image", overwrite: false }
      );
    }
    if (!image.secure_url.startsWith("https://res.cloudinary.com/szhwzy4q/image/"))
      throw new Error("La portada no tiene un origen válido.");
    console.log(
      JSON.stringify(
        await new LearningProgramRepository().updatePresentation(image.secure_url),
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Error de actualización");
  process.exitCode = 1;
});
