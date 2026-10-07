import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);

async function main() {
  const { prisma } = await import("../shared/server/db/prisma");
  try {
    const { Module1PublishingService } =
      await import("../shared/services/module1-publishing.service");
    const service = new Module1PublishingService();
    const inspection = await service.inspect();
    console.log(
      JSON.stringify(
        {
          mode: process.argv.includes("--apply") ? "apply" : "dry-run",
          module: inspection.current?.id,
          existingLessons: inspection.current?.lessons.map(({ id, title, order }) => ({
            id,
            title,
            order
          })),
          bytes: inspection.bytes,
          videos: inspection.assets.map(({ public_id, secure_url, bytes, duration }) => ({
            public_id,
            secure_url,
            bytes,
            duration
          })),
          tutorials: inspection.tutorials
        },
        null,
        2
      )
    );
    if (process.argv.includes("--apply"))
      console.log(JSON.stringify(await service.publish(inspection.assets), null, 2));
    else
      console.log(
        "Solo lectura: reutilizar Gmail, conservar su PDF e introducción de apoyo, completar cuatro sesiones y vincular 7 MP4 únicos + 4 YouTube externos + enlaces oficiales. Usar --apply para publicar."
      );
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "No se pudo publicar el Módulo 1."
  );
  process.exitCode = 1;
});
