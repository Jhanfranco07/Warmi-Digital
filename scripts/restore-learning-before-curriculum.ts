import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);

async function main() {
  const { prisma } = await import("../shared/server/db/prisma");
  const { learningProgress } = await import("../shared/learning/program");
  const folder = path.join(os.tmpdir(), "warmi-curriculum-rollback");
  const before = JSON.parse(
    await readFile(path.join(folder, "before.json"), "utf8")
  ) as Prisma.CourseGetPayload<{
    include: {
      modules: {
        include: { lessons: { include: { lessonFiles: { include: { file: true } } } } };
      };
    };
  }>;
  const curriculum = JSON.parse(
    await readFile(path.join(folder, "curriculum.json"), "utf8")
  ) as { sessions: { id: string; guides: { id: string }[] }[] };
  const originalLessons = before.modules.flatMap((m) => m.lessons);
  const originalIds = originalLessons.map((l: { id: string }) => l.id);
  const addedIds = curriculum.sessions
    .map((s: { id: string }) => s.id)
    .filter((id: string) => !originalIds.includes(id));
  const originalResources = before.modules.flatMap((m) =>
    m.lessons.flatMap((l) => l.lessonFiles)
  );
  const originalResourceIds = originalResources.map((r: { id: string }) => r.id);
  const include = {
    modules: {
      include: {
        lessons: {
          include: { lessonFiles: { include: { file: true } }, lessonProgresses: true }
        }
      }
    },
    enrollments: { include: { courseProgress: true, lessonProgresses: true } }
  } as const;
  try {
    const current = await prisma.course.findUniqueOrThrow({
      where: { id: before.id },
      include
    });
    const resources = current.modules.flatMap((m) =>
      m.lessons.flatMap((l) => l.lessonFiles)
    );
    assert.deepEqual(
      JSON.parse(
        JSON.stringify(
          resources
            .filter((r) => originalResourceIds.includes(r.id))
            .sort((a, b) => a.id.localeCompare(b.id))
        )
      ),
      [...originalResources].sort((a, b) => a.id.localeCompare(b.id)),
      "Los archivos y relaciones originales deben coincidir exactamente con el respaldo."
    );
    if (
      current.enrollments.some((e) =>
        e.lessonProgresses.some((p) => addedIds.includes(p.lessonId) && p.completed)
      )
    ) {
      throw new Error(
        "Una sesión añadida tiene avance completado; revisar su conservación antes de retirar."
      );
    }
    console.log(
      JSON.stringify(
        {
          mode: process.argv.includes("--apply") ? "apply" : "read-only",
          modules: current.modules.map((m) => ({
            order: m.order,
            lessons: m.lessons.length
          })),
          addedLessonProgress: current.enrollments
            .flatMap((e) => e.lessonProgresses)
            .filter((p) => addedIds.includes(p.lessonId))
            .map((p) => ({ completed: p.completed, lessonId: p.lessonId })),
          originalResources: originalResourceIds.length
        },
        null,
        2
      )
    );
    if (!process.argv.includes("--apply")) return;
    const backup = path.join(folder, `before-restoration-${Date.now()}.json`);
    await writeFile(backup, JSON.stringify(current, null, 2));
    console.log("Backup:", backup);
    await prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw(Prisma.sql`SELECT pg_advisory_xact_lock(73032026)::text`);
        const protectedResources = await tx.lessonFile.findMany({
          where: { id: { in: originalResourceIds } },
          include: { file: true },
          orderBy: { id: "asc" }
        });
        if (protectedResources.length !== originalResourceIds.length)
          throw new Error("Faltan recursos originales; restauración cancelada.");
        const currentLinks = await tx.lessonFile.findMany({
          where: {
            lesson: { module: { courseId: before.id } },
            id: { notIn: originalResourceIds }
          }
        });
        const addedGuideIds = curriculum.sessions.flatMap(
          (s: { guides: { id: string }[] }) => s.guides.map((g) => g.id)
        );
        const removable = currentLinks.filter(
          (r) =>
            r.provider === "warmi-curriculum" ||
            r.externalId === "curriculum-gmail-support" ||
            addedIds.includes(r.lessonId) ||
            (r.lessonId === "699a22ef-7d43-4133-8710-96b33284396a" &&
              r.externalId === "WARMI - VIDEOS/video01")
        );
        if (removable.length !== currentLinks.length)
          throw new Error(
            "Hay recursos posteriores ajenos al cambio; revisar antes de retirar."
          );
        const fileIds = [
          ...new Set([
            ...addedGuideIds,
            ...removable.flatMap((r) => (r.fileId ? [r.fileId] : []))
          ])
        ];
        await tx.lessonFile.deleteMany({
          where: { id: { in: removable.map((r) => r.id) } }
        });
        // The backup retains all progress on the removed sessions; original progress is untouched.
        await tx.lessonProgress.deleteMany({ where: { lessonId: { in: addedIds } } });
        await tx.lesson.deleteMany({
          where: { id: { in: addedIds }, module: { courseId: before.id } }
        });
        for (const learningModule of before.modules) {
          await tx.module.update({
            where: { id: learningModule.id },
            data: {
              title: learningModule.title,
              description: learningModule.description,
              order: learningModule.order,
              durationMin: learningModule.durationMin
            }
          });
          for (const lesson of learningModule.lessons) {
            await tx.lesson.update({
              where: { id: lesson.id },
              data: {
                title: lesson.title,
                content: lesson.content,
                order: lesson.order,
                durationMin: lesson.durationMin,
                type: lesson.type
              }
            });
          }
        }
        await tx.module.deleteMany({
          where: {
            courseId: before.id,
            id: {
              in: [
                "48e10986-4700-57fe-9c72-e7ba0272f240",
                "b74c2dcb-8320-556e-a28f-97457334d7ac"
              ]
            },
            lessons: { none: {} },
            workshops: { none: {} }
          }
        });
        // Remove only unreferenced DB metadata. Never delete remote Cloudinary media.
        await tx.file.deleteMany({
          where: {
            id: { in: fileIds },
            lessonFiles: { none: {} },
            moduleCovers: { none: {} },
            coverStories: { none: {} },
            storyFiles: { none: {} },
            messageFiles: { none: {} },
            productImage: { is: null },
            certificate: { is: null }
          }
        });
        const afterResources = await tx.lessonFile.findMany({
          where: { id: { in: originalResourceIds } },
          include: { file: true },
          orderBy: { id: "asc" }
        });
        if (JSON.stringify(protectedResources) !== JSON.stringify(afterResources))
          throw new Error("Cambió un recurso original; se cancela la restauración.");
        const course = await tx.course.findUniqueOrThrow({
          where: { id: before.id },
          include: { modules: { include: { lessons: true } } }
        });
        if (
          course.modules.length !== before.modules.length ||
          course.modules.flatMap((m) => m.lessons).length !== originalIds.length
        )
          throw new Error("La estructura restaurada no coincide con el respaldo.");
        const enrollments = await tx.enrollment.findMany({
          where: { courseId: before.id },
          include: { lessonProgresses: true }
        });
        for (const enrollment of enrollments) {
          const progress = learningProgress(course, enrollment.lessonProgresses);
          await tx.courseProgress.upsert({
            where: { enrollmentId: enrollment.id },
            create: { enrollmentId: enrollment.id, ...progress },
            update: progress
          });
        }
        console.log(
          JSON.stringify({
            restoredLessons: originalIds.length,
            module3Lessons: course.modules.find((m) => m.order === 3)?.lessons.length,
            preservedOriginalResources: afterResources.length,
            removedResources: removable.length,
            originalProgressUnchanged: true
          })
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 120000 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Error de restauración");
  process.exitCode = 1;
});
