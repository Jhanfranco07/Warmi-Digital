import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);

async function main() {
  const { prisma } = await import("../shared/server/db/prisma");
  const { getCloudinary } = await import("../shared/lib/cloudinary");
  if (process.env.CLOUDINARY_CLOUD_NAME !== "szhwzy4q")
    throw new Error("Cuenta Cloudinary inesperada.");
  try {
    const cloud = getCloudinary();
    let cursor: string | undefined;
    const videos: unknown[] = [];
    if (!process.argv.includes("--db-only"))
      do {
        const page = await cloud.api.resources({
          resource_type: "video",
          type: "upload",
          max_results: 500,
          next_cursor: cursor
        });
        for (const asset of page.resources) {
          if (
            !/M1[-_ ]S[1234]/i.test(
              JSON.stringify([
                asset.public_id,
                asset.display_name,
                asset.asset_folder,
                asset.original_filename
              ])
            )
          )
            continue;
          const item = await cloud.api.resource(asset.public_id, {
            resource_type: "video",
            media_metadata: true
          });
          videos.push({
            publicId: item.public_id,
            url: item.secure_url,
            name: item.display_name,
            folder: item.asset_folder,
            format: item.format,
            resourceType: item.resource_type,
            bytes: item.bytes,
            duration: item.duration,
            width: item.width,
            height: item.height,
            assetId: item.asset_id
          });
        }
        cursor = page.next_cursor;
      } while (cursor);
    const modules = await prisma.module.findMany({
      where: {
        id: {
          in: [
            "7dd54036-26d9-4104-8008-9d559135b461",
            "6c96bcdf-0b41-48d2-bdcd-394d06acd9d2"
          ]
        }
      },
      include: {
        course: { select: { id: true, title: true } },
        lessons: {
          include: {
            lessonFiles: { include: { file: true }, orderBy: { position: "asc" } }
          },
          orderBy: { order: "asc" }
        }
      }
    });
    const existingFiles = await prisma.file.findMany({
      where: {
        publicId: { in: (videos as { publicId: string }[]).map((item) => item.publicId) }
      },
      select: { id: true, publicId: true, url: true }
    });
    const oldCourse = await prisma.course.findUnique({
      where: { id: "de47675b-fd20-4fbd-b980-41dbd71a94ae" },
      include: { modules: { include: { lessons: true } } }
    });
    console.log(
      JSON.stringify(
        {
          videos,
          existingFiles,
          modules: modules.map((module) =>
            module.order === 1
              ? module
              : {
                  id: module.id,
                  title: module.title,
                  lessonCount: module.lessons.length,
                  videos: module.lessons.flatMap((lesson) =>
                    lesson.lessonFiles
                      .filter((r) => r.file?.mimeType === "video/mp4")
                      .map((r) => ({
                        id: r.id,
                        fileId: r.fileId,
                        position: r.position,
                        publicId: r.file?.publicId
                      }))
                  )
                }
          ),
          oldCourse
        },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Error de inspección");
  process.exitCode = 1;
});
