import { createRequire } from "node:module";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const sharp = require(require.resolve("sharp", { paths: [require.resolve("next")] }));
const root = process.argv[2];
if (!root) throw Error("Indica la carpeta exportada de Stitch.");
const output = join(tmpdir(), "warmi-stitch-audit");
await mkdir(output, { recursive: true });
async function walk(path) {
  const result = [];
  for (const item of await readdir(path, { withFileTypes: true })) {
    const full = join(path, item.name);
    if (item.isDirectory()) result.push(...(await walk(full)));
    else result.push(full);
  }
  return result;
}
const files = await walk(root);
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const records = [];
try {
  const page = await browser.newPage();
  for (const file of files.filter((path) => path.endsWith(".html"))) {
    const html = await readFile(file, "utf8");
    const record = await page.evaluate((source) => {
      const document = new DOMParser().parseFromString(source, "text/html");
      document.querySelectorAll("script,style").forEach((node) => node.remove());
      return {
        headings: [...document.querySelectorAll("h1,h2,h3,h4")].map((el) =>
          el.textContent.trim()
        ),
        paragraphs: [...document.querySelectorAll("p,blockquote")]
          .map((el) => el.textContent.trim())
          .filter(Boolean),
        images: [...document.querySelectorAll("img")].map((el) => ({
          src: el.getAttribute("src"),
          alt: el.getAttribute("alt") || el.getAttribute("data-alt")
        })),
        buttons: [...document.querySelectorAll("button")].map((el) =>
          el.textContent.replace(/\s+/g, " ").trim()
        )
      };
    }, html);
    records.push({ file: relative(root, file), ...record });
  }
} finally {
  await browser.close();
}
await writeFile(
  join(output, "inventory.json"),
  JSON.stringify(
    { files: files.map((f) => relative(root, f)), screens: records },
    null,
    2
  )
);
const screens = files.filter((f) => f.endsWith("screen.png"));
for (let start = 0; start < screens.length; start += 4) {
  const group = screens.slice(start, start + 4),
    layers = [];
  for (const [index, path] of group.entries()) {
    let metadata;
    try {
      metadata = await sharp(path).metadata();
    } catch {
      console.log(`Captura no decodificable: ${relative(root, path)}`);
      continue;
    }
    const height = Math.min(metadata.height, 1900);
    const buffer = await sharp(path)
      .extract({ left: 0, top: 0, width: metadata.width, height })
      .resize({ width: 360, height: 2300, fit: "inside" })
      .png()
      .toBuffer();
    layers.push({ input: buffer, left: index * 360, top: 0 });
  }
  await sharp({
    create: {
      width: group.length * 360,
      height: 2400,
      channels: 3,
      background: "#ffffff"
    }
  })
    .composite(layers)
    .png()
    .toFile(join(output, `references-${start / 4 + 1}.png`));
}
console.log(
  JSON.stringify(
    {
      output,
      files: files.length,
      screens: records.map((r, index) => ({
        index: index + 1,
        ...r,
        images: r.images.map((i) => ({
          alt: i.alt,
          host: new URL(i.src, "https://local.invalid").host
        }))
      }))
    },
    null,
    2
  )
);
