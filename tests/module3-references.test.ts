import assert from "node:assert/strict";
import test from "node:test";
import {
  MODULE3_REFERENCE_MAP,
  MODULE3_VIDEO_MAP
} from "../shared/services/module3-videos.service";

test("repair keeps the six existing File and LessonFile identities and positions", () => {
  assert.equal(MODULE3_REFERENCE_MAP.length, 6);
  for (const key of ["fileId", "lessonFileId", "publicId"] as const)
    assert.equal(new Set(MODULE3_REFERENCE_MAP.map((item) => item[key])).size, 6);
  assert.deepEqual(
    MODULE3_REFERENCE_MAP.map(({ position }) => position),
    [2, 3, 4, 5, 2, 3]
  );
  assert.deepEqual(
    MODULE3_VIDEO_MAP.map(({ name }) => name),
    ["video02", "video03", "video04", "video08", "video07", "video09"]
  );
});
