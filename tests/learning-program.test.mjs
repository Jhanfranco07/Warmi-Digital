import assert from "node:assert/strict";
import test from "node:test";
import publication from "../shared/learning/publication.json" with { type: "json" };
import curriculum from "../shared/learning/curriculum.json" with { type: "json" };
import {
  LEARNING_PROGRAM,
  PUBLISHED_PROGRAM_LESSONS,
  availableLearningModules,
  isLearningLessonAvailable,
  isLearningModuleAvailable,
  learningProgress
} from "../shared/learning/program.ts";

function course() {
  return {
    id: LEARNING_PROGRAM.id,
    modules: LEARNING_PROGRAM.modules.map((module) => ({
      id: module.id,
      lessons: [
        ...curriculum.sessions
          .filter((session) => session.module === module.order)
          .map((session) => ({ id: session.id })),
        { id: `historical-${module.order}` }
      ]
    }))
  };
}

test("published source content in all four modules determines 0%, partial and 100% progress", () => {
  const input = course();
  const history = input.modules.map((_, index) => ({
    lessonId: `historical-${index + 1}`,
    completed: true
  }));
  assert.deepEqual(learningProgress(input, history), {
    totalLessons: 16,
    completedLessons: 0,
    percentage: 0
  });
  const completed = PUBLISHED_PROGRAM_LESSONS.map((lessonId) => ({
    lessonId,
    completed: true
  }));
  assert.deepEqual(learningProgress(input, [...history, ...completed.slice(0, 8)]), {
    totalLessons: 16,
    completedLessons: 8,
    percentage: 50
  });
  assert.equal(learningProgress(input, [...completed, ...completed]).percentage, 100);
  assert.equal(
    learningProgress(input, [{ lessonId: completed[0].lessonId, completed: false }])
      .percentage,
    0
  );
});

test("the next session follows the PDF sequence; filtering never mutates source records", () => {
  const input = course();
  const before = JSON.stringify(input);
  const available = availableLearningModules(input.id, input.modules);
  assert.equal(available.length, 4);
  assert.deepEqual(
    available.map((module) => module.lessons.length),
    [4, 4, 4, 4]
  );
  const completed = new Set(PUBLISHED_PROGRAM_LESSONS.slice(0, 5));
  assert.equal(
    available
      .flatMap((module) => module.lessons)
      .find((lesson) => !completed.has(lesson.id)).id,
    PUBLISHED_PROGRAM_LESSONS[5]
  );
  assert.equal(JSON.stringify(input), before);
});

test("historical lessons, unknown modules and wrong module associations are unavailable", () => {
  assert.equal(isLearningModuleAvailable(LEARNING_PROGRAM.id, "unknown"), false);
  assert.equal(
    isLearningLessonAvailable(
      LEARNING_PROGRAM.id,
      LEARNING_PROGRAM.modules[0].id,
      "5a317a3f-dc5c-4000-b059-ddf8b5f9e149"
    ),
    false
  );
  assert.equal(
    isLearningLessonAvailable(
      LEARNING_PROGRAM.id,
      LEARNING_PROGRAM.modules[0].id,
      PUBLISHED_PROGRAM_LESSONS[8]
    ),
    false
  );
  assert.deepEqual(
    learningProgress(
      { id: LEARNING_PROGRAM.id, modules: [{ id: "unknown", lessons: [{ id: "old" }] }] },
      [{ lessonId: "old", completed: true }]
    ),
    { totalLessons: 0, completedLessons: 0, percentage: 0 }
  );
});

test("other courses retain their lessons and progress", () => {
  const input = course();
  assert.deepEqual(
    availableLearningModules("other-course", input.modules),
    input.modules
  );
  assert.equal(isLearningLessonAvailable("other-course", "unknown", "old"), true);
  assert.equal(
    learningProgress({ ...input, id: "other-course" }, [
      { lessonId: "historical-1", completed: true }
    ]).totalLessons,
    20
  );
});

test("four source modules have real covers and only the stable Module 3 is downloadable", () => {
  assert.deepEqual(
    LEARNING_PROGRAM.modules.map((module) => module.order),
    [1, 2, 3, 4]
  );
  assert.deepEqual(
    LEARNING_PROGRAM.modules.map((module) => module.status),
    Array(4).fill("available")
  );
  assert.deepEqual(
    LEARNING_PROGRAM.modules.map((module) => module.offline),
    [false, false, true, false]
  );
  assert.equal(LEARNING_PROGRAM.modules[2].id, "6c96bcdf-0b41-48d2-bdcd-394d06acd9d2");
  assert.deepEqual(
    PUBLISHED_PROGRAM_LESSONS,
    curriculum.sessions
      .filter((session) => session.status === "published")
      .map((session) => session.id)
  );
  assert.equal(new Set(PUBLISHED_PROGRAM_LESSONS).size, 16);
  assert.deepEqual(
    publication,
    curriculum.sessions.map((session) => ({
      id: session.id,
      module: session.module,
      status: session.status,
      hasContent: Boolean(session.content.trim() && session.guides.length)
    }))
  );
  for (const module of LEARNING_PROGRAM.modules) {
    assert.match(
      module.image.src,
      /^\/images\/learning\/modules\/module-[1-4]-cover\.webp$/
    );
    assert.ok(module.image.alt);
  }
});
