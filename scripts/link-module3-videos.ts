import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);

async function main() {
  const { prisma } = await import("../shared/server/db/prisma");
  try {
    const { Module3VideosService } =
      await import("../shared/services/module3-videos.service");
    const service = new Module3VideosService();
    const inspection = await service.inspect();
    console.log(
      JSON.stringify(
        {
          cloudName: inspection.cloudName,
          bytes: inspection.bytes,
          videos: inspection.videos,
          currentModule: inspection.current?.title,
          currentResources: inspection.current?.lessons.map((lesson) => ({
            title: lesson.title,
            resources: lesson.lessonFiles.map((resource) => ({
              id: resource.id,
              title: resource.title,
              position: resource.position,
              fileId: resource.fileId
            }))
          }))
        },
        null,
        2
      )
    );
    if (process.argv.includes("--apply"))
      console.log(JSON.stringify(await service.link(inspection.videos), null, 2));
    else console.log("Solo lectura. Usar --apply para vincular los seis MP4 existentes.");
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "No se pudieron vincular los videos."
  );
  process.exitCode = 1;
});
