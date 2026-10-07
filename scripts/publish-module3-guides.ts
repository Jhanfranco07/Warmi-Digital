import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);

async function main() {
  const args = process.argv.slice(2);
  if (
    args.some((arg) => !["--apply", "--dry-run"].includes(arg)) ||
    (args.includes("--apply") && args.includes("--dry-run"))
  )
    throw new Error("Usa --dry-run o --apply.");
  const { prisma } = await import("../shared/server/db/prisma");
  try {
    const { Module3GuidesService } =
      await import("../shared/services/module3-guides.service");
    const service = new Module3GuidesService();
    const apply = args.includes("--apply");
    const prepared = await service.prepare(resolve("output/pdf/module3-session1"));
    console.log(
      JSON.stringify(
        {
          mode: apply ? "apply" : "dry-run",
          plan: prepared.plan,
          current: prepared.current,
          bytes: prepared.bytes
        },
        null,
        2
      )
    );
    if (apply)
      console.log(JSON.stringify(await service.publish(prepared.assets), null, 2));
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "No se pudo publicar las guías."
  );
  process.exitCode = 1;
});
