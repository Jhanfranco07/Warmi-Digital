import { createRequire } from "node:module";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
async function main() {
  const { prisma } = await import("../shared/server/db/prisma");
  const { Module3JourneyPublishingService } =
    await import("../shared/services/module3-journey-publishing.service");
  const { Module3JourneyPublishingRepository } =
    await import("../shared/repositories/module3-journey-publishing.repository");
  try {
    const apply = process.argv.includes("--apply");
    if (apply) {
      const backup = join(tmpdir(), `warmi-module3-before-journey-${Date.now()}.json`);
      await writeFile(
        backup,
        JSON.stringify(await new Module3JourneyPublishingRepository().inspect(), null, 2)
      );
      console.log("Backup:", backup);
    }
    const service = new Module3JourneyPublishingService();
    const prepared = await service.prepare(
      join(process.cwd(), "output/pdf/module3-sessions-2-4"),
      apply
    );
    console.log(
      JSON.stringify({ mode: apply ? "apply" : "dry-run", plan: prepared.plan }, null, 2)
    );
    if (apply) {
      const result = await service.publish(prepared.assets);
      console.log(JSON.stringify(result, null, 2));
      await writeFile(
        join(tmpdir(), "warmi-m3-journey/publication.json"),
        JSON.stringify(result, null, 2)
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Publicación fallida.");
  process.exitCode = 1;
});
