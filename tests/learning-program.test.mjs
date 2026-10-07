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
        id: LEARNING_PROGRAM.modules[2].id,
        lessons: [{ id: "session-1" }, { id: "session-2" }]
      },
      { id: "historical-module-4", lessons: [{ id: "old-4" }] }
    ]
  };
}

test("progress counts M1 and M3, never preparing or historical support", () => {
  const input = course();
  const historical = ["gmail-intro", "old-2", "old-4"].map((lessonId) => ({
    lessonId,
    completed: true
  }));
  assert.deepEqual(learningProgress(input, historical), {
    totalLessons: 6,
    completedLessons: 0,
    percentage: 0
  });
  assert.deepEqual(
    learningProgress(input, [
      ...historical,
      { lessonId: "m1-session-1", completed: true },
      { lessonId: "session-1", completed: true }
    ]),
    { totalLessons: 6, completedLessons: 2, percentage: 33 }
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
    67
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
  assert.equal(learningProgress({ ...input, id: "other-course" }, []).totalLessons, 8);
});

test("unavailable-only programs have no artificial completion", () => {
  const input = course();
  input.modules = input.modules.filter(
    (module) =>
      ![LEARNING_PROGRAM.modules[0].id, LEARNING_PROGRAM.modules[2].id].includes(
        module.id
      )
  );
  assert.deepEqual(learningProgress(input, [{ lessonId: "old-2", completed: true }]), {
    totalLessons: 0,
    completedLessons: 0,
    percentage: 0
  });
});

test("four stable cards: M1 available online, M3 available offline, M2/M4 preparing", () => {
  assert.deepEqual(
    LEARNING_PROGRAM.modules.map((module) => module.order),
    [1, 2, 3, 4]
  );
  assert.deepEqual(
    LEARNING_PROGRAM.modules.map((module) => module.status),
    ["available", "preparing", "available", "preparing"]
  );
  assert.deepEqual(
    LEARNING_PROGRAM.modules.map((module) => module.offline),
    [false, false, true, false]
  );
  assert.equal(LEARNING_PROGRAM.modules[0].id, "7dd54036-26d9-4104-8008-9d559135b461");
  assert.equal(LEARNING_PROGRAM.modules[2].id, "6c96bcdf-0b41-48d2-bdcd-394d06acd9d2");
  assert.equal(LEARNING_PROGRAM.modules[1].id, null);
  assert.equal(LEARNING_PROGRAM.modules[3].id, null);
});
