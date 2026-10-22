import assert from "node:assert/strict";
import { assertOfflineImages } from "./helpers/offline-visuals.mjs";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const lessonId = "090d982d-00b6-4784-bec8-69c3eac2e564";
const read = () =>
  db.lesson.findUniqueOrThrow({
    where: { id: lessonId },
    include: { lessonFiles: { orderBy: { position: "asc" }, include: { file: true } } }
  });
let record, pdf;
try {
  record = await read();
  const guide = record.lessonFiles.find((r) => r.file?.mimeType === "application/pdf");
  assert.ok(guide);
  assert.equal(guide.file.id, "0acff2a3-2aba-4d1b-9590-17a90435b575");
  assert.equal(guide.id, "358d9562-9bb2-488c-8ce5-02b65381bb5f");
  assert.equal(guide.position, 10);
  const response = await fetch(guide.file.url, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200);
  pdf = Buffer.from(await response.arrayBuffer());
  assert.ok(pdf.subarray(0, 5).toString() === "%PDF-");
  console.log(
    `HTTP200 ${guide.file.publicId}; File ${guide.file.id}; LessonFile ${guide.id}; position ${guide.position}`
  );
} catch (error) {
  await db.$disconnect();
  throw error;
}
const before = JSON.stringify(record);
const resources = record.lessonFiles
  .filter((r) => r.file)
  .map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    type: r.type,
    externalUrl: r.originalUrl,
    file: { id: r.file.id, mimeType: r.file.mimeType, size: r.file.size }
  }));
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { build } = require(
  require.resolve("esbuild", { paths: [require.resolve("tsx/package.json")] })
);
const previous = execFileSync(
  "git",
  ["show", "dfc8b4d:features/artisan/learning/module3-journey-content.tsx"],
  { encoding: "utf8" }
);
const bundle = await build({
  stdin: {
    contents: `import React from'react';import{renderToStaticMarkup}from'react-dom/server';import{Module3JourneyContent as Current}from'./features/artisan/learning/module3-journey-content';import{Module3JourneyContent as Previous}from'baseline';import{MODULE3_ID,MODULE3_SESSIONS}from'./shared/learning/module3-journey';import{MODULE3_CONTENT_VERSION}from'./shared/learning/module3-version';import{downloadModule}from'./shared/offline/module3-storage';import{isOfflineModule}from'./shared/offline/module3-types';import{LEARNING_PROGRAM}from'./shared/learning/program';
  const resources=${JSON.stringify(resources)};const courseId=LEARNING_PROGRAM.id;const props={courseId,resources:[],completedIds:[]};window.regression=MODULE3_SESSIONS.slice(1).flatMap(s=>[false].map(offline=>{const p={...props,lessonId:s.id,offline};return renderToStaticMarkup(React.createElement(Current,p))===renderToStaticMarkup(React.createElement(Previous,p))})).every(Boolean);window.downloadable=LEARNING_PROGRAM.modules.filter(m=>isOfflineModule(m.id)).map(m=>m.order);window.downloadSession4=()=>downloadModule({userId:'isolated-session4-test',courseId,courseTitle:LEARNING_PROGRAM.title,moduleId:MODULE3_ID,title:'Módulo 3',description:null,contentVersion:MODULE3_CONTENT_VERSION,progress:{completedLessonIds:[],capturedAt:new Date().toISOString()},lessons:MODULE3_SESSIONS.map(s=>({id:s.id,title:s.title,content:null,resources:s.order===4?resources:[]}))},()=>{});`,
    resolveDir: process.cwd(),
    loader: "tsx"
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env": "{}",
    "process.browser": "true"
  },
  plugins: [
    {
      name: "comparison",
      setup(builder) {
        builder.onResolve({ filter: /^baseline$/ }, () => ({
          path: "baseline",
          namespace: "comparison"
        }));
        builder.onLoad({ filter: /.*/, namespace: "comparison" }, () => ({
          contents: previous,
          loader: "tsx",
          resolveDir: join(process.cwd(), "features/artisan/learning")
        }));
        builder.onResolve({ filter: /actions\/artisan\/complete-lesson$/ }, () => ({
          path: "action",
          namespace: "test"
        }));
        builder.onLoad({ filter: /.*/, namespace: "test" }, () => ({
          contents:
            "export async function completeLessonAction(){throw Error('Unexpected completion');}",
          loader: "js"
        }));
      }
    }
  ]
});
const browser = await chromium.launch({
  headless: true,
  channel: process.env.WARMI_BROWSER_CHANNEL || "msedge"
});
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
const course = `${origin}/artesana/aprender/93dc7355-d746-4acd-87df-29f71d16a955`;
const output = join(tmpdir(), "warmi-session4-offline-design");
await mkdir(output, { recursive: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: class {
        constructor(text) {
          this.text = text;
        }
      }
    });
    const voice = {
      name: "Prueba local español",
      voiceURI: "test-local-es",
      lang: "es-ES",
      localService: true,
      default: true
    };
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [voice],
        speaking: false,
        paused: false,
        addEventListener() {},
        removeEventListener() {},
        cancel() {},
        pause() {},
        resume() {},
        speak(utterance) {
          window.testSpoken = (window.testSpoken || "") + utterance.text;
          utterance.onstart?.();
          setTimeout(() => utterance.onend?.(), 0);
        }
      }
    });
  });
  const guide = record.lessonFiles.find((r) => r.file?.mimeType === "application/pdf");
  await context.route(`**/api/learning/offline/*/files/${guide.file.id}`, (route) =>
    route.fulfill({ contentType: "application/pdf", body: pdf })
  );
  let page = await context.newPage();
  await page.goto(`${origin}/offline-learning`);
  await page.waitForLoadState("networkidle");
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  assert.equal(
    await page.evaluate(() => window.regression),
    true,
    "All online session renders unchanged"
  );
  assert.deepEqual(await page.evaluate(() => window.downloadable), [3]);
  await page.evaluate(() => window.downloadSession4());
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.close();
  page = await context.newPage();
  await page.goto(`${course}/lecciones/${lessonId}`);
  await page.locator("[data-module3-session4-offline]").waitFor();
  const steps = [
    "Acuerdo la entrega",
    "Empaqueto con cuidado",
    "Envío y guardo la prueba",
    "Aviso y hago seguimiento"
  ];
  for (const width of [360, 390, 430, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    for (const [index, title] of steps.entries()) {
      await page.getByRole("button", { name: "Pasos", exact: true }).click();
      assert.equal(await page.getByRole("dialog").getByRole("listitem").count(), 4);
      await page
        .getByRole("dialog")
        .getByRole("button", { name: title, exact: true })
        .click();
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      await page.locator(`[data-session4-step="${index + 1}"]`).waitFor();
      await assertOfflineImages(page, "[data-module3-session4-offline]");
      const checks = page.getByRole("checkbox");
      assert.equal(await checks.count(), index === 0 ? 5 : 4);
      await checks.first().check();
      assert.equal(await checks.first().isChecked(), true);
      await checks.first().uncheck();
      assert.equal(await checks.first().isChecked(), false);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `overflow ${width}/${index}`
      );
      await page.evaluate(() => window.scrollTo(0, 0));
      if (width === 390)
        await page.screenshot({
          path: join(output, `step-${index + 1}.png`),
          fullPage: true
        });
    }
  }
  await page.getByRole("button", { name: "Anterior", exact: true }).click();
  await page.locator('[data-session4-step="3"]').waitFor();
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await page.getByRole("button", { name: "Ver guía de entrega", exact: true }).click();
  const localUrl = await page.locator("iframe").getAttribute("src");
  assert.ok(localUrl.startsWith("/__warmi_offline__/"));
  assert.equal(
    await page.evaluate(async (url) => (await fetch(url)).status, localUrl),
    200
  );
  await page.getByRole("button", { name: "Volver a la sesión", exact: true }).click();
  await page.getByRole("button", { name: "Escuchar este paso", exact: true }).click();
  await page.waitForFunction(() =>
    window.testSpoken?.includes("Aviso y hago seguimiento")
  );
  await page
    .getByRole("button", { name: "Ver logros del Módulo 3", exact: true })
    .click();
  await page.locator("[data-module3-closing]").waitFor();
  await assertOfflineImages(page, "[data-module3-closing]");
  assert.equal(await page.locator("[data-module3-closing] li").count(), 4);
  assert.equal(await page.locator("[data-m3-step]").count(), 0);
  await page.getByRole("button", { name: "Escuchar mis logros", exact: true }).click();
  await page.waitForFunction(() => window.testSpoken?.includes("Publico en mis estados"));
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    if (width === 390)
      await page.screenshot({ path: join(output, "outcomes.png"), fullPage: true });
  }
  await page.getByRole("button", { name: "Volver a la sesión 4", exact: true }).click();
  await page.locator('[data-session4-step="4"]').waitFor();
  await page
    .getByRole("button", { name: "Ver logros del Módulo 3", exact: true })
    .click();
  const snapshot = await page.evaluate(async () => {
    const db = await new Promise((res) => {
      const req = indexedDB.open("warmi-learning-offline", 1);
      req.onsuccess = () => res(req.result);
    });
    const values = await new Promise((res) => {
      const req = db.transaction("downloads").objectStore("downloads").getAll();
      req.onsuccess = () => res(req.result);
    });
    db.close();
    return {
      progress: values[0].progress.completedLessonIds,
      lessons: values[0].lessons.length
    };
  });
  assert.deepEqual(snapshot, { progress: [], lessons: 4 });
  await page
    .getByRole("navigation", { name: "Navegación de logros" })
    .getByRole("link", { name: "Regresar a Mi aprendizaje", exact: true })
    .click();
  await page.locator("[data-offline-module-overview]").waitFor();
  await page.goto(`${course}/lecciones/${lessonId}`);
  await page.getByRole("link", { name: "Volver al módulo 3", exact: true }).click();
  await page.locator("[data-offline-module-overview]").waitFor();
  await page.getByRole("button", { name: "Eliminar descarga", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Este contenido todavía no está disponible sin conexión." })
    .waitFor();
  await context.setOffline(false);
  assert.equal(JSON.stringify(await read()), before, "S4 and File/LessonFile unchanged");
  console.log(
    `PASS: S4 four steps/checklists/voice API/real cached PDF/close-reopen/outcomes/returns/no false completion/delete/reconnect; mobile 360/390/430/1024; online sessions unchanged; only M3 downloadable. Screenshots: ${output}`
  );
} finally {
  await browser.close();
  await db.$disconnect();
}
