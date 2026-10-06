import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);

async function main() {
  if (!process.argv.includes("--apply"))
    throw new Error("Usa --apply para ejecutar la migración verificada.");
  const { LearningProgramRepository } =
    await import("../shared/repositories/learning-program.repository");
  const { prisma } = await import("../shared/server/db/prisma");
  try {
    console.log(JSON.stringify(await new LearningProgramRepository().migrate(), null, 2));
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Error de migración");
  process.exitCode = 1;
});
