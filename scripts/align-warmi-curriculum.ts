import { createRequire } from "node:module";
import { writeFile, stat } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);

async function main() {
  const { WarmiCurriculumRepository } =
    await import("../shared/repositories/warmi-curriculum.repository");
  const { WARMI_CURRICULUM } = await import("../shared/learning/curriculum");
  const { prisma } = await import("../shared/server/db/prisma");
  try {
    for (const guide of WARMI_CURRICULUM.sessions.flatMap((s) => s.guides)) {
      const info = await stat(path.join(process.cwd(), "public", guide.src));
      if (info.size !== guide.size)
        throw new Error(`Asset ausente o distinto: ${guide.src}`);
    }
    const repository = new WarmiCurriculumRepository();
    const before = await repository.inspect();
    console.log(
      JSON.stringify(
        {
          source: WARMI_CURRICULUM.source,
          modules: [1, 2, 3, 4].map((module) => ({
            module,
            sessions: WARMI_CURRICULUM.sessions
              .filter((s) => s.module === module)
              .map((s) => ({ id: s.id, title: s.title, pages: s.pages }))
          })),
          mode: process.argv.includes("--apply") ? "apply" : "read-only"
        },
        null,
        2
      )
    );
    if (process.argv.includes("--apply")) {
      const backup = path.join(os.tmpdir(), `warmi-curriculum-before-${Date.now()}.json`);
      await writeFile(backup, JSON.stringify(before, null, 2));
      console.log("Backup previo:", backup);
      console.log(JSON.stringify(await repository.publish(), null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Error de publicación");
  process.exitCode = 1;
});
