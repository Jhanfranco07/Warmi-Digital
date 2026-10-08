// Read-only audit of the actual published learning program. No seed or progress writes.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { prisma } = await import("../shared/server/db/prisma.ts");
const { LEARNING_PROGRAM } = await import("../shared/learning/program.ts");
const { getReferencedLesson } = await import("../shared/offline/module3-types.ts");
const output = join(tmpdir(), "warmi-learning-coherence");
await mkdir(output, { recursive: true });
try {
  const course = await prisma.course.findUniqueOrThrow({
    where: { id: LEARNING_PROGRAM.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              lessonFiles: { orderBy: { position: "asc" }, include: { file: true } }
            }
          }
        }
      }
    }
  });
  await writeFile(join(output, "course.json"), JSON.stringify(course, null, 2));
  assert.equal(course.title, LEARNING_PROGRAM.title);
  assert.deepEqual(
    course.modules.map((m) => m.order),
    [1, 2, 3, 4]
  );
  const report = {
    courseDuration: course.durationMin,
    modules: [],
    urls: [],
    externalLinks: [],
    relevantOrphans: [],
    internalLinks: 0
  };
  const files = new Map();
  const externalLinks = new Map();
  for (const module of course.modules) {
    assert.ok(module.title.trim());
    // Report historical persisted names; the catalog supplies canonical presentation names.
    assert.equal(module.lessons.length, 4);
    assert.deepEqual(
      module.lessons.map((l) => l.order),
      [1, 2, 3, 4]
    );
    const moduleFiles = new Map();
    for (const lesson of module.lessons) {
      assert.ok(lesson.title.trim());
      const positions = lesson.lessonFiles.map((r) => r.position);
      assert.equal(new Set(positions).size, positions.length);
      assert.ok(positions.every((p) => Number.isInteger(p) && p >= 0));
      const fileIds = lesson.lessonFiles.filter((r) => r.fileId).map((r) => r.fileId);
      assert.equal(
        new Set(fileIds).size,
        fileIds.length,
        `Duplicate visible file in ${lesson.title}`
      );
      for (const resource of lesson.lessonFiles) {
        assert.ok(resource.title.trim());
        const reference = getReferencedLesson(resource);
        if (
          !reference &&
          !resource.fileId &&
          resource.originalUrl?.startsWith("https://")
        )
          externalLinks.set(resource.originalUrl, resource.type);
        if (reference) {
          assert.ok(
            await prisma.lesson.findFirst({
              where: {
                id: reference.lessonId,
                module: {
                  courseId: reference.courseId,
                  course: { status: "PUBLISHED", deletedAt: null }
                }
              }
            }),
            `Broken internal support ${resource.id}`
          );
          report.internalLinks++;
        }
        if (resource.fileId) assert.ok(resource.file, `Missing File ${resource.id}`);
        if (resource.file) {
          files.set(resource.fileId, resource.file);
          moduleFiles.set(resource.fileId, resource.file);
        }
      }
    }
    report.modules.push({
      order: module.order,
      title: module.title,
      duration: module.durationMin,
      lessonDurations: module.lessons.map((l) => l.durationMin),
      sessions: module.lessons.length,
      references: module.lessons.flatMap((l) => l.lessonFiles).length,
      uniqueFiles: moduleFiles.size,
      mimeTypes: [...moduleFiles.values()].reduce((a, f) => {
        a[f.mimeType] = (a[f.mimeType] || 0) + 1;
        return a;
      }, {})
    });
  }
  // Project folders also include files without an owner; inspect their references
  // across historical lessons and covers before reporting an orphan.
  const uploaded = await prisma.file.findMany({
    where: {
      OR: [
        { publicId: { contains: "MODULO_3", mode: "insensitive" } },
        { publicId: { contains: "MODULO_4", mode: "insensitive" } },
        { id: { in: [...files.keys()] } }
      ]
    },
    include: {
      lessonFiles: { select: { id: true } },
      moduleCovers: { select: { id: true } }
    }
  });
  report.relevantOrphans = uploaded
    .filter((f) => !f.lessonFiles.length && !f.moduleCovers.length)
    .map((f) => ({ id: f.id, publicId: f.publicId }));
  const queue = [...files.values()];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let file; (file = queue.shift());) {
        let result;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const url = new URL(file.url);
            assert.equal(url.protocol, "https:");
            const response = await fetch(url, {
              method: "HEAD",
              signal: AbortSignal.timeout(30000)
            });
            result = {
              id: file.id,
              status: response.status,
              type: response.headers.get("content-type"),
              size: response.headers.get("content-length")
            };
            if (response.ok) break;
          } catch (error) {
            result = { id: file.id, error: error.message };
          }
        }
        report.urls.push(result);
      }
    })
  );
  const externalQueue = [...externalLinks];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let entry; (entry = externalQueue.shift());) {
        const [url, type] = entry;
        let result;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const target =
              type === "VIDEO_YOUTUBE"
                ? `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
                : url;
            const response = await fetch(target, { signal: AbortSignal.timeout(15000) });
            result = { url, type, status: response.status, finalUrl: response.url };
            await response.body?.cancel();
            if (response.ok) break;
          } catch (error) {
            result = { url, type, error: error.cause?.code ?? error.message };
          }
        }
        report.externalLinks.push(result);
      }
    })
  );
  await writeFile(join(output, "data-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  assert.ok(
    report.urls.every((r) => r.status >= 200 && r.status < 300),
    "Resource check failed; inspect data-report.json"
  );
} finally {
  await prisma.$disconnect();
}
