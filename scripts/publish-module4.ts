import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
async function main() {
  const { prisma } = await import("../shared/server/db/prisma");
  try {
    const apply = process.argv.includes("--apply");
    if (apply) {
      const before = await prisma.course.findUniqueOrThrow({
        where: { id: "93dc7355-d746-4acd-87df-29f71d16a955" },
        include: {
          modules: {
            include: {
              lessons: { include: { lessonFiles: { include: { file: true } } } }
            }
          },
          enrollments: { include: { lessonProgresses: true, courseProgress: true } }
        }
      });
      await writeFile(
        join(tmpdir(), `warmi-module4-before-${Date.now()}.json`),
        JSON.stringify(before, null, 2)
      );
    }
    const { Module4PublishingService } =
      await import("../shared/services/module4-publishing.service");
    const service = new Module4PublishingService();
    const prepared = await service.prepare(
      join(process.cwd(), "public/images/learning/module4"),
      apply
    );
    console.log(
      JSON.stringify({ mode: apply ? "apply" : "dry-run", plan: prepared.plan }, null, 2)
    );
    if (apply) {
      const result = await service.publish(prepared.assets);
      console.log(JSON.stringify(result, null, 2));
      await mkdir(join(tmpdir(), "warmi-m4"), { recursive: true });
      await writeFile(
        join(tmpdir(), "warmi-m4/publication.json"),
        JSON.stringify(result, null, 2)
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : "Publicación fallida.");
  process.exitCode = 1;
});
