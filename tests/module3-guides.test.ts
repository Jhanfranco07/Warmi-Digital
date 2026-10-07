import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  MODULE3_SESSION1_ID,
  MODULE3_SESSION1_TOPICS,
  module3GuidePublicId
} from "@/shared/learning/module3-session1";
import { isDownloadableFile, isOfflineModule } from "@/shared/offline/module3-types";
import { LEARNING_PROGRAM } from "@/shared/learning/program";

test("session 1 has seven ordered topics and reuses all six existing video relations", () => {
  assert.equal(MODULE3_SESSION1_ID, "8a8e449b-76a6-4a6d-9693-6238f75092bc");
  assert.equal(MODULE3_SESSION1_TOPICS.length, 7);
  const ids = MODULE3_SESSION1_TOPICS.flatMap((topic) => [...topic.videoIds]);
  assert.equal(ids.length, 6);
  assert.equal(new Set(ids).size, 6);
  assert.equal(MODULE3_SESSION1_TOPICS[4].videoIds.length, 0);
  assert.equal(MODULE3_SESSION1_TOPICS[5].videoIds.length, 2);
  assert.equal(isOfflineModule(LEARNING_PROGRAM.modules[2].id), true);
});
test("guides match verified source pages, content hashes, independent PDFs and offline MIME", () => {
  const manifest = JSON.parse(
    readFileSync("output/pdf/module3-session1/manifest.json", "utf8")
  ) as {
    key: string;
    filename: string;
    bytes: number;
    sha256: string;
    mode: string;
    sourcePages: number[];
  }[];
  assert.equal(manifest.length, 7);
  for (const [index, entry] of manifest.entries()) {
    const topic = MODULE3_SESSION1_TOPICS[index];
    assert.equal(entry.key, topic.key);
    assert.equal(entry.mode, topic.mode);
    assert.deepEqual(entry.sourcePages, [...topic.sourcePages]);
    const bytes = readFileSync(`output/pdf/module3-session1/${entry.filename}`);
    assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
    assert.equal(bytes.length, entry.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256);
    assert.equal(
      isDownloadableFile({
        id: topic.key,
        mimeType: "application/pdf",
        size: bytes.length
      }),
      true
    );
    assert.match(
      module3GuidePublicId(topic.key),
      /^Warmi\/MODULO_3\/SESION_1\/GUIAS\/[a-z-]+-v1\.pdf$/
    );
  }
  assert.equal(new Set(manifest.map((item) => item.sha256)).size, 7);
});
