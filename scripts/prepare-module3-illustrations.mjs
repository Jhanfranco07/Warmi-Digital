import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require(require.resolve("sharp", { paths: [require.resolve("next")] }));
const prompts = JSON.parse(
  await readFile(new URL("./module3-illustration-prompts.json", import.meta.url), "utf8")
);
const sources = process.argv.slice(2);
if (sources.length !== prompts.length)
  throw new Error(
    "Indica los seis PNG originales en el orden catalog, status, market, payment, packing, support."
  );
const target = join(process.cwd(), "public/images/learning/module3/examples");
await mkdir(target, { recursive: true });
const assets = [];
for (const [index, item] of prompts.entries()) {
  const buffer = await sharp(sources[index])
    .resize({ width: 960, height: 640, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toBuffer();
  await writeFile(join(target, item.file), buffer);
  const { width, height } = await sharp(buffer).metadata();
  assets.push({
    ...item,
    url: `/images/learning/module3/examples/${item.file}`,
    generator: "built-in image_gen",
    width,
    height,
    bytes: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex")
  });
}
const bytes = assets.reduce((sum, asset) => sum + asset.bytes, 0);
await writeFile(
  join(target, "manifest.json"),
  JSON.stringify(
    {
      purpose:
        "Ejemplos educativos ficticios; no son productos reales ni capturas oficiales",
      bytes,
      assets
    },
    null,
    2
  ) + "\n"
);
console.log(
  JSON.stringify(
    {
      target,
      bytes,
      assets: assets.map(({ key, bytes, width, height }) => ({
        key,
        bytes,
        width,
        height
      }))
    },
    null,
    2
  )
);
