import assert from "node:assert/strict";
import test from "node:test";
import {
  MODULE3_TITLE,
  getReferencedLessonId,
  isOfflineModule
} from "@/shared/offline/module3-types";
import { LEARNING_PROGRAM } from "@/shared/learning/program";
import { CourseRepository } from "@/shared/repositories/course.repository";
import {
  buildOfflineModule,
  OfflineLearningService
} from "@/shared/services/offline-learning.service";
import {
  MODULE3_SESSIONS,
  MODULE3_SUPPORT
} from "@/shared/services/module3-content.service";

type Enrollment = NonNullable<
  Awaited<ReturnType<CourseRepository["findEnrollmentCourse"]>>
>;

function resource(id: string, originalUrl: string, provider = "warmi") {
  return {
    id,
    type: "EXTERNAL_LINK",
    title: id,
    description: null,
    provider,
    originalUrl,
    externalId: null,
    file: null
  };
}

function fixture() {
  return {
    id: "enrollment",
    course: {
      id: "course",
      title: "Curso",
      deletedAt: null,
      modules: [
        {
          id: "original-module",
          title: "Conoce WhatsApp Business",
          lessons: [
            {
              id: "support",
              title: "Original",
              content: "Texto original",
              lessonFiles: [
                {
                  id: "support-pdf",
                  title: "PDF",
                  description: null,
                  type: "PDF",
                  provider: "cloudinary",
                  originalUrl: null,
                  externalId: null,
                  file: { id: "pdf", mimeType: "application/pdf", size: 20 }
                }
              ]
            },
            {
              id: "unreferenced",
              title: "Otra lección",
              content: "No incluir",
              lessonFiles: [
                {
                  id: "other-pdf",
                  file: { id: "private-pdf", mimeType: "application/pdf", size: 20 }
                }
              ]
            }
          ]
        },
        {
          id: LEARNING_PROGRAM.modules[2].id,
          title: MODULE3_TITLE,
          description: "Descripción",
          lessons: [
            {
              id: "session1",
              title: "Sesión 1",
              content: "Nuevo texto",
              lessonFiles: [
                resource("reference", "/artesana/aprender/course/lecciones/support"),
                resource(
                  "foreign-course",
                  "/artesana/aprender/other/lecciones/unreferenced"
                ),
                resource("external", "https://www.facebook.com/", "facebook")
              ]
            }
          ]
        }
      ]
    }
  } as unknown as Enrollment;
}

class FixtureRepository {
  constructor(private readonly enrollment: Enrollment | null) {}
  async findEnrollmentCourse() {
    return this.enrollment;
  }
}

test("offline capability uses stable module identity, not the displayed title", () => {
  assert.equal(isOfflineModule(LEARNING_PROGRAM.modules[2].id), true);
  assert.equal(isOfflineModule(LEARNING_PROGRAM.modules[0].id), false);
  assert.equal(isOfflineModule(MODULE3_TITLE), false);
  assert.equal(isOfflineModule("unrelated-module"), false);
});

test("internal references stay inside the same course and cannot masquerade as external links", () => {
  assert.equal(
    getReferencedLessonId(
      "course",
      resource("a", "/artesana/aprender/course/lecciones/support")
    ),
    "support"
  );
  for (const url of [
    "/artesana/aprender/other/lecciones/support",
    "https://warmi.invalid/artesana/aprender/course/lecciones/support",
    "//[invalid",
    "/\\[invalid",
    "/artesana/aprender/course/lecciones/support?token=bad",
    "/artesana/aprender/course/lecciones/support/extra"
  ])
    assert.equal(getReferencedLessonId("course", resource("a", url)), null);
  assert.equal(
    getReferencedLessonId(
      "course",
      resource("a", "/artesana/aprender/course/lecciones/support", "facebook")
    ),
    null
  );
});

