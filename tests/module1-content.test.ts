import assert from "node:assert/strict";
import test from "node:test";
import {
  MODULE1_ID,
  MODULE1_GMAIL_SUPPORT_ID,
  MODULE1_INSTITUTIONS,
  MODULE1_SESSIONS,
  MODULE1_SUPPORT_VIDEOS,
  MODULE1_VIDEOS,
  module1SessionText,
  module1YouTubeEmbed
} from "@/shared/learning/module1";
import { LEARNING_PROGRAM } from "@/shared/learning/program";
import { LearningService } from "@/shared/services/learning.service";
import type { CourseRepository } from "@/shared/repositories/course.repository";
import { isOfflineModule, getReferencedLessonId } from "@/shared/offline/module3-types";

test("M1 has exactly four unique sessions and preserves historic Gmail ID", () => {
  assert.equal(MODULE1_SESSIONS.length, 4);
  assert.deepEqual(
    MODULE1_SESSIONS.map((item) => item.order),
    [1, 2, 3, 4]
  );
  assert.equal(new Set(MODULE1_SESSIONS.map((item) => item.id)).size, 4);
  assert.equal(new Set(MODULE1_SESSIONS.map((item) => item.slug)).size, 4);
  assert.equal(MODULE1_SESSIONS[0].id, "699a22ef-7d43-4133-8710-96b33284396a");
  assert.match(module1SessionText(4), /Al terminar el Módulo 1/);
});

test("seven unique Cloudinary references exclude the duplicate and order by position", () => {
  assert.equal(MODULE1_VIDEOS.length, 7);
  assert.equal(new Set(MODULE1_VIDEOS.map((item) => item.publicId)).size, 7);
  assert.ok(MODULE1_VIDEOS.every((item) => !item.publicId.includes("DUPLICADO")));
  assert.deepEqual(
    MODULE1_VIDEOS.filter((item) => item.role === "additional").map((item) => item.key),
    ["M1-S1-03", "M1-S1-04"]
  );
  assert.deepEqual(
    MODULE1_VIDEOS.filter((item) => item.session === 3).map((item) => item.key),
    ["M1-S3-02", "M1-S3-01"]
  );
  for (const session of MODULE1_SESSIONS) {
    const positions = MODULE1_VIDEOS.filter((item) => item.session === session.order).map(
      (item) => item.position
    );
    assert.equal(new Set(positions).size, positions.length);
  }
});

test("YouTube tutorials are external, temporary and configurable by URL", () => {
  assert.equal(Object.keys(MODULE1_SUPPORT_VIDEOS).length, 4);
  for (const video of Object.values(MODULE1_SUPPORT_VIDEOS)) {
    assert.equal(video.sourceType, "YOUTUBE");
    assert.equal(video.temporary, true);
    assert.match(
      module1YouTubeEmbed(video.url),
      /^https:\/\/www.youtube-nocookie.com\/embed\/[\w-]{11}\?rel=0$/
    );
    assert.ok(video.sourceUrl && video.author);
  }
  assert.equal(
    module1YouTubeEmbed("https://youtu.be/JNCqeoHdlRM"),
    "https://www.youtube-nocookie.com/embed/JNCqeoHdlRM?rel=0"
  );
  assert.throws(() => module1YouTubeEmbed("https://example.com/not-youtube"));
});

test("institution links are not internal offline lessons and M1 stays online only", () => {
  assert.equal(isOfflineModule(MODULE1_ID), false);
  assert.equal(MODULE1_INSTITUTIONS.length, 4);
  for (const item of MODULE1_INSTITUTIONS) {
    assert.equal(
      getReferencedLessonId("program", {
        type: "EXTERNAL_LINK",
        provider: "module1",
        originalUrl: item.url
      }),
      null
    );
    assert.match(item.url, /^https:\/\//);
  }
});

test("legacy Gmail support container keeps its program redirect", async () => {
  const legacyId = LEARNING_PROGRAM.modules[0].previousCourseId;
  for (const modules of [
    [],
    [{ id: "historical-support", lessons: [{ id: MODULE1_GMAIL_SUPPORT_ID }] }]
  ]) {
    const repository = {
      findEnrollmentCourse: async (_userId: string, courseId: string) => ({
        course: { id: courseId, modules: courseId === legacyId ? modules : [] },
        lessonProgresses: []
      })
    } as unknown as CourseRepository;
    await assert.rejects(
      new LearningService(repository).getCourseDetail("artisan", legacyId),
      (error: unknown) =>
        error instanceof Error &&
        "digest" in error &&
        String(error.digest).includes(`/artesana/aprender/${LEARNING_PROGRAM.id}`)
    );
  }
});

test("a legacy Gmail course with other real content is not hidden by the support redirect", async () => {
  const legacyId = LEARNING_PROGRAM.modules[0].previousCourseId;
  const repository = {
    findEnrollmentCourse: async () => ({
      course: {
        id: legacyId,
        modules: [{ id: "other-real-module", lessons: [{ id: "other-real-lesson" }] }]
      },
      lessonProgresses: []
    })
  } as unknown as CourseRepository;
  const result = await new LearningService(repository).getCourseDetail(
    "artisan",
    legacyId
  );
  assert.equal(result.enrollment.course.id, legacyId);
  assert.equal(result.firstIncompleteLesson?.id, "other-real-lesson");
});
