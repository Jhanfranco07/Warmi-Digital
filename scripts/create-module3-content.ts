import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);

async function main() {
  const { prisma } = await import("../shared/server/db/prisma");
  try {
    const { Module3ContentService } =
      await import("../shared/services/module3-content.service");
    const result = await new Module3ContentService().provision();
    console.log(
      JSON.stringify(
        {
          created: result.created,
          originalsUnchanged: result.originalsUnchanged,
          module: {
            id: result.module.id,
            courseId: result.module.courseId,
            title: result.module.title,
            order: result.module.order,
            lessons: result.module.lessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              order: lesson.order,
              contentLength: lesson.content?.length,
              resources: lesson.lessonFiles.map((resource) => ({
                id: resource.id,
                title: resource.title,
                type: resource.type,
                position: resource.position
              }))
            }))
          }
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
  console.error(
    error instanceof Error ? error.message : "No se pudo crear el contenido del Módulo 3."
  );
  process.exitCode = 1;
});
