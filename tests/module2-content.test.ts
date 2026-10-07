import assert from "node:assert/strict";
import test from "node:test";
import {
  MODULE2_ID,
  MODULE2_SESSIONS,
  MODULE2_VIDEOS,
  MODULE2_EXCLUDED_VIDEO,
  MODULE2_PRODUCT,
  MODULE2_QUESTIONS,
  module2SessionText
} from "@/shared/learning/module2";
import { MODULE1_SESSIONS } from "@/shared/learning/module1";
import { LEARNING_PROGRAM, learningProgress } from "@/shared/learning/program";
import { isOfflineModule } from "@/shared/offline/module3-types";

test("M1 and M2 have exactly four sessions; M2 steps have the approved order", () => {
  assert.equal(MODULE1_SESSIONS.length, 4);
  assert.equal(MODULE2_SESSIONS.length, 4);
  assert.deepEqual(
    MODULE2_SESSIONS.map((item) => item.order),
    [1, 2, 3, 4]
  );
  assert.equal(new Set(MODULE2_SESSIONS.map((item) => item.id)).size, 4);
  assert.deepEqual(
    MODULE2_SESSIONS.map((item) => item.steps.length),
    [5, 3, 4, 5]
  );
  assert.match(module2SessionText(3), /Chal de lana de oveja/);
  assert.match(module2SessionText(4), /comprobante/);
});
test("only relevant real MP4s are selected; alternate PDF is secondary", () => {
  assert.equal(MODULE2_VIDEOS.length, 4);
  assert.equal(new Set(MODULE2_VIDEOS.map((item) => item.publicId)).size, 4);
  assert.equal(
    MODULE2_VIDEOS.some((item) => String(item.publicId) === MODULE2_EXCLUDED_VIDEO),
    false
  );
  assert.deepEqual(
    MODULE2_VIDEOS.filter((item) => item.role === "additional").map((item) => item.key),
    ["M2-S3-01"]
  );
  assert.equal(MODULE2_VIDEOS.find((item) => item.key === "M2-S3-02")?.role, "main");
  for (const session of MODULE2_SESSIONS) {
    const positions = MODULE2_VIDEOS.filter((item) => item.session === session.order).map(
      (item) => item.position
    );
    assert.equal(new Set(positions).size, positions.length);
  }
});
test("examples distinguish Ruraq Maki from contests and do not claim 2026 registration is open", () => {
  const fair = MODULE2_SESSIONS[0].steps[1].examples!;
  assert.match(
    fair.find((item) => item.title.startsWith("Ruraq"))!.note!,
    /no un concurso/
  );
  assert.match(MODULE2_SESSIONS[1].steps[2].text, /No es una inscripción abierta/);
  assert.equal(MODULE2_QUESTIONS.length, 5);
  assert.equal(MODULE2_PRODUCT.length, 6);
});
test("progress is dynamic across available modules, M2 remains online only", () => {
  assert.equal(LEARNING_PROGRAM.modules[1].id, MODULE2_ID);
  assert.equal(LEARNING_PROGRAM.modules[1].status, "available");
  assert.equal(isOfflineModule(MODULE2_ID), false);
  assert.equal(LEARNING_PROGRAM.modules[2].offline, true);
  assert.equal(LEARNING_PROGRAM.modules[3].status, "preparing");
  const course = {
    id: LEARNING_PROGRAM.id,
    modules: [
      { id: LEARNING_PROGRAM.modules[0].id, lessons: MODULE1_SESSIONS },
      { id: MODULE2_ID, lessons: MODULE2_SESSIONS },
      { id: LEARNING_PROGRAM.modules[2].id, lessons: [{ id: "m3-1" }, { id: "m3-2" }] },
      { id: "unpublished", lessons: [{ id: "hidden" }] }
    ]
  };
  assert.equal(
    learningProgress(
      course,
      MODULE2_SESSIONS.map((item) => ({ lessonId: item.id, completed: true }))
    ).percentage,
    40
  );
  assert.equal(learningProgress(course, []).totalLessons, 10);
});
