import assert from "node:assert/strict";
import test from "node:test";
import { buildOfflineModule } from "@/shared/services/offline-learning.service";
import {
  offlineLocation,
  offlineProgress,
  isOfflineHomePath
} from "@/shared/offline/offline-presentation";
import { isCurrentDownload, type ModuleDownload } from "@/shared/offline/module3-types";

const first = {
  moduleId: "first",
  lessons: [
    { id: "one", resources: [] },
    { id: "two", resources: [] }
  ],
  supportLessons: [{ id: "support", resources: [] }],
  assets: {}
} as unknown as ModuleDownload;
const second = {
  ...first,
  moduleId: "second",
  lessons: [{ id: "three", title: "Three", content: null, resources: [] }]
};
test("home entries stay distinct from learning; selection follows local lesson identity and module query", () => {
  for (const path of ["/", "/offline-learning", "/artesana", "/artesana/dashboard"])
    assert.equal(isOfflineHomePath(path), true);
  assert.equal(isOfflineHomePath("/artesana/aprender"), false);
  assert.equal(
    offlineLocation("/artesana/aprender/course?module=second", [first, second]).download,
    second
  );
  assert.equal(
    offlineLocation("/artesana/aprender/course/lecciones/three", [first, second])
      .download,
    second
  );
  assert.equal(
    offlineLocation("/artesana/aprender/course/lecciones/support", [first, second])
      .download,
    first
  );
});
test("legacy progress is unknown, explicit zero is real, duplicates/support/unknown IDs cannot inflate completion", () => {
  assert.equal(offlineProgress(first), undefined);
  assert.deepEqual(
    offlineProgress({
      ...first,
      progress: { capturedAt: "today", completedLessonIds: [] }
    }),
    { completed: 0, total: 2 }
  );
  assert.deepEqual(
    offlineProgress({
      ...first,
      progress: {
        capturedAt: "today",
        completedLessonIds: ["one", "one", "support", "unknown"]
      }
    }),
    { completed: 1, total: 2 }
  );
});
test("a read-only progress snapshot does not invalidate an otherwise identical media package", () => {
  assert.equal(
    isCurrentDownload(first, {
      ...first,
      progress: { completedLessonIds: ["one"], capturedAt: "today" }
    }),
    true
  );
});

test("manifest completion snapshots only this module and preserves pedagogical records", () => {
  const learningModule = {
    id: "first",
    title: "Original",
    description: "Original description",
    lessons: [
      { id: "one", title: "Original lesson", content: "Original text", lessonFiles: [] }
    ]
  };
  const course = { id: "course", title: "Original course", modules: [learningModule] };
  const before = JSON.stringify(course);
  type Course = Parameters<typeof buildOfflineModule>[1];
  type LearningModule = Parameters<typeof buildOfflineModule>[2];
  const manifest = buildOfflineModule(
    "owner",
    course as unknown as Course,
    learningModule as unknown as LearningModule,
    [],
    ["one", "unknown", "one"]
  );
  assert.deepEqual(manifest.progress?.completedLessonIds, ["one"]);
  assert.ok(Date.parse(manifest.progress!.capturedAt));
  assert.equal(manifest.lessons[0].content, "Original text");
  assert.equal(JSON.stringify(course), before);
  assert.equal(
    buildOfflineModule(
      "owner",
      course as unknown as Course,
      learningModule as unknown as LearningModule
    ).progress,
    undefined
  );
});
