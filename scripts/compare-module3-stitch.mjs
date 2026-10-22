import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
const sharp = require(require.resolve("sharp", { paths: [require.resolve("next")] }));
const root = process.argv[2];
if (!root) throw Error("Indica la carpeta exportada de Stitch.");
const inventory = JSON.parse(
  await readFile(join(tmpdir(), "warmi-stitch-audit/inventory.json"), "utf8")
);
const output = join(tmpdir(), "warmi-stitch-comparison");
await mkdir(output, { recursive: true });
const report = [];
for (const record of inventory.screens) {
  const match = /sesi_n_(\d)_(?:tema|paso)_(\d)/.exec(record.file);
  const closing = record.file.startsWith("cierre_");
  if (!match && !closing) continue;
  const session = closing ? 4 : Number(match[1]);
  const state = closing ? "outcomes" : `${session < 3 ? "topic" : "step"}-${match[2]}`;
  const directory = `warmi-session${session}-offline-design`;
  const inputs = [
    join(root, dirname(record.file), "screen.png"),
    join(tmpdir(), "warmi-stitch-before-dfc8b4d", directory, `${state}.png`),
    join(tmpdir(), directory, `${state}.png`)
  ];
  const layers = [];
  const statuses = [];
  for (const [column, input] of inputs.entries()) {
    try {
      const resized = await sharp(input).resize({ width: 390 }).png().toBuffer();
      const { height } = await sharp(resized).metadata();
      const visible = await sharp(resized)
        .extract({ left: 0, top: 0, width: 390, height: Math.min(height, 2700) })
        .png()
        .toBuffer();
      layers.push({ input: visible, left: column * 390, top: 40 });
      statuses.push("available");
    } catch {
      statuses.push("missing-or-invalid");
    }
  }
  const labels = Buffer.from(
    '<svg width="1170" height="40"><rect width="1170" height="40" fill="white"/><g font-family="Arial" font-size="18" fill="#1c1c19"><text x="12" y="26">Stitch (HTML si PNG invalido)</text><text x="402" y="26">Antes: dfc8b4d</text><text x="792" y="26">Despues: offline mejorado</text></g></svg>'
  );
  layers.push({ input: labels, left: 0, top: 0 });
  const filename = `s${session}-${state}.png`;
  await sharp({
    create: { width: 1170, height: 2740, channels: 3, background: "#ffffff" }
  })
    .composite(layers)
    .png()
    .toFile(join(output, filename));
  report.push({ source: record.file, comparison: filename, columns: statuses });
}
await writeFile(join(output, "comparison.json"), JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      output,
      comparisons: report.length,
      missing: report.filter((r) => r.columns.includes("missing-or-invalid"))
    },
    null,
    2
  )
);
