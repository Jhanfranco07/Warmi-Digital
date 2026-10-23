import assert from "node:assert/strict";
import test from "node:test";
import {
  downloadSignature,
  fileSignature,
  isMatchingCheckpoint
} from "../shared/offline/download-checkpoint";
import type { OfflineModule } from "../shared/offline/module3-types";

test("checkpoints are restricted by account/course/module/version/files, not reading progress", () => {
  const snapshot: OfflineModule = {
    userId: "one",
    courseId: "course",
    moduleId: "module",
    courseTitle: "course",
    title: "module",
    description: null,
    contentVersion: "v1",
    lessons: [
      {
        id: "lesson",
        title: "lesson",
        content: null,
        resources: [
          {
            id: "resource",
            title: "pdf",
            description: null,
            type: "PDF",
            externalUrl: null,
            file: { id: "pdf", mimeType: "application/pdf", size: 100, revision: "v1" }
          }
        ]
      }
    ]
  };
  const checkpoint = {
    userId: snapshot.userId,
    courseId: snapshot.courseId,
    moduleId: snapshot.moduleId,
    generation: "valid-generation",
    signature: downloadSignature(snapshot)
  };
  assert.equal(isMatchingCheckpoint(checkpoint, snapshot), true);
  for (const key of ["userId", "courseId", "moduleId", "contentVersion"] as const)
    assert.equal(
      isMatchingCheckpoint(checkpoint, { ...snapshot, [key]: "changed" }),
      false
    );
  assert.equal(
    isMatchingCheckpoint({ ...checkpoint, generation: "../unsafe" }, snapshot),
    false
  );
  assert.equal(isMatchingCheckpoint(null, snapshot), false);
  assert.equal(
    isMatchingCheckpoint(checkpoint, {
      ...snapshot,
      progress: { completedLessonIds: ["lesson"], capturedAt: "now" }
    }),
    true
  );
  const original = snapshot.lessons[0].resources[0].file!;
  assert.notEqual(
    fileSignature(original),
    fileSignature({ ...original, revision: "v2" })
  );
  assert.notEqual(fileSignature(original), fileSignature({ ...original, size: 101 }));
});
