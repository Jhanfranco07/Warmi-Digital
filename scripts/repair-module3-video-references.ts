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
    console.log(
      JSON.stringify(
        await new Module3VideosService().repairReferences(
          process.argv.includes("--apply")
        ),
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
    error instanceof Error
      ? error.message
      : "No se pudieron verificar las referencias del Modulo 3."
  );
  process.exitCode = 1;
});
