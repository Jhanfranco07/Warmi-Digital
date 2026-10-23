import { createRequire } from "node:module";
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const packagePath = require.resolve("pdfjs-dist/package.json");
const source = dirname(packagePath);
const { version } = JSON.parse(await readFile(packagePath, "utf8"));
const target = join(process.cwd(), "public/pdfjs", version);
const assets = [];
async function copy(relative, output = relative) {
  const destination = join(target, output);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(source, relative), destination);
  assets.push(`/pdfjs/${version}/${output.replaceAll("\\", "/")}`);
}
async function directory(name) {
  for (const file of await readdir(join(source, name), { withFileTypes: true })) {
    if (file.isFile() && !file.name.endsWith(".map")) await copy(join(name, file.name));
  }
}
await copy("legacy/build/pdf.min.mjs", "pdf.min.mjs");
await copy("legacy/build/pdf.worker.min.mjs", "pdf.worker.min.mjs");
for (const name of ["cmaps", "standard_fonts", "wasm", "iccs"]) await directory(name);
await copy("LICENSE");
await writeFile(
  join(process.cwd(), "public/pdfjs/manifest.json"),
  JSON.stringify({ version, assets })
);
console.log(`PDF.js ${version}: ${assets.length} recursos locales preparados.`);
