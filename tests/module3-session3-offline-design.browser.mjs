import assert from "node:assert/strict";
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
const lessonId = "15d03f59-f6d2-4e13-b562-f7c6799e75d9";
const read = () =>
  db.lessonFile.findMany({
    where: { lessonId },
    orderBy: { position: "asc" },
    include: { file: true }
  });
let links;
try {
  links = await read();
} catch (error) {
  await db.$disconnect();
  throw error;
}
const before = JSON.stringify(links);
const files = new Map();
try {
  assert.equal(links.filter((r) => r.file?.mimeType === "video/mp4").length, 2);
  assert.equal(links.filter((r) => r.file?.mimeType === "application/pdf").length, 1);
  for (const link of links.filter((r) => r.file)) {
    const response = await fetch(link.file.url, { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, link.file.publicId);
    files.set(link.file.id, {
      mime: link.file.mimeType,
      body: Buffer.from(await response.arrayBuffer())
    });
    console.log(
      `HTTP 200: ${link.file.publicId}; File ${link.file.id}; LessonFile ${link.id}; position ${link.position}`
    );
  }
} catch (error) {
  await db.$disconnect();
  throw error;
}
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { build } = require(
  require.resolve("esbuild", { paths: [require.resolve("tsx/package.json")] })
);
const previous = execFileSync(
  "git",
  ["show", "8939d7d:features/artisan/learning/module3-journey-content.tsx"],
  { encoding: "utf8" }
);
const resources = links
  .filter((r) => r.file)
  .map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    type: r.type,
    externalUrl: r.originalUrl,
    file: { id: r.file.id, mimeType: r.file.mimeType, size: r.file.size }
  }));
