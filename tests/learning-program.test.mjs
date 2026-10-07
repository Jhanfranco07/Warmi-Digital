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
      { id: LEARNING_PROGRAM.modules[0].id, lessons: [{ id: "gmail-1" }, { id: "gmail-2" }] },
      { id: "historical-module-2", lessons: [{ id: "old-2" }] },
      { id: LEARNING_PROGRAM.modules[2].id, lessons: [{ id: "session-1" }, { id: "session-2" }] },
      { id: "historical-module-4", lessons: [{ id: "old-4" }] }
    ]
  };
}

test("historical completions do not increase or dilute available progress", () => {
  const input = course();
  const historical = ["gmail-1", "gmail-2", "old-2", "old-4"].map((lessonId) => ({
    lessonId,
    completed: true
  }));
  assert.deepEqual(learningProgress(input, historical), {
    totalLessons: 2, completedLessons: 0, percentage: 0
  });
  assert.deepEqual(learningProgress(input, [...historical, { lessonId: "session-1", completed: true }]), {
    totalLessons: 2, completedLessons: 1, percentage: 50
  });
  assert.equal(learningProgress(input, [
    { lessonId: "session-1", completed: true },
    { lessonId: "session-2", completed: true }
  ]).percentage, 100);
});

test("the next pending lesson comes from module 3 without changing source records", () => {
  const input = course();
  const before = JSON.stringify(input);
  const available = availableLearningModules(input.id, input.modules);
  const completed = new Set(["session-1"]);
  assert.equal(available.flatMap((module) => module.lessons).find((lesson) => !completed.has(lesson.id)).id, "session-2");
  assert.equal(available[0], input.modules[2]);
  assert.equal(JSON.stringify(input), before);
  assert.equal(isLearningModuleAvailable(input.id, LEARNING_PROGRAM.modules[0].id), false);
});

test("unknown modules cannot expose legacy content in this program; other courses remain available", () => {
  const input = course();
  assert.equal(isLearningModuleAvailable(input.id, "historical-module-2"), false);
  assert.equal(isLearningModuleAvailable("other-course", LEARNING_PROGRAM.modules[0].id), true);
  assert.deepEqual(availableLearningModules("other-course", input.modules), input.modules);
  assert.equal(learningProgress({ ...input, id: "other-course" }, [{ lessonId: "gmail-1", completed: true }]).totalLessons, 6);
});

test("unavailable-only programs have no pending lessons or artificial completion", () => {
  const input = course();
  input.modules = input.modules.filter((module) => module.id !== LEARNING_PROGRAM.modules[2].id);
  assert.deepEqual(learningProgress(input, [{ lessonId: "gmail-1", completed: true }]), {
    totalLessons: 0, completedLessons: 0, percentage: 0
  });
  assert.equal(availableLearningModules(input.id, input.modules).length, 0);
});

test("four ordered cards retain stable identities, one available module and local image configuration", () => {
  assert.deepEqual(LEARNING_PROGRAM.modules.map((module) => module.order), [1, 2, 3, 4]);
  assert.deepEqual(LEARNING_PROGRAM.modules.map((module) => module.status), ["preparing", "preparing", "available", "preparing"]);
  assert.equal(LEARNING_PROGRAM.modules[2].id, "6c96bcdf-0b41-48d2-bdcd-394d06acd9d2");
  assert.equal(LEARNING_PROGRAM.modules[2].offline, true);
  assert.equal(LEARNING_PROGRAM.modules[1].id, null);
  assert.equal(LEARNING_PROGRAM.modules[3].id, null);
  for (const module of LEARNING_PROGRAM.modules) {
    assert.match(module.image.src, /^\/images\//);
    assert.ok(module.image.alt);
  }
});
