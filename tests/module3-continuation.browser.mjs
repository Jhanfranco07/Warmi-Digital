import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { build } = require(
  require.resolve("esbuild", { paths: [require.resolve("tsx/package.json")] })
);
const pdf = await readFile("output/pdf/module3-sessions-2-4/elegir-donde-vender.pdf");
const bundle = await build({
  stdin: {
    contents: `import React from'react';import{createRoot}from'react-dom/client';import{ModuleDownload}from'./features/artisan/offline/module-download';import{Module3JourneyContent}from'./features/artisan/learning/module3-journey-content';import{ResumeLearning}from'./features/artisan/learning/resume-learning';import{MODULE3_SESSIONS,MODULE3_ID}from'./shared/learning/module3-journey';import{MODULE3_CONTENT_VERSION}from'./shared/learning/module3-version';import{readDownloads,readDownloadAttempt}from'./shared/offline/module3-storage';import{setReadingOwner}from'./shared/learning/reading-position';
    window.sessions=MODULE3_SESSIONS;window.contentVersion=MODULE3_CONTENT_VERSION;window.moduleId=MODULE3_ID;window.readDownloads=readDownloads;window.attempt=()=>readDownloadAttempt(window.fixture);let root;window.mount=(kind,props={})=>{if(!root){const host=document.createElement('main');host.dataset.testRoot='true';host.style.cssText='max-width:768px;margin:auto;padding:16px';[...document.body.children].forEach(e=>e.style.display='none');document.body.append(host);root=createRoot(host);}root.render(React.createElement(React.Fragment,{key:kind+JSON.stringify(props)},kind==='download'?React.createElement(ModuleDownload,{module:window.fixture}):kind==='resume'?React.createElement(ResumeLearning,{courseHref:'/artesana/aprender/'+window.fixture.courseId,allowedLessonIds:props.ids||MODULE3_SESSIONS.map(s=>s.id),userId:props.userId}):React.createElement(Module3JourneyContent,{courseId:window.fixture.courseId,lessonId:MODULE3_SESSIONS[2].id,resources:[],offline:true})));};window.ownBookmarks=()=>setReadingOwner(window.fixture.userId);`,
    resolveDir: process.cwd(),
    loader: "tsx"
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
  plugins: [
    {
      name: "no-progress-writes",
      setup(builder) {
        builder.onResolve({ filter: /actions\/artisan\/complete-lesson$/ }, () => ({
          path: "action",
          namespace: "fixture"
        }));
        builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
          loader: "js",
          contents:
            "export async function completeLessonAction(){throw Error('This test must not save academic progress')}"
        }));
      }
    }
  ]
});
const browser = await chromium.launch({
  headless: true,
  args: ["--disable-gpu"],
  channel: process.env.WARMI_BROWSER_CHANNEL || "msedge"
});
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
const output = join(tmpdir(), "warmi-module3-continuation");
await mkdir(output, { recursive: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  let block = true,
    fail = false,
    release,
    reached;
  const requestedB = new Promise((resolve) => (reached = resolve));
  const counts = new Map();
  await context.route("**/api/learning/offline/**/files/*", async (route) => {
    const id = new URL(route.request().url()).pathname.split("/").at(-1);
    counts.set(id, (counts.get(id) || 0) + 1);
    if (id === "b" && block) {
      reached();
      await new Promise((resolve) => (release = resolve));
    }
    await route
      .fulfill(
        id === "b" && fail
          ? { status: 503, body: "interrupted" }
          : { status: 200, contentType: "application/pdf", body: pdf }
      )
      .catch((error) => {
        if (
          !/closed|handled|canceled|cancelled|disposed|Invalid InterceptionId/i.test(
            error.message
          )
        )
          throw error;
      });
  });
  let page;
  let fixture;
  async function open(kind = "download", props = {}) {
    if (page) await page.close();
    page = await context.newPage();
    page.setDefaultTimeout(60000);
    await page.goto(`${origin}/offline-learning`, { waitUntil: "domcontentloaded" });
    await page.locator("[data-warmi-offline-learning]").waitFor({ state: "attached" });
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    if (!fixture)
      fixture = await page.evaluate(
        (size) => ({
          userId: "continuation-test",
          courseId: "93dc7355-d746-4acd-87df-29f71d16a955",
          courseTitle: "Aprender para crecer",
          moduleId: window.moduleId,
          title: "Módulo 3",
          description: null,
          contentVersion: window.contentVersion,
          progress: { completedLessonIds: [], capturedAt: new Date().toISOString() },
          lessons: window.sessions.map((s, i) => ({
            id: s.id,
            title: s.title,
            content: null,
            resources:
              i === 0
                ? ["a", "b"].map((id) => ({
                    id,
                    title: id,
                    type: "PDF",
                    description: null,
                    externalUrl: null,
                    file: { id, mimeType: "application/pdf", size, revision: "v1" }
                  }))
                : []
          }))
        }),
        pdf.length
      );
    await page.evaluate(
      ({ fixture, kind, props }) => {
        window.fixture = fixture;
        window.mount(kind, props);
      },
      { fixture, kind, props }
    );
  }
  await open();
  await page
    .locator("[data-test-root]")
    .getByText("No descargado", { exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Descargar para usar sin internet", exact: true })
    .click();
  await requestedB;
  await page.getByRole("button", { name: "Pausar descarga", exact: true }).click();
  await page
    .locator("[data-test-root]")
    .getByText("Descarga pausada", { exact: true })
    .waitFor();
  release();
  block = false;
  assert.equal(
    await page.getByRole("alert").count(),
    0,
    "A user pause is not a download error"
  );
  assert.equal(await page.evaluate(async () => (await window.readDownloads()).length), 0);
  assert.equal(
    await page.evaluate(async () => (await window.attempt()).bytes),
    pdf.length
  );
  await page.screenshot({ path: join(output, "paused-mobile.png"), fullPage: true });
  await open();
  await page
    .locator("[data-test-root]")
    .getByText("Descarga pausada", { exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Continuar descarga", exact: true }).click();
  await page
    .locator("[data-test-root]")
    .getByText("Disponible sin conexión", { exact: true })
    .waitFor();
  assert.equal(counts.get("a"), 1, "Continuing must reuse the completed file");
  await page.evaluate(() => {
    window.ownBookmarks();
    window.mount("session");
  });
  await page.getByRole("button", { name: "Pasos", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Señales de alerta", exact: true })
    .click();
  await page.locator('[data-session3-step="3"]').waitFor();
  await open("resume", { userId: fixture.userId });
  for (const width of [360, 390, 430, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    const link = page.getByRole("link", { name: /Continuar donde me quedé/ });
    await link.waitFor();
    assert.ok((await link.getAttribute("href")).endsWith(fixture.lessons[2].id));
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    );
    if (width === 390 || width === 1024)
      await page.screenshot({
        path: join(output, `resume-${width}.png`),
        fullPage: true
      });
  }
  await page.evaluate(
    (id) => window.mount("resume", { ids: [id] }),
    fixture.lessons[0].id
  );
  await page
    .locator("[data-test-root] [data-resume-learning]")
    .waitFor({ state: "detached" });
  await page.evaluate(() => window.mount("resume", { userId: "another-account" }));
  await page
    .locator("[data-test-root] [data-resume-learning]")
    .waitFor({ state: "detached" });
  await page.evaluate((userId) => window.mount("resume", { userId }), fixture.userId);
  await page.getByRole("link", { name: /Continuar donde me quedé/ }).waitFor();
  await context.setOffline(true);
  await page.getByRole("link", { name: /Continuar donde me quedé/ }).click();
  await page.locator('[data-module3-session3-offline][data-session3-step="3"]').waitFor();
  assert.deepEqual(
    await page.evaluate(async () => {
      const db = await new Promise((resolve) => {
        const r = indexedDB.open("warmi-learning-offline", 1);
        r.onsuccess = () => resolve(r.result);
      });
      const rows = await new Promise((resolve) => {
        const r = db.transaction("downloads").objectStore("downloads").getAll();
        r.onsuccess = () => resolve(r.result);
      });
      db.close();
      return rows[0].progress.completedLessonIds;
    }),
    []
  );
  await page.getByRole("link", { name: "Volver al módulo 3", exact: true }).click();
  await page.locator("[data-offline-module-overview] [data-resume-learning]").waitFor();
  await context.setOffline(false);
  await open();
  await page
    .locator("[data-test-root]")
    .getByText("Disponible sin conexión", { exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Eliminar descarga", exact: true }).click();
  await page
    .locator("[data-test-root]")
    .getByText("No descargado", { exact: true })
    .waitFor();
  fail = true;
  await page
    .getByRole("button", { name: "Descargar para usar sin internet", exact: true })
    .click();
  await page
    .locator("[data-test-root]")
    .getByText("Descarga incompleta", { exact: true })
    .waitFor();
  assert.equal(await page.evaluate(async () => (await window.readDownloads()).length), 0);
  await page.screenshot({ path: join(output, "incomplete-mobile.png"), fullPage: true });
  await open();
  await page
    .locator("[data-test-root]")
    .getByText("Descarga incompleta", { exact: true })
    .waitFor();
  fail = false;
  await page.getByRole("button", { name: "Continuar descarga", exact: true }).click();
  await page
    .locator("[data-test-root]")
    .getByText("Disponible sin conexión", { exact: true })
    .waitFor();
  const previous = await page.evaluate(
    async () => (await window.readDownloads())[0].cacheName
  );
  fixture = structuredClone(fixture);
  fixture.lessons[0].resources[1].file.revision = "v2";
  await open();
  await page.getByRole("button", { name: "Actualizar descarga", exact: true }).waitFor();
  fail = true;
  await page.getByRole("button", { name: "Actualizar descarga", exact: true }).click();
  await page
    .locator("[data-test-root]")
    .getByText("Descarga incompleta", { exact: true })
    .waitFor();
  await page
    .getByText("La descarga anterior sigue disponible sin conexión.", { exact: true })
    .waitFor();
  await page
    .getByRole("link", { name: "Abrir módulo descargado", exact: true })
    .waitFor();
  assert.equal(
    await page.evaluate(async () => (await window.readDownloads())[0].cacheName),
    previous
  );
  fail = false;
  await page.getByRole("button", { name: "Continuar descarga", exact: true }).click();
  await page
    .locator("[data-test-root]")
    .getByText("Disponible sin conexión", { exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Eliminar descarga", exact: true }).click();
  await page
    .locator("[data-test-root]")
    .getByText("No descargado", { exact: true })
    .waitFor();
  await page.evaluate(() => window.mount("resume"));
  await page
    .locator("[data-test-root] [data-resume-learning]")
    .waitFor({ state: "detached" });
  assert.equal(
    await page.evaluate(
      async () =>
        (await caches.keys()).filter((name) => name.startsWith("warmi-learning-module-"))
          .length
    ),
    0
  );
  console.log(
    `PASS: pause/resume and incomplete states persist after reopen; reuse completed files; previous package remains usable during failed update; resume exact session/step fully offline; only allowed lessons/account; 360/390/430/1024; no academic progress or DB writes. Screenshots: ${output}`
  );
} finally {
  await browser.close();
}
