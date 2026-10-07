import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);

async function main() {
  const { prisma } = await import("../shared/server/db/prisma");
  try {
    const { Module2PublishingService } =
      await import("../shared/services/module2-publishing.service");
    const { MODULE2_ID, MODULE2_SESSIONS, MODULE2_EXCLUDED_VIDEO } =
      await import("../shared/learning/module2");
    const service = new Module2PublishingService();
    const inspection = await service.inspect();
    console.log(
      JSON.stringify(
        {
          mode: process.argv.includes("--apply") ? "apply" : "dry-run",
          moduleId: MODULE2_ID,
          current: inspection.current,
          sessions: MODULE2_SESSIONS.map(({ id, title, order }) => ({
            id,
            title,
            order
          })),
          assets: inspection.assets,
          bytes: inspection.bytes,
          excluded: MODULE2_EXCLUDED_VIDEO
        },
        null,
        2
      )
    );
    if (process.argv.includes("--apply"))
      console.log(JSON.stringify(await service.publish(inspection.assets), null, 2));
    else
      console.log(
        "Solo lectura: crear/reutilizar M2, cuatro sesiones y cuatro MP4. M1/M3/M4 y sus recursos no se alteran. Usar --apply para publicar."
      );
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "No se pudo publicar M2.");
  process.exitCode = 1;
});
