import { navigateDownloadedLearning } from "./offline-navigation.browser.mjs";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { build } = require(
  require.resolve("esbuild", { paths: [require.resolve("tsx/package.json")] })
);
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
const profile = await mkdtemp(join(tmpdir(), "warmi-offline-test-"));
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR1sAAAAASUVORK5CYII=",
  "base64"
);
function pdf() {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>",
    "<< /Length 0 >>\nstream\n\nendstream"
  ];
  let text = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(text));
    text += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const offset = Buffer.byteLength(text);
  text += `xref\n0 5\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((value) => `${String(value).padStart(10, "0")} 00000 n \n`)
    .join("")}trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
  return Buffer.from(text);
}
const files = {
  image: { body: png, mime: "image/png" },
  pdf: { body: pdf(), mime: "application/pdf" }
};
if (process.env.WARMI_TEST_MP4)
  files.video = { body: await readFile(process.env.WARMI_TEST_MP4), mime: "video/mp4" };
const resources = Object.entries(files).map(([id, file]) => ({
  id,
  title: id,
  description: "Recurso de prueba aislada",
  type: id === "image" ? "IMAGE" : id === "pdf" ? "PDF" : "VIDEO_UPLOAD",
  externalUrl: null,
  file: { id, mimeType: file.mime, size: file.body.length }
}));
resources.push({
  id: "external",
  title: "Enlace externo",
  description: null,
  type: "EXTERNAL_LINK",
  externalUrl: "https://example.com",
  file: null
});
const snapshot = {
  userId: "offline-test-artisan",
  courseId: "offline-test-course",
  courseTitle: "Curso de prueba aislada",
  moduleId: "offline-test-module",
  title: "Módulo 3: Herramientas digitales para vender",
  description: "Texto local de prueba",
  supportLessons: [
    {
      id: "support-original",
      title: "Lección de apoyo original",
      content: "Texto de apoyo local.",
      resources: []
    }
  ],
  lessons: [
    {
      id: "lesson-one",
      title: "Primera lección",
      content: "Texto disponible sin internet.",
      resources
    },
    {
      id: "lesson-two",
      title: "Segunda lección",
      content: "Otra lectura local.",
      resources: []
    }
  ]
};
resources.push({
  id: "support-reference",
  title: "Repasar material de apoyo",
  description: null,
  type: "EXTERNAL_LINK",
  externalUrl: "/artesana/aprender/offline-test-course/lecciones/support-original",
  internalLessonId: "support-original",
  file: null
});
const bundled = await build({
  stdin: {
    contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {ModuleDownload} from './features/artisan/offline/module-download'; import * as storage from './shared/offline/module3-storage'; window.offlineTest = {...storage, mount(snapshot) {const host = document.createElement('div'); host.style.paddingBottom='160px'; document.body.append(host); createRoot(host).render(React.createElement(ModuleDownload, {module:snapshot}));}};`,
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
let context;
let failPdf = true;
async function openBrowser(online) {
  context = await chromium.launchPersistentContext(profile, {
    headless: true,
    channel: process.env.WARMI_BROWSER_CHANNEL || undefined,
    viewport: { width: 390, height: 844 },
    offline: !online
  });
  await context.route("**/api/auth/session", (route) =>
    route.fulfill({
      json: {
        user: { id: snapshot.userId, name: "Prueba offline", roles: ["ARTESANA"] },
        expires: "2099-01-01T00:00:00.000Z"
      }
    })
  );
  await context.route(
    "**/api/learning/offline/offline-test-course/files/*",
    async (route) => {
      const id = new URL(route.request().url()).pathname.split("/").pop();
      const file = files[id];
      if (!file || (id === "pdf" && failPdf))
        return route.fulfill({ status: 502, body: "download failed" });
      return route.fulfill({ contentType: file.mime, body: file.body });
    }
  );
  return context.pages()[0] || context.newPage();
}
try {
  let page = await openBrowser(true);
  await page.goto(`${origin}/offline-learning`);
  await page.waitForSelector("main");
  if (!files.video) {
    const recorded = await page.evaluate(async () => {
      const mimeType = 'video/mp4;codecs="avc1.42001E"';
      if (!MediaRecorder.isTypeSupported(mimeType)) return null;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 128;
      const drawing = canvas.getContext("2d");
      const stream = canvas.captureStream(10);
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];
      const finished = new Promise((resolve) => {
        recorder.ondataavailable = (event) => chunks.push(event.data);
        recorder.onstop = async () =>
          resolve(
            Array.from(
              new Uint8Array(await new Blob(chunks, { type: "video/mp4" }).arrayBuffer())
            )
          );
      });
      recorder.start();
      let frame = 0;
      const timer = setInterval(() => {
        drawing.fillStyle = frame++ % 2 ? "#b5245b" : "#17c3cf";
        drawing.fillRect(0, 0, 128, 128);
      }, 100);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      clearInterval(timer);
      recorder.stop();
      const bytes = await finished;
      stream.getTracks().forEach((track) => track.stop());
      return bytes;
    });
    if (recorded) {
      files.video = { body: Buffer.from(recorded), mime: "video/mp4" };
      resources.push({
        id: "video",
        title: "Video MP4",
        description: "Video de prueba generado localmente",
        type: "VIDEO_UPLOAD",
        externalUrl: null,
        file: { id: "video", mimeType: "video/mp4", size: files.video.body.length }
      });
    }
  }
  await page.addScriptTag({ content: bundled.outputFiles[0].text });
  await page.evaluate((value) => window.offlineTest.mount(value), snapshot);
  const button = page.getByRole("button", { name: "Descargar para usar sin internet" });
  await button.click();
  await page.getByText("Error de descarga", { exact: true }).waitFor({ timeout: 90000 });
  assert.equal(
    await page.evaluate(async () =>
      Boolean(await window.offlineTest.readDownload("offline-test-module"))
    ),
    false
  );
  assert.equal(
    await page.evaluate(
      async () =>
        (await caches.keys()).filter((name) => name.startsWith("warmi-learning-module-"))
          .length
    ),
    0
  );
  failPdf = false;
  await button.click();
  await page
    .getByText("Disponible sin conexión", { exact: true })
    .waitFor({ timeout: 90000 });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const bytes = await page.evaluate(
    async () => (await window.offlineTest.readDownload("offline-test-module")).bytes
  );
  assert.equal(
    bytes,
    Object.values(files).reduce((total, file) => total + file.body.length, 0)
  );
  const isolation = await page.evaluate(async (snapshot) => {
    await window.offlineTest.downloadModule(
      { ...snapshot, moduleId: "second-module-test" },
      () => {}
    );
    const two = await window.offlineTest.verifiedDownloads();
    await window.offlineTest.removeDownload("second-module-test");
    const first = await window.offlineTest.verifiedDownload(snapshot.moduleId);
    return {
      count: two.length,
      preserved: Boolean(first),
      remaining: (await window.offlineTest.readDownloads()).length
    };
  }, snapshot);
  assert.deepEqual(isolation, { count: 2, preserved: true, remaining: 1 });
  await context.close();
  page = await openBrowser(false);
  await page.goto(`${origin}/artesana/aprender`);
  await page.getByRole("link", { name: "Continuar mi aprendizaje", exact: true }).click();
  await page.getByText(snapshot.title, { exact: true }).waitFor();
  if (
    await page
      .locator("details:not([open]) > summary")
      .getByText("Todas las sesiones", { exact: true })
      .count()
  )
    await page.getByText("Todas las sesiones", { exact: true }).click();
  await page.getByRole("link", { name: "1. Primera lección" }).click();
  assert.equal(
    await page.locator("[data-offline-lesson-text]").evaluate((el) => el.open),
    false
  );
  await page.getByText("Leer texto completo", { exact: true }).click();
  await page.getByText("Texto disponible sin internet.", { exact: true }).waitFor();
  await page.getByRole("link", { name: "Abrir lección de apoyo" }).click();
  await page.getByText("Leer texto completo", { exact: true }).click();
  await page.getByText("Texto de apoyo local.", { exact: true }).waitFor();
  if (
    await page
      .locator("details:not([open]) > summary")
      .getByText("Todas las sesiones", { exact: true })
      .count()
  )
    await page.getByText("Todas las sesiones", { exact: true }).click();
  await page.getByRole("link", { name: "1. Primera lección" }).click();
  assert.equal(
    await page.locator("[data-offline-lesson-text]").evaluate((el) => el.open),
    false
  );
  await page.getByText("Leer texto completo", { exact: true }).click();
  await page.getByText("Texto disponible sin internet.", { exact: true }).waitFor();
  await page.getByText("Leer texto completo", { exact: true }).click();
  await page.locator("img[src^='/__warmi_offline__']").waitFor();
  assert.equal(
    await page
      .locator("img[src^='/__warmi_offline__']")
      .evaluate((image) => image.complete && image.naturalWidth > 0),
    true
  );
  const pdfUrl = await page.getByRole("link", { name: "Abrir PDF" }).getAttribute("href");
  const localPdf = await page.evaluate(async (url) => {
    const response = await fetch(url);
    return {
      mime: response.headers.get("Content-Type"),
      signature: (await response.text()).slice(0, 8)
    };
  }, pdfUrl);
  assert.equal(localPdf.mime, "application/pdf");
  assert.equal(localPdf.signature, "%PDF-1.4");
  await page.getByRole("button", { name: "Abrir enlace", exact: true }).click();
  await page
    .getByText("Este recurso necesita conexión a internet.", { exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Escuchar explicación", exact: true }).click();
  // The native synthesis API is invoked; audible output depends on installed OS voices.
  assert.equal(await page.evaluate(() => "speechSynthesis" in window), true);
  if (files.video) {
    await page.locator("video").evaluate((video) => video.play());
    await page.waitForFunction(() => document.querySelector("video")?.currentTime > 0);
  }
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    true
  );
  await page.screenshot({
    path: join(tmpdir(), "warmi-offline-mobile.png"),
    fullPage: true
  });
  await page.setViewportSize({ width: 1365, height: 900 });
  await page.screenshot({
    path: join(tmpdir(), "warmi-offline-desktop.png"),
    fullPage: true
  });
  if (
    await page
      .locator("details:not([open]) > summary")
      .getByText("Todas las sesiones", { exact: true })
      .count()
  )
    await page.getByText("Todas las sesiones", { exact: true }).click();
  await page.getByRole("link", { name: "2. Segunda lección" }).click();
  await page.getByText("Leer texto completo", { exact: true }).click();
  await page.getByText("Otra lectura local.", { exact: true }).waitFor();
  await navigateDownloadedLearning(
    page,
    `${origin}/artesana/aprender/offline-test-course/lecciones/not-downloaded`
  );
  await page
    .getByText("Este contenido todavía no está disponible sin conexión.", { exact: true })
    .waitFor();
  await navigateDownloadedLearning(
    page,
    `${origin}/artesana/aprender/offline-test-course`
  );
  await context.setOffline(false);
  await page.getByRole("button", { name: "Volver con conexión" }).waitFor();
  await page.getByRole("button", { name: "Eliminar descarga" }).click();
  await page
    .getByText("Este contenido todavía no está disponible sin conexión.", { exact: true })
    .waitFor();
  const remaining = await page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("warmi-learning-offline", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = reject;
    });
    const record = await new Promise((resolve, reject) => {
      const request = db
        .transaction("downloads")
        .objectStore("downloads")
        .get("module:offline-test-module");
      request.onsuccess = () => resolve(request.result);
      request.onerror = reject;
    });
    db.close();
    return {
      record: Boolean(record),
      caches: (await caches.keys()).filter((name) =>
        name.startsWith("warmi-learning-module-")
      )
    };
  });
  assert.equal(remaining.record, false);
  assert.deepEqual(remaining.caches, []);
  console.log(
    `PASS: download, rollback, browser restart offline, routes, lessons, image, PDF, external link guard, native voice API, reconnect, deletion. MP4 playback: ${files.video ? "PASS" : "pending client MP4"}. Screenshots: ${join(tmpdir(), "warmi-offline-mobile.png")}, ${join(tmpdir(), "warmi-offline-desktop.png")}`
  );
} catch (error) {
  const failedPage = context?.pages()[0];
  if (failedPage)
    console.error(
      await failedPage
        .evaluate(() => ({
          url: location.href,
          content: document.body.innerText.slice(0, 2500)
        }))
        .catch(() => "Page unavailable")
    );
  throw error;
} finally {
  await context?.close();
  assert.equal(dirname(resolve(profile)), resolve(tmpdir()));
  assert.equal(
    resolve(profile).startsWith(join(resolve(tmpdir()), "warmi-offline-test-")),
    true
  );
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 });
}