const bundle = await build({
  stdin: {
    contents: `import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import{Module3JourneyContent as Current}from'./features/artisan/learning/module3-journey-content';import{Module3JourneyContent as Previous}from'baseline';import{MODULE3_ID,MODULE3_SESSIONS}from'./shared/learning/module3-journey';import{MODULE3_CONTENT_VERSION}from'./shared/learning/module3-version';import{downloadModule}from'./shared/offline/module3-storage';
  const resources=${JSON.stringify(resources)};const courseId='93dc7355-d746-4acd-87df-29f71d16a955';const props={courseId,lessonId:MODULE3_SESSIONS[2].id,resources:resources.map(r=>({id:r.id,title:r.title,mimeType:r.file.mimeType,publicId:r.externalUrl,url:'/unused'})),completedIds:[]};window.unchanged=MODULE3_SESSIONS.slice(1).flatMap(s=>[false,true].filter(offline=>!offline||s.order!==3).map(offline=>{const p={...props,lessonId:s.id,offline};return renderToStaticMarkup(React.createElement(Current,p))===renderToStaticMarkup(React.createElement(Previous,p))})).every(Boolean);window.downloadSession3=()=>downloadModule({userId:'isolated-session3-test',courseId,courseTitle:'Aprender para crecer',moduleId:MODULE3_ID,title:'Módulo 3',description:null,contentVersion:MODULE3_CONTENT_VERSION,progress:{completedLessonIds:[],capturedAt:new Date().toISOString()},lessons:MODULE3_SESSIONS.map(s=>({id:s.id,title:s.title,content:null,resources:s.order===3?resources:[]}))},()=>{});`,
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
      name: "baseline",
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
const output = join(tmpdir(), "warmi-session3-offline-design");
await mkdir(output, { recursive: true });
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
const course = `${origin}/artesana/aprender/93dc7355-d746-4acd-87df-29f71d16a955`;
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route("**/api/learning/offline/*/files/*", (route) => {
    const file = files.get(route.request().url().split("/").pop());
    return file
      ? route.fulfill({ contentType: file.mime, body: file.body })
      : route.fulfill({ status: 404 });
  });
  const page = await context.newPage();
  await page.goto(`${origin}/offline-learning`);
  await page.waitForLoadState("networkidle");
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  assert.equal(
    await page.evaluate(() => window.unchanged),
    true,
    "S3 online, S2 and S4 keep their render"
  );
  await page.evaluate(() => window.downloadSession3());
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto(`${course}/lecciones/${lessonId}`);
  await reopened.locator("[data-module3-session3-offline]").waitFor();
  for (const method of ["Yape", "Plin", "Yape"]) {
    await reopened.getByRole("button", { name: method, exact: true }).click();
    const video = reopened.locator("[data-module3-session3-offline] video");
    assert.equal(await video.count(), 1);
    const link = links.find(
      (r) => r.file?.mimeType === "video/mp4" && r.file.publicId.includes(method)
    );
    assert.ok((await video.getAttribute("src")).endsWith(link.file.id));
    await video.evaluate(async (el) => {
      await el.play();
    });
    await reopened.waitForFunction(
      () => document.querySelector("video")?.currentTime > 0.1
    );
    await video.evaluate((el) => el.pause());
  }
  for (const width of [360, 390, 430, 1024]) {
    await reopened.setViewportSize({ width, height: 844 });
    for (const [index, title] of [
      "Elige cómo cobrar",
      "Cobro seguro",
      "Señales de alerta"
    ].entries()) {
      await reopened.getByRole("button", { name: "Pasos", exact: true }).click();
      await reopened
        .getByRole("dialog")
        .getByRole("button", { name: title, exact: true })
        .click();
      await reopened.getByRole("dialog").waitFor({ state: "hidden" });
      await reopened.locator(`[data-session3-step="${index + 1}"]`).waitFor();
      assert.equal(
        await reopened.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `overflow ${width}/${index}`
      );
      if (index === 1)
        assert.equal(
          await reopened.locator("[data-module3-session3-offline] ol li").count(),
          4
        );
      if (width === 390)
        await reopened.screenshot({
          path: join(output, `step-${index + 1}.png`),
          fullPage: true
        });
    }
  }
  const alerts = reopened.locator(
    "[data-module3-session3-offline] button[aria-controls]"
  );
  assert.equal(await alerts.count(), 5);
  for (const alert of await alerts.all()) {
    await alert.click();
    assert.equal(await alert.getAttribute("aria-expanded"), "true");
    await alert.click();
    assert.equal(await alert.getAttribute("aria-expanded"), "false");
  }
  await reopened
    .getByRole("button", { name: "Ver guía de cobros seguros", exact: true })
    .click();
  const pdfUrl = await reopened.locator("iframe").getAttribute("src");
  assert.equal(
    await reopened.evaluate(async (url) => (await fetch(url)).status, pdfUrl),
    200
  );
  await reopened.getByRole("button", { name: "Volver a la sesión", exact: true }).click();
  assert.equal(await reopened.locator("iframe").count(), 0);
  await reopened.getByRole("button", { name: "Anterior", exact: true }).click();
  await reopened.locator('[data-session3-step="2"]').waitFor();
  await reopened.getByRole("button", { name: "Siguiente", exact: true }).click();
  await reopened
    .getByRole("button", { name: "Continuar a la sesión 4", exact: true })
    .click();
  await reopened.locator('[data-session-order="4"]').waitFor();
  const progress = await reopened.evaluate(async () => {
    const db = await new Promise((res) => {
      const req = indexedDB.open("warmi-learning-offline", 1);
      req.onsuccess = () => res(req.result);
    });
    const values = await new Promise((res) => {
      const req = db.transaction("downloads").objectStore("downloads").getAll();
      req.onsuccess = () => res(req.result);
    });
    db.close();
    return values[0].progress.completedLessonIds;
  });
  assert.deepEqual(progress, []);
  await reopened.goto(`${course}/lecciones/${lessonId}`);
  await reopened.getByRole("link", { name: "Volver al módulo 3", exact: true }).click();
  await reopened.locator("[data-offline-module-overview]").waitFor();
  await reopened.getByRole("button", { name: "Eliminar descarga", exact: true }).click();
  await reopened
    .getByRole("status")
    .filter({ hasText: "Este contenido todavía no está disponible sin conexión." })
    .waitFor();
  await context.setOffline(false);
  assert.equal(JSON.stringify(await read()), before, "File/LessonFile remain intact");
  console.log(
    `PASS: real Yape/Plin MP4 offline playback and switching; cached real PDF; three steps; five accordions; mobile 360/390/430/1024; close/reopen; S4 navigation; progress preserved; return/delete/reconnect; online and other sessions unchanged. Screenshots: ${output}`
  );
} finally {
  await browser.close();
  await db.$disconnect();
}
