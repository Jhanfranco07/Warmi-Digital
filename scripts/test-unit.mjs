import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const files = (await readdir(new URL("../tests/", import.meta.url)))
  .filter((name) => /\.test\.(ts|mjs)$/.test(name))
  .sort()
  .map((name) => `tests/${name}`);
if (!files.length) throw new Error("No unit tests found");
const result = spawnSync(
  process.execPath,
  [require.resolve("tsx/cli"), "--test", ...files],
  {
    stdio: "inherit"
  }
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
