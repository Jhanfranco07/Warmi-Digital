import assert from "node:assert/strict";
import test from "node:test";
import { LEARNING_PROGRAM } from "@/shared/learning/program";
import { isOfflineModule } from "@/shared/offline/module3-types";
import { downloadModule } from "@/shared/offline/module3-storage";
import { OfflineLearningService } from "@/shared/services/offline-learning.service";

type Course = Parameters<OfflineLearningService["getModuleSnapshot"]>[1];
const course = {
  id: LEARNING_PROGRAM.id,
  title: "Program",
  deletedAt: null,
  modules: LEARNING_PROGRAM.modules.map((m) => ({
    id: m.id,
    title: "Same title for every module",
    description: null,
    lessons: [
      {
        id: `${m.id}-lesson`,
        title: "Lesson",
        content: "Original",
        lessonFiles: [
          {
            id: `${m.id}-resource`,
            title: "Resource",
            description: null,
            type: "IMAGE",
            provider: "cloudinary",
            originalUrl: null,
            externalId: null,
            file: { id: `${m.id}-file`, mimeType: "image/webp", size: 40 }
          }
        ]
      }
    ]
  }))
} as unknown as Course;

test("only M3 has offline capability, by stable identity rather than title", () => {
  assert.deepEqual(
    LEARNING_PROGRAM.modules.map((m) => isOfflineModule(m.id)),
    [false, false, true, false]
  );
  assert.deepEqual(
    LEARNING_PROGRAM.modules.filter((m) => m.offline).map((m) => m.id),
    [LEARNING_PROGRAM.modules[2].id]
  );
  assert.equal(isOfflineModule(LEARNING_PROGRAM.modules[2].title), false);
  assert.equal(isOfflineModule("unknown"), false);
});

test("download manifest service refuses M1/M2/M4; M3 remains available", async () => {
  const service = new OfflineLearningService();
  const before = JSON.stringify(course);
  for (const m of course.modules) {
    if (isOfflineModule(m.id)) {
      const manifest = await service.getModuleSnapshot("owner", course, m);
      assert.equal(manifest.moduleId, LEARNING_PROGRAM.modules[2].id);
      assert.equal(manifest.lessons.length, 1);
    } else
      await assert.rejects(
        service.getModuleSnapshot("owner", course, m),
        /no está habilitado/
      );
  }
  assert.equal(JSON.stringify(course), before);
});

test("file authorization serves M3, but denies files belonging to M1/M2/M4", async () => {
  type Reader = NonNullable<ConstructorParameters<typeof OfflineLearningService>[0]>;
  const repository = {
    findEnrollmentCourse: async () => ({ course })
  } as unknown as Reader;
  const service = new OfflineLearningService(repository);
  for (const m of course.modules) {
    const file = await service.getAuthorizedFile("owner", course.id, `${m.id}-file`);
    assert.equal(file?.id ?? null, isOfflineModule(m.id) ? `${m.id}-file` : null);
  }
});

test("client download rejects disabled modules before shell, locks, requests or storage", async () => {
  for (const m of LEARNING_PROGRAM.modules.filter((m) => !m.offline)) {
    await assert.rejects(
      downloadModule({ moduleId: m.id } as Parameters<typeof downloadModule>[0], () =>
        assert.fail("No progress should be emitted")
      ),
      /no está habilitado/
    );
  }
});
