import assert from "node:assert/strict";
import test from "node:test";
import {
  LEARNING_PROGRAM,
  availableLearningModules,
  isLearningModuleAvailable,
  learningProgress
} from "../shared/learning/program.ts";

function course() {
  return {
    id: LEARNING_PROGRAM.id,
    modules: [
      {
        id: LEARNING_PROGRAM.modules[0].id,
        lessons: [1, 2, 3, 4].map((order) => ({ id: `m1-session-${order}` }))
      },
      { id: "historical-module-2", lessons: [{ id: "old-2" }] },
      {
        id: LEARNING_PROGRAM.modules[1].id,
        lessons: [1, 2, 3, 4].map((order) => ({ id: `m2-session-${order}` }))
      },
      {
        id: LEARNING_PROGRAM.modules[2].id,
        lessons: [{ id: "session-1" }, { id: "session-2" }]
      },
      { id: "historical-module-4", lessons: [{ id: "old-4" }] }
    ]
  };
}

test("progress counts all available M1/M2/M3, never preparing or historical support", () => {
  const input = course();
  const historical = ["gmail-intro", "old-2", "old-4"].map((lessonId) => ({
    lessonId,
    completed: true
  }));
  assert.deepEqual(learningProgress(input, historical), {
    totalLessons: 10,
    completedLessons: 0,
    percentage: 0
  });
  assert.deepEqual(
    learningProgress(input, [
      ...historical,
      { lessonId: "m1-session-1", completed: true },
      { lessonId: "session-1", completed: true }
    ]),
    { totalLessons: 10, completedLessons: 2, percentage: 20 }
  );
  assert.equal(
    learningProgress(
      input,
      input.modules
        .flatMap((module) => module.lessons)
        .map((lesson) => ({ lessonId: lesson.id, completed: true }))
    ).percentage,
    100
  );
  assert.equal(
    learningProgress(
      input,
      [1, 2, 3, 4].map((order) => ({ lessonId: `m1-session-${order}`, completed: true }))
    ).percentage,
    40
  );
});

test("next pending lesson is ordered across available modules without mutating records", () => {
  const input = course();
  const before = JSON.stringify(input);
  const available = availableLearningModules(input.id, input.modules);
  const completed = new Set(["m1-session-1"]);
  assert.equal(
    available
      .flatMap((module) => module.lessons)
      .find((lesson) => !completed.has(lesson.id)).id,
    "m1-session-2"
  );
  assert.equal(available[0], input.modules[0]);
  assert.equal(JSON.stringify(input), before);
  assert.equal(isLearningModuleAvailable(input.id, LEARNING_PROGRAM.modules[0].id), true);
});

test("unknown modules cannot expose legacy content; other courses remain available", () => {
  const input = course();
  assert.equal(isLearningModuleAvailable(input.id, "historical-module-2"), false);
  assert.deepEqual(
    availableLearningModules("other-course", input.modules),
    input.modules
  );
  assert.equal(learningProgress({ ...input, id: "other-course" }, []).totalLessons, 12);
});

test("unavailable-only programs have no artificial completion", () => {
  const input = course();
  input.modules = input.modules.filter(
    (module) =>
      !LEARNING_PROGRAM.modules
        .filter((item) => item.status === "available")
        .map((item) => item.id)
        .includes(module.id)
  );
  assert.deepEqual(learningProgress(input, [{ lessonId: "old-2", completed: true }]), {
    totalLessons: 0,
    completedLessons: 0,
    percentage: 0
  });
});

test("four stable cards: all available online, only M3 downloadable offline", () => {
  assert.deepEqual(
    LEARNING_PROGRAM.modules.map((module) => module.order),
    [1, 2, 3, 4]
  );
  assert.deepEqual(
    LEARNING_PROGRAM.modules.map((module) => module.status),
    ["available", "available", "available", "available"]
  );
  assert.deepEqual(
    LEARNING_PROGRAM.modules.map((module) => module.offline),
    [false, false, true, false]
  );
  assert.equal(LEARNING_PROGRAM.modules[0].id, "7dd54036-26d9-4104-8008-9d559135b461");
  assert.equal(LEARNING_PROGRAM.modules[2].id, "6c96bcdf-0b41-48d2-bdcd-394d06acd9d2");
  assert.equal(LEARNING_PROGRAM.modules[1].id, "c156c5d5-8c81-48f8-85d4-234ecb21ec0e");
  assert.equal(LEARNING_PROGRAM.modules[3].id, "2853b850-4032-5e82-b861-8eaaa84913f8");
});
