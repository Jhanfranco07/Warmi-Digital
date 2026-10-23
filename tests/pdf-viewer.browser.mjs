import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { assertPdfRendered } from "./helpers/offline-visuals.mjs";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { PrismaClient } = require("@prisma/client");
const { chromium, devices } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { build } = require(
  require.resolve("esbuild", { paths: [require.resolve("tsx/package.json")] })
);
const db = new PrismaClient();
const lessonId = "8a8e449b-76a6-4a6d-9693-6238f75092bc";
const courseId = "93dc7355-d746-4acd-87df-29f71d16a955";
const read = () =>
  db.lesson.findUniqueOrThrow({
    where: { id: lessonId },
    include: { lessonFiles: { orderBy: { position: "asc" }, include: { file: true } } }
  });
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
const profile = await mkdtemp(join(tmpdir(), "warmi-pdf-profile-"));
const output = join(tmpdir(), "warmi-pdf-viewer");
await mkdir(output, { recursive: true });
let context;
try {
  const record = await read();
  const before = JSON.stringify(record);
  const guides = record.lessonFiles.filter(
    (resource) => resource.file?.mimeType === "application/pdf"
  );
  assert.equal(guides.length, 7);
  assert.deepEqual(
    guides.map((resource) => resource.position),
    [10, 11, 12, 13, 14, 15, 16]
  );
  const bytes = new Map();
  for (const resource of guides) {
    const response = await fetch(resource.file.url, {
      signal: AbortSignal.timeout(30000)
    });
    assert.equal(response.status, 200);
    bytes.set(resource.file.id, Buffer.from(await response.arrayBuffer()));
  }
  const resources = guides.map((resource) => ({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    type: resource.type,
    externalUrl: resource.originalUrl,
    file: {
      id: resource.file.id,
      mimeType: resource.file.mimeType,
      size: bytes.get(resource.file.id).length
    }
  }));
  const bundle = await build({
    stdin: {
      contents: `import React from'react';import{createRoot}from'react-dom/client';import{PdfViewer}from'./shared/components/media/pdf-viewer';import{downloadModule}from'./shared/offline/module3-storage';import{MODULE3_ID,MODULE3_SESSIONS}from'./shared/learning/module3-journey';import{MODULE3_SESSION1_TOPICS}from'./shared/learning/module3-session1';import{MODULE3_CONTENT_VERSION}from'./shared/learning/module3-version';window.topics=MODULE3_SESSION1_TOPICS;window.downloadPdfGuides=()=>downloadModule({userId:'isolated-pdf-test',courseId:'${courseId}',courseTitle:'Aprender para crecer',moduleId:MODULE3_ID,title:'Módulo 3',description:null,contentVersion:MODULE3_CONTENT_VERSION,progress:{completedLessonIds:[],capturedAt:new Date().toISOString()},lessons:MODULE3_SESSIONS.map(s=>({id:s.id,title:s.title,content:null,resources:s.id==='${lessonId}'?${JSON.stringify(resources)}:[]}))},()=>{});window.previewPdf=()=>{const host=document.createElement('div');document.body.append(host);createRoot(host).render(React.createElement(PdfViewer,{src:'/test-guide.pdf',title:'Prueba de recuperación'}));};`,
      resolveDir: process.cwd(),
      loader: "tsx"
    },
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' }
  });
  const options = {
    headless: true,
    args: ["--disable-gpu"],
    channel: process.env.WARMI_BROWSER_CHANNEL || "msedge",
    ...devices["Pixel 7"],
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  };
  context = await chromium.launchPersistentContext(profile, options);
  const authenticated = (route) =>
    route.fulfill({
      json: {
        user: { id: "isolated-pdf-test", roles: ["ARTESANA"] },
        expires: "2099-01-01T00:00:00.000Z"
      }
    });
  await context.route("**/api/auth/session", authenticated);
  await context.route("**/api/learning/offline/*/files/*", (route) => {
    const id = new URL(route.request().url()).pathname.split("/").pop();
    return route.fulfill({ contentType: "application/pdf", body: bytes.get(id) });
  });
  const errors = [];
  let page = context.pages()[0];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${origin}/offline-learning`);
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  let fail = true;
  await context.route("**/test-guide.pdf", (route) =>
    fail
      ? route.fulfill({ status: 404 })
      : route.fulfill({
          contentType: "application/pdf",
          body: bytes.values().next().value
        })
  );
  await page.evaluate(() => window.previewPdf());
  await page.getByRole("alert").filter({ hasText: "No se pudo abrir la guía" }).waitFor();
  fail = false;
  await page.getByRole("button", { name: "Reintentar", exact: true }).click();
  await assertPdfRendered(page);
  const topics = await page.evaluate(() => window.topics);
  await page.evaluate(() => window.downloadPdfGuides());
  // Offline must depend on Warmi's caches, not a previously warmed HTTP cache.
  const network = await context.newCDPSession(page);
  await network.send("Network.clearBrowserCache");
  await network.detach();
  await context.close();
  context = await chromium.launchPersistentContext(profile, {
    ...options,
    offline: true
  });
  await context.route("**/api/auth/session", authenticated);
  page = context.pages()[0];
  page.on("pageerror", (error) => errors.push(error.message));
  const readerWorkers = [];
  page.on("worker", (worker) => readerWorkers.push(worker.url()));
  await page.goto(`${origin}/artesana/aprender/${courseId}/lecciones/${lessonId}`);
  await page.locator("[data-module3-session1]").waitFor();
  // The viewer can read downloaded bytes even if SW interception is unavailable.
  const coldReader = await context.newCDPSession(page);
  await coldReader.send("Network.setCacheDisabled", { cacheDisabled: true });
  await coldReader.send("Network.setBypassServiceWorker", { bypass: true });
  await page.evaluate(() => {
    const original = window.fetch;
    window.restorePdfTestFetch = () => {
      window.fetch = original;
    };
    window.fetch = (input, init) => {
      const url = new URL(
        typeof input === "string" ? input : (input.url ?? input),
        location.href
      );
      if (
        url.pathname.startsWith("/__warmi_offline__/") ||
        url.pathname.startsWith("/pdfjs/")
      )
        return Promise.reject(new TypeError("Simulated offline URL delivery failure"));
      return original(input, init);
    };
  });
  let pages = 0;
  for (const [index, topic] of topics.entries()) {
    await page.getByRole("button", { name: "Temas", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: topic.title, exact: true })
      .click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page.getByRole("button", { name: /^Abrir guía PDF:/ }).click();
    await assertPdfRendered(page);
    assert.equal(await page.locator("iframe").count(), 0);
    while (true) {
      pages++;
      const next = page.getByRole("button", { name: "Página siguiente", exact: true });
      if (await next.isDisabled()) break;
      const label = await page
        .locator("[data-pdf-viewer] canvas")
        .getAttribute("aria-label");
      await next.click();
      await page.waitForFunction(
        (previous) =>
          document
            .querySelector("[data-pdf-viewer] canvas")
            ?.getAttribute("aria-label") !== previous,
        label
      );
      await assertPdfRendered(page);
    }
    const previous = page.getByRole("button", { name: "Página anterior", exact: true });
    if (await previous.isEnabled()) {
      await previous.click();
      await assertPdfRendered(page);
    }
    for (const width of [360, 390, 430, 1024]) {
      await page.setViewportSize({ width, height: 844 });
      await page.getByRole("button", { name: "Ampliar", exact: true }).click();
      await assertPdfRendered(page);
      await page.getByRole("button", { name: "Ajustar al ancho", exact: true }).click();
      await assertPdfRendered(page);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true
      );
      if (width === 390) {
        await page
          .locator("[data-pdf-viewer]")
          .screenshot({ path: join(output, `guide-${index + 1}.png`) });
      }
    }
    await page.getByRole("button", { name: "Volver a la lección", exact: true }).click();
    assert.equal(await page.locator("[data-pdf-viewer]").count(), 0);
  }
  assert.equal(JSON.stringify(await read()), before);
  assert.deepEqual(errors, []);
  assert.ok(readerWorkers.length >= 7);
  assert.ok(readerWorkers.every((url) => url.startsWith("blob:")));
  await page.evaluate(() => window.restorePdfTestFetch());
  await coldReader.send("Network.setBypassServiceWorker", { bypass: false });
  await coldReader.detach();
  await context.setOffline(false);
  await page.getByRole("button", { name: /^Abrir guía PDF:/ }).click();
  await assertPdfRendered(page);
  console.log(
    `PASS: seven real PDFs, ${pages} rendered pages with nonblank pixels; full browser restart offline and cleared HTTP cache; direct saved bytes with offline URL delivery disabled; blob worker bootstrap; no iframe/native viewer; next/previous/zoom/fit; 360/390/430/1024; error/retry online; return/reopen/reconnect; DB untouched. Android emulation, not a physical device. Screenshots: ${output}`
  );
} finally {
  await context?.close();
  await db.$disconnect();
}
