import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  MODULE4_ID,
  MODULE4_SESSIONS,
  MODULE4_IMAGES,
  MODULE4_SALE,
  MODULE4_OUTCOMES,
  module4Progress,
  module4ImageKey,
  module4ImagePublicId,
  MODULE4_CONTENT_VERSION
} from "@/shared/learning/module4";
import { LEARNING_PROGRAM, learningProgress } from "@/shared/learning/program";
import { buildOfflineModule } from "@/shared/services/offline-learning.service";
import { isCurrentDownload, type ModuleDownload } from "@/shared/offline/module3-types";
test("four M4 sessions, four sale steps, six outcomes, stable identity and real progress", () => {
  assert.deepEqual(
    MODULE4_SESSIONS.map((s) => s.order),
    [1, 2, 3, 4]
  );
  assert.equal(new Set(MODULE4_SESSIONS.map((s) => s.id)).size, 4);
  assert.equal(MODULE4_SALE.length, 4);
  assert.equal(MODULE4_OUTCOMES.length, 6);
  assert.equal(LEARNING_PROGRAM.modules[3].id, MODULE4_ID);
  assert.equal(LEARNING_PROGRAM.modules[3].offline, false);
  assert.equal(module4Progress([MODULE4_SESSIONS[3].id]), 25);
  assert.equal(module4Progress(MODULE4_SESSIONS.map((s) => s.id)), 100);
  assert.equal(
    module4Progress([MODULE4_SESSIONS[0].id, MODULE4_SESSIONS[0].id, "unknown"]),
    25
  );
  const course = {
    id: LEARNING_PROGRAM.id,
    modules: LEARNING_PROGRAM.modules.map((m) => ({
      id: m.id,
      lessons: [1, 2, 3, 4].map((n) => ({ id: `${m.id}-${n}` }))
    }))
  };
  assert.deepEqual(
    learningProgress(
      course,
      course.modules[2].lessons.map((l) => ({ lessonId: l.id, completed: true }))
    ),
    { totalLessons: 16, completedLessons: 4, percentage: 25 }
  );
});
test("nine lightweight faithful WebP assets have provenance and matching hashes; reused resources share keys", async () => {
  const manifest = JSON.parse(
    await readFile("public/images/learning/module4/manifest.json", "utf8")
  ) as {
    key: string;
    filename: string;
    bytes: number;
    sha256: string;
    page: number;
    width: number;
    height: number;
  }[];
  assert.deepEqual(
    manifest.map((m) => m.key),
    MODULE4_IMAGES.map((i) => i.key)
  );
  assert.equal(manifest.length, 9);
  assert.ok(manifest.reduce((sum, m) => sum + m.bytes, 0) < 300000);
  for (const m of manifest) {
    const data = await readFile(`public/images/learning/module4/${m.filename}`);
    assert.equal(data.toString("ascii", 0, 4), "RIFF");
    assert.equal(data.toString("ascii", 8, 12), "WEBP");
    assert.equal(data.length, m.bytes);
    assert.equal(createHash("sha256").update(data).digest("hex"), m.sha256);
    assert.ok(m.page >= 48 && m.page <= 54);
    assert.ok(m.width < 1440 && m.height < 810);
  }
  assert.equal(MODULE4_SESSIONS.flatMap((s) => s.images).length, 11);
  for (const i of MODULE4_IMAGES)
    assert.equal(
      module4ImageKey(
        `https://res.cloudinary.com/szhwzy4q/image/upload/v1/${module4ImagePublicId(i.key)}.webp`
      ),
      i.key
    );
  assert.equal(module4ImageKey("unrelated"), undefined);
});
test("previously saved M4 records retain their cache contract and revision detection", () => {
  type Course = Parameters<typeof buildOfflineModule>[1];
  type Module = Parameters<typeof buildOfflineModule>[2];
  const learningModule = {
    id: MODULE4_ID,
    title: "M4",
    description: null,
    lessons: [
      {
        id: MODULE4_SESSIONS[0].id,
        title: "S1",
        content: "Text",
        lessonFiles: [
          {
            id: "r",
            title: "Photo",
            description: null,
            type: "IMAGE",
            provider: "cloudinary",
            originalUrl: "https://example.test/photo.webp",
            externalId: null,
            file: { id: "f", mimeType: "image/webp", size: 40 }
          }
        ]
      }
    ]
  } as unknown as Module;
  const course = {
    id: LEARNING_PROGRAM.id,
    title: "Program",
    modules: [learningModule]
  } as unknown as Course;
  const snapshot = buildOfflineModule("user", course, learningModule);
  assert.equal(snapshot.contentVersion, MODULE4_CONTENT_VERSION);
  assert.equal(snapshot.lessons[0].resources[0].file?.mimeType, "image/webp");
  const saved = {
    ...snapshot,
    cacheName: "cache",
    downloadedAt: "today",
    bytes: 40,
    assets: { f: "/__warmi_offline__/f" }
  } as ModuleDownload;
  assert.equal(isCurrentDownload(saved, snapshot), true);
  assert.equal(
    isCurrentDownload({ ...saved, contentVersion: undefined }, snapshot),
    false
  );
  assert.equal(isCurrentDownload({ ...saved, assets: {} }, snapshot), false);
});