test("snapshot includes original support once, preserves IDs and never mutates source records", () => {
  const enrollment = fixture();
  const before = JSON.stringify(enrollment);
  const snapshot = buildOfflineModule(
    "user",
    enrollment.course,
    enrollment.course.modules[1]
  );
  assert.deepEqual(
    snapshot.lessons.map((lesson) => lesson.id),
    ["session1"]
  );
  assert.deepEqual(
    snapshot.supportLessons?.map((lesson) => lesson.id),
    ["support"]
  );
  assert.equal(snapshot.supportLessons?.[0].content, "Texto original");
  assert.equal(snapshot.lessons[0].resources[0].internalLessonId, "support");
  assert.equal(snapshot.lessons[0].resources[1].internalLessonId, undefined);
  assert.equal(JSON.stringify(enrollment), before);
});

test("file authorization includes declared support but rejects unrelated files and unenrolled users", async () => {
  const service = new OfflineLearningService(new FixtureRepository(fixture()));
  assert.equal((await service.getAuthorizedFile("user", "course", "pdf"))?.id, "pdf");
  assert.equal(await service.getAuthorizedFile("user", "course", "private-pdf"), null);
  assert.equal(
    await new OfflineLearningService(new FixtureRepository(null)).getAuthorizedFile(
      "user",
      "course",
      "pdf"
    ),
    null
  );
  const deleted = fixture();
  deleted.course.deletedAt = new Date();
  assert.equal(
    await new OfflineLearningService(new FixtureRepository(deleted)).getAuthorizedFile(
      "user",
      "course",
      "pdf"
    ),
    null
  );
});

test("syllabus has two ordered new sessions and keeps the two originals as references", () => {
  assert.deepEqual(
    MODULE3_SESSIONS.map((lesson) => lesson.order),
    [1, 2]
  );
  assert.deepEqual(
    MODULE3_SESSIONS.map((lesson) => lesson.title),
    ["Sesión 1: Publica tu arte en redes", "Sesión 2: Llega a nuevos clientes"]
  );
  assert.equal(MODULE3_SUPPORT.length, 2);
  assert.equal(new Set(MODULE3_SESSIONS.map((lesson) => lesson.slug)).size, 2);
  assert.match(MODULE3_SESSIONS[0].content, /Crea tu catálogo de productos/);
  assert.match(MODULE3_SESSIONS[0].content, /Estados de WhatsApp/);
  assert.match(MODULE3_SESSIONS[1].content, /Facebook/);
  assert.match(MODULE3_SESSIONS[1].content, /Marketplace/);
});

test("published cross-course support is included only when explicitly referenced", async () => {
  const enrollment = fixture();
  const learningModule = enrollment.course.modules[1];
  learningModule.lessons[0].lessonFiles.push(
    resource(
      "published-support",
      "/artesana/aprender/other/lecciones/public-support"
    ) as unknown as (typeof learningModule.lessons)[0]["lessonFiles"][number]
  );
  const original = enrollment.course.modules[0].lessons[0];
  const support = {
    ...original,
    id: "public-support",
    lessonFiles: original.lessonFiles.map((item) => ({
      ...item,
      file: item.file ? { ...item.file, id: "public-pdf" } : null
    }))
  } as Awaited<ReturnType<CourseRepository["findPublishedSupportLesson"]>>;
  const repository = {
    findEnrollmentCourse: async () => enrollment,
    findPublishedSupportLesson: async (courseId: string, lessonId: string) =>
      courseId === "other" && lessonId === "public-support" ? support : null
  };
  const service = new OfflineLearningService(repository);
  const snapshot = await service.getModuleSnapshot(
    "user",
    enrollment.course,
    learningModule
  );
  assert.deepEqual(
    snapshot.supportLessons?.map((lesson) => lesson.id),
    ["support", "public-support"]
  );
  assert.equal(snapshot.lessons[0].resources.at(-1)?.internalLessonId, "public-support");
  assert.equal(
    (await service.getAuthorizedFile("user", "course", "public-pdf"))?.id,
    "public-pdf"
  );
  assert.equal(await service.getAuthorizedFile("user", "course", "private-pdf"), null);
});
