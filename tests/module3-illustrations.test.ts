import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import test from "node:test";
import { MODULE3_ILLUSTRATIONS } from "../shared/learning/module3-illustrations";

test("six contextual illustrations are distinct, local, lightweight and precached with matching provenance", async () => {
  const manifest = JSON.parse(
    await readFile("public/images/learning/module3/examples/manifest.json", "utf8")
  );
  const worker = await readFile("public/warmi-sw.js", "utf8");
  assert.ok(
    worker.includes('url.pathname.startsWith("/images/learning/module3/examples/")'),
    "The worker must serve cached illustrations offline, not only precache them"
  );
  assert.equal(manifest.assets.length, 6);
  assert.equal(
    new Set(manifest.assets.map((asset: { sha256: string }) => asset.sha256)).size,
    6
  );
  assert.equal(
    new Set(Object.values(MODULE3_ILLUSTRATIONS).map((asset) => asset.src)).size,
    6
  );
  let total = 0;
  for (const asset of manifest.assets) {
    const expected =
      MODULE3_ILLUSTRATIONS[asset.key as keyof typeof MODULE3_ILLUSTRATIONS];
    assert.equal(expected.src, asset.url);
    assert.equal(expected.alt, asset.alt);
    assert.ok(asset.prompt.length > 100);
    assert.equal(asset.generator, "built-in image_gen");
    const bytes = await readFile(`public${asset.url}`);
    assert.equal(bytes.length, asset.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
    assert.ok(worker.includes(JSON.stringify(asset.url)));
    assert.equal(asset.width, 960);
    assert.equal(asset.height, 640);
    total += bytes.length;
  }
  assert.equal(total, manifest.bytes);
  assert.ok(total < 750_000);
});
