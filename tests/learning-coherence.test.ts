import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import catalog from "./fixtures/learning-coherence.json";
import { LEARNING_PROGRAM, learningProgress } from "@/shared/learning/program";
import { MODULE1_SESSIONS } from "@/shared/learning/module1";
import { MODULE2_SESSIONS } from "@/shared/learning/module2";
import { MODULE3_SESSIONS, module3Progress } from "@/shared/learning/module3-journey";
import { MODULE4_SESSIONS, module4Progress } from "@/shared/learning/module4";
import {
  aggregateDuration,
  countLabel,
  durationLabel,
  learningState,
  moduleDuration,
  snapshotProgressLabel
} from "@/shared/learning/presentation";
import { isOfflineModule, type ModuleDownload } from "@/shared/offline/module3-types";
import { DownloadedModuleCard } from "@/features/artisan/offline/offline-home";
Object.assign(globalThis, { React });

// Sanitized read-only DB snapshot: no accounts, progress, secrets or media copies.
test("the real catalog and curriculum agree on four ordered modules and sixteen sessions", () => {
  assert.equal(catalog.id, LEARNING_PROGRAM.id);
  assert.equal(catalog.title, LEARNING_PROGRAM.title);
  assert.deepEqual(
    catalog.modules.map((m) => m.order),
    [1, 2, 3, 4]
  );
  const sessions = [
    MODULE1_SESSIONS,
    MODULE2_SESSIONS,
    MODULE3_SESSIONS,
    MODULE4_SESSIONS
  ];
  catalog.modules.forEach((module, index) => {
    assert.equal(module.id, LEARNING_PROGRAM.modules[index].id);
    assert.equal(LEARNING_PROGRAM.modules[index].status, "available");
    assert.equal(module.lessons.length, 4);
    assert.deepEqual(
      module.lessons.map((l) => l.id),
      sessions[index].map((l) => l.id)
    );
    assert.deepEqual(
      module.lessons.map((l) => l.order),
      [1, 2, 3, 4]
    );
    assert.ok(module.lessons.every((l) => l.title.trim()));
    assert.ok(LEARNING_PROGRAM.modules[index].title.trim());
  });
});
test("only M3 permits new downloads", () => {
  assert.deepEqual(
    catalog.modules.map((m) => isOfflineModule(m.id)),
    [false, false, true, false]
  );
});
test("closing M3 and M4 does not create a fifth session or credit an unknown ID", () => {
  for (const [sessions, progress] of [
    [MODULE3_SESSIONS, module3Progress],
    [MODULE4_SESSIONS, module4Progress]
  ] as const) {
    const ids = sessions.map((s) => s.id);
    assert.equal(progress([...ids.slice(0, 3), "closing"]), 75);
    assert.equal(progress([...ids, ids[0], "closing"]), 100);
  }
});
test("unknown, zero, negative and invalid durations never produce a visible estimate", () => {
  for (const value of [null, undefined, 0, -1, NaN, Infinity])
    assert.equal(durationLabel(value), null);
  assert.equal(durationLabel(25), "25 min");
  assert.equal(aggregateDuration(null, [20, null]), null);
  assert.equal(aggregateDuration(null, []), null);
  assert.equal(aggregateDuration(null, [20, 30]), 50);
  assert.equal(aggregateDuration(60, [30, null]), 60);
  assert.deepEqual(catalog.modules.map(moduleDuration), [100, 90, 60, 45]);
  assert.equal(
    aggregateDuration(catalog.durationMin, catalog.modules.map(moduleDuration)),
    295
  );
});
test("real progress excludes duplicates and foreign rows and remains finite and bounded", () => {
  const lessons = catalog.modules[0].lessons;
  for (let n = 0; n <= lessons.length; n++) {
    const rows = lessons.slice(0, n).map((l) => ({ lessonId: l.id, completed: true }));
    rows.push(...rows, { lessonId: "unknown", completed: true });
    const state = learningState(lessons, rows);
    assert.equal(state.percentage, n * 25);
    assert.equal(state.completedLessons, n);
    assert.ok(Number.isFinite(state.percentage));
  }
  assert.equal(learningState([], []).percentage, 0);
  const many = Array.from({ length: 501 }, (_, i) => ({ id: String(i) }));
  assert.equal(
    learningState(
      many,
      many.slice(1).map((l) => ({ lessonId: l.id, completed: true }))
    ).percentage,
    99
  );
  assert.equal(learningProgress(catalog, []).totalLessons, 16);
});
test("new, started without completion and finished lessons select coherent labels and CTAs", () => {
  const lessons = catalog.modules[2].lessons;
  assert.equal(learningState(lessons, []).action, "Comenzar");
  const started = learningState(lessons, [
    { lessonId: lessons[0].id, completed: false, startedAt: new Date(), progress: 10 }
  ]);
  assert.equal(started.percentage, 0);
  assert.equal(started.action, "Continuar");
  assert.equal(started.label, "En progreso");
  const completed = learningState(
    lessons,
    lessons.map((l) => ({ lessonId: l.id, completed: true }))
  );
  assert.equal(completed.action, "Repasar");
  assert.equal(completed.label, "Completado");
  assert.equal(learningState([], []).state, "new");
  assert.equal(
    learningState(lessons, [{ lessonId: "unknown", completed: true }]).action,
    "Comenzar"
  );
});
test("singular and plural counts and historical snapshot labels are honest", () => {
  assert.equal(countLabel(1, "sesión", "sesiones"), "1 sesión");
  assert.equal(countLabel(2, "sesión", "sesiones"), "2 sesiones");
  assert.equal(countLabel(1, "recurso", "recursos"), "1 recurso");
  assert.equal(snapshotProgressLabel(1, 1), "1 de 1 sesión completada al descargar");
  assert.equal(snapshotProgressLabel(1, 4), "1 de 4 sesiones completadas al descargar");
});
test("resource order uses valid LessonFile positions, without duplicate visible file IDs", () => {
  for (const learningModule of catalog.modules)
    for (const lesson of learningModule.lessons) {
      const positions = lesson.resources.map((r) => r.position);
      assert.ok(positions.every((p) => Number.isInteger(p) && p >= 0));
      assert.deepEqual(
        positions,
        [...positions].sort((a, b) => a - b)
      );
      assert.equal(new Set(positions).size, positions.length);
      const files = lesson.resources.map((r) => r.fileId).filter(Boolean);
      assert.equal(new Set(files).size, files.length);
      assert.ok(lesson.resources.every((r) => r.title.trim()));
    }
  const m3 = catalog.modules[2].lessons.flatMap((l) => l.resources);
  assert.equal(
    new Set(m3.filter((r) => r.mimeType === "video/mp4").map((r) => r.fileId)).size,
    8
  );
  assert.equal(
    new Set(m3.filter((r) => r.mimeType === "application/pdf").map((r) => r.fileId)).size,
    10
  );
  const m4 = catalog.modules[3].lessons.flatMap((l) => l.resources);
  assert.equal(m4.length, 11);
  assert.equal(new Set(m4.map((r) => r.fileId)).size, 9);
});
test("downloaded card uses the canonical name, singular copy and review CTA for completed snapshots", () => {
  const download: ModuleDownload = {
    userId: "fixture",
    courseId: catalog.id,
    courseTitle: catalog.title,
    moduleId: catalog.modules[2].id,
    title: catalog.modules[2].title,
    description: null,
    lessons: [{ id: "lesson", title: "Sesión", content: null, resources: [] }],
    assets: {},
    cacheName: "fixture",
    bytes: 0,
    downloadedAt: "2026-10-08",
    progress: { completedLessonIds: ["lesson"], capturedAt: "2026-10-08" }
  };
  const html = renderToStaticMarkup(
    React.createElement(DownloadedModuleCard, { download })
  );
  assert.ok(html.includes(LEARNING_PROGRAM.modules[2].title));
  assert.ok(html.includes("1 sesión disponible"));
  assert.ok(html.includes("Repasar"));
  assert.ok(!html.includes("1 sesiones"));
  const unknown = renderToStaticMarkup(
    React.createElement(DownloadedModuleCard, {
      download: { ...download, progress: undefined }
    })
  );
  assert.ok(!unknown.includes("al descargar"));
});
