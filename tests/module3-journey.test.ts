import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  MODULE3_SESSIONS,
  MODULE3_GUIDES,
  MODULE3_NEW_VIDEOS,
  MODULE3_DELIVERY_STEPS,
  MODULE3_OUTCOMES,
  module3Progress
} from "@/shared/learning/module3-journey";
import { MODULE3_CONTENT_VERSION } from "@/shared/learning/module3-version";
import {
  isCurrentDownload,
  type OfflineModule,
  type ModuleDownload
} from "@/shared/offline/module3-types";
import { learningProgress, LEARNING_PROGRAM } from "@/shared/learning/program";

test("four real sessions and four delivery steps; closing is not a fifth lesson", () => {
  assert.deepEqual(
    MODULE3_SESSIONS.map((s) => s.order),
    [1, 2, 3, 4]
  );
  assert.equal(new Set(MODULE3_SESSIONS.map((s) => s.id)).size, 4);
  assert.deepEqual(
    MODULE3_SESSIONS.slice(1).map((s) => s.title),
    [
      "Conociendo tiendas virtuales que venden",
      "Aprende a cobrar desde el celular",
      "Simulación de primera venta en línea"
    ]
  );
  assert.equal(MODULE3_DELIVERY_STEPS.length, 4);
  assert.equal(MODULE3_OUTCOMES.length, 4);
});
test("real module progress reaches 100 only after all four completions and preserves M1/M2 denominator", () => {
  assert.equal(module3Progress([MODULE3_SESSIONS[3].id]), 25);
  assert.equal(module3Progress(MODULE3_SESSIONS.map((s) => s.id)), 100);
  assert.equal(
    module3Progress([MODULE3_SESSIONS[0].id, MODULE3_SESSIONS[0].id, "unknown"]),
    25
  );
  const modules = LEARNING_PROGRAM.modules.slice(0, 3).map((m, index) => ({
    id: m.id!,
    lessons:
      index === 2
        ? [...MODULE3_SESSIONS]
        : [1, 2, 3, 4].map((n) => ({ id: `${index}-${n}` }))
  }));
  const progress = learningProgress(
    { id: LEARNING_PROGRAM.id, modules },
    MODULE3_SESSIONS.map((s) => ({ lessonId: s.id, completed: true }))
  );
  assert.deepEqual(progress, { totalLessons: 12, completedLessons: 4, percentage: 33 });
});
test("exactly three new PDFs are valid and match the reviewed manifest", async () => {
  const manifest = JSON.parse(
    await readFile("output/pdf/module3-sessions-2-4/manifest.json", "utf8")
  ) as { key: string; filename: string; bytes: number; sha256: string }[];
  assert.equal(manifest.length, 3);
  assert.deepEqual(
    manifest.map((g) => g.key),
    MODULE3_GUIDES.map((g) => g.key)
  );
  for (const guide of manifest) {
    const data = await readFile(`output/pdf/module3-sessions-2-4/${guide.filename}`);
    assert.equal(data.subarray(0, 5).toString(), "%PDF-");
    assert.equal(data.length, guide.bytes);
    assert.equal(createHash("sha256").update(data).digest("hex"), guide.sha256);
  }
  assert.equal(new Set(MODULE3_NEW_VIDEOS.map((v) => v.publicId)).size, 2);
});
test("old packages remain readable but cannot be reported as current; missing new assets require update", () => {
  const expected: OfflineModule = {
    userId: "user",
    courseId: "course",
    moduleId: "m3",
    courseTitle: "Program",
    title: "M3",
    description: null,
    contentVersion: MODULE3_CONTENT_VERSION,
    lessons: [
      {
        id: "s3",
        title: "Cobros",
        content: null,
        resources: [
          {
            id: "guide",
            title: "PDF",
            description: null,
            type: "PDF",
            externalUrl: null,
            file: { id: "pdf", mimeType: "application/pdf", size: 12 }
          }
        ]
      }
    ]
  };
  const download: ModuleDownload = {
    ...expected,
    cacheName: "cache",
    assets: { pdf: "/local/pdf" },
    bytes: 12,
    downloadedAt: "now"
  };
  assert.equal(isCurrentDownload(download, expected), true);
  assert.equal(
    isCurrentDownload({ ...download, contentVersion: undefined }, expected),
    false
  );
  assert.equal(isCurrentDownload({ ...download, assets: {} }, expected), false);
  assert.equal(isCurrentDownload({ ...download, lessons: [] }, expected), false);
  assert.equal(
    isCurrentDownload(download, {
      ...expected,
      lessons: expected.lessons.map((l) => ({ ...l, content: "updated" }))
    }),
    false
  );
});

test("published M3 snapshot carries the version on the module while other modules remain unversioned", async () => {
  const { buildOfflineModule } =
    await import("@/shared/services/offline-learning.service");
  type Course = Parameters<typeof buildOfflineModule>[1];
  type LearningModule = Parameters<typeof buildOfflineModule>[2];
  const learningModule = {
    id: LEARNING_PROGRAM.modules[2].id,
    title: "M3",
    description: null,
    lessons: [
      { id: MODULE3_SESSIONS[1].id, title: "S2", content: "Text", lessonFiles: [] }
    ]
  } as unknown as LearningModule;
  const course = {
    id: LEARNING_PROGRAM.id,
    title: "Program",
    modules: [learningModule]
  } as unknown as Course;
  const snapshot = buildOfflineModule("user", course, learningModule);
  assert.equal(snapshot.contentVersion, MODULE3_CONTENT_VERSION);
  assert.equal("contentVersion" in snapshot.lessons[0], false);
  assert.equal(
    buildOfflineModule("user", course, {
      ...learningModule,
      id: LEARNING_PROGRAM.modules[1].id!
    }).contentVersion,
    undefined
  );
});
