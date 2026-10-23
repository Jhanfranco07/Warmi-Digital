import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, mkdir } from "node:fs/promises";
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
    contents: `import React from 'react';import{createRoot}from'react-dom/client';import{OfflineRuntime}from'./shared/offline/offline-runtime';import{LogoutForm}from'./shared/components/auth/logout-form';import{Module3Session1Content}from'./features/artisan/learning/module3-session1-content';import{Module3JourneyContent}from'./features/artisan/learning/module3-journey-content';import{PdfViewer}from'./shared/components/media/pdf-viewer';import{ModuleDownload}from'./features/artisan/offline/module-download';import{MODULE3_SESSIONS,MODULE3_ID}from'./shared/learning/module3-journey';import{downloadModule,readDownloads,verifiedDownload,removeDownload}from'./shared/offline/module3-storage';
      window.download=downloadModule;window.readDownloads=readDownloads;window.verifiedDownload=verifiedDownload;window.removeDownload=removeDownload;window.moduleId=MODULE3_ID;
      let root;window.mount=(kind,props={})=>{if(!root){const host=document.createElement('main');[...document.body.children].forEach(e=>e.style.display='none');host.style.cssText='max-width:768px;padding:16px;margin:auto';document.body.append(host);root=createRoot(host);}root.render(React.createElement(React.Fragment,{key:kind+JSON.stringify(props)},kind==='runtime'?React.createElement(OfflineRuntime):kind==='logout'?React.createElement(LogoutForm,null,React.createElement('button',{type:'submit'},'Cerrar sesión')):kind==='pdf'?React.createElement(PdfViewer,{src:'/test-guide.pdf',title:'Guía de resiliencia'}):kind==='download'?React.createElement(ModuleDownload,{module:window.fixture}):kind==='s1'?React.createElement(Module3Session1Content,{title:MODULE3_SESSIONS[0].title,content:null,resources:[],offline:true}):React.createElement(Module3JourneyContent,{courseId:'93dc7355-d746-4acd-87df-29f71d16a955',lessonId:MODULE3_SESSIONS[kind==='s2'?1:2].id,resources:[],offline:true})));};`,
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
      name: "isolated-session",
      setup(builder) {
        builder.onResolve({ filter: /^next-auth\/react$/ }, () => ({
          path: "session",
          namespace: "fixture"
        }));
        builder.onResolve({ filter: /actions\/auth\/logout$/ }, () => ({
          path: "logout",
          namespace: "fixture"
        }));
        builder.onResolve({ filter: /actions\/artisan\/complete-lesson$/ }, () => ({
          path: "completion",
          namespace: "fixture"
        }));
        builder.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
          loader: "js",
          contents:
            path === "session"
              ? "export function useSession(){return window.testSession||{status:'unauthenticated',data:null}}"
              : path === "logout"
                ? "export async function logout(){window.loggedOut=true}"
                : "export async function completeLessonAction(){throw Error('This test must not save progress')}"
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
const output = join(tmpdir(), "warmi-offline-resilience");
await mkdir(output, { recursive: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const requests = new Map();
  let failing = "b";
  await context.route("**/api/learning/offline/**/files/*", async (route) => {
    const id = new URL(route.request().url()).pathname.split("/").at(-1);
    requests.set(id, (requests.get(id) || 0) + 1);
    await route.fulfill(
      id === failing
        ? { status: 500, body: "interrupted" }
        : { status: 200, contentType: "application/pdf", body: pdf }
    );
  });
  await context.route("**/test-guide.pdf", (route) =>
    route.fulfill({ status: 200, contentType: "application/pdf", body: pdf })
  );
  let page;
  async function open() {
    if (page) await page.close();
    page = await context.newPage();
    page.setDefaultTimeout(60000);
    await page.goto(`${origin}/offline-learning`, { waitUntil: "domcontentloaded" });
    await page.locator("[data-warmi-offline-learning]").waitFor({ state: "attached" });
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
  }
  await open();
  const fixture = {
    userId: "resilience-owner",
    courseId: "93dc7355-d746-4acd-87df-29f71d16a955",
    moduleId: await page.evaluate(() => window.moduleId),
    title: "Módulo 3",
    courseTitle: "Aprender para crecer",
    contentVersion: "resilience-1",
    description: null,
    lessons: [
      {
        id: "fixture-lesson",
        title: "Fixture",
        content: null,
        resources: ["a", "b", "c"].map((id) => ({
          id,
          title: id,
          type: "PDF",
          description: null,
          externalUrl: null,
          file: { id, mimeType: "application/pdf", size: pdf.length, revision: "v1" }
        }))
      }
    ]
  };
  async function download(module) {
    return page.evaluate(async (module) => {
      try {
        await window.download(module, () => {});
        return "ok";
      } catch (e) {
        return e.message;
      }
    }, module);
  }
  assert.notEqual(await download(fixture), "ok");
  assert.equal(
    await page.evaluate(async () => (await window.readDownloads()).length),
    0,
    "Incomplete download must not be available"
  );
  assert.equal(requests.get("a"), 1);
  await open();
  failing = null;
  assert.equal(await download(fixture), "ok");
  assert.equal(requests.get("a"), 1, "Retry must not download completed file a again");
  assert.equal(requests.get("b"), 2);
  const updated = structuredClone(fixture);
  updated.contentVersion = "resilience-2";
  updated.lessons[0].resources[1].file.revision = "v2";
  assert.equal(await download(updated), "ok");
  assert.equal(requests.get("a"), 1);
  assert.equal(requests.get("b"), 3, "Only the changed file should be downloaded");
  assert.equal(requests.get("c"), 1);
  const broken = structuredClone(updated);
  broken.lessons[0].resources[2].file.revision = "v2";
  failing = "c";
  assert.notEqual(await download(broken), "ok");
  assert.ok(
    await page.evaluate(async () => Boolean(await window.verifiedDownload())),
    "Failed update must retain previous complete download"
  );
  await page.evaluate(() => window.mount("runtime"));
  await page.getByRole("status").filter({ hasText: "Tu sesión terminó" }).waitFor();
  assert.equal(
    await page.evaluate(async () => (await window.readDownloads()).length),
    1,
    "Session expiry must retain download"
  );
  await page.screenshot({ path: join(output, "expired-session.png"), fullPage: true });
  await page.evaluate(() => window.mount("s1"));
  await page.locator("[data-module3-session1]").waitFor();
  await page.getByRole("button", { name: "Siguiente tema", exact: true }).click();
  await open();
  await page.evaluate(() => window.mount("s1"));
  await page.locator('[data-session1-topic="configurar-whatsapp-business"]').waitFor();
  await page.evaluate(() => window.mount("s2"));
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await open();
  await page.evaluate(() => window.mount("s2"));
  await page.locator('[data-session2-topic="2"]').waitFor();
  await page.evaluate(() => window.mount("s3"));
  await page.getByRole("button", { name: "Pasos", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Señales de alerta", exact: true })
    .click();
  await open();
  await page.evaluate(() => window.mount("s3"));
  await page.locator('[data-session3-step="3"]').waitFor();
  await page.evaluate(() => window.mount("pdf"));
  await page.locator("[data-pdf-viewer] canvas").waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Página siguiente", exact: true }).click();
  await page
    .locator('[data-pdf-viewer] canvas[aria-label*="Página 2 de "]')
    .waitFor({ state: "visible" });
  await open();
  await page.evaluate(() => window.mount("pdf"));
  await page
    .locator('[data-pdf-viewer] canvas[aria-label*="Página 2 de "]')
    .waitFor({ state: "visible" });
  await page.screenshot({ path: join(output, "restored-pdf.png"), fullPage: true });
  await page.evaluate(() => {
    window.testSession = {
      status: "authenticated",
      data: { user: { id: "another-owner" } }
    };
    window.mount("runtime");
  });
  await page.waitForFunction(async () => (await window.readDownloads()).length === 0);
  await page.waitForFunction(() =>
    Object.keys(localStorage).every((key) => !key.startsWith("warmi-m3-reading-v1:"))
  );
  assert.equal(
    await page.evaluate(
      () =>
        Object.keys(localStorage).filter((k) => k.startsWith("warmi-m3-reading-v1:"))
          .length
    ),
    0
  );
  failing = "b";
  assert.notEqual(await download(fixture), "ok");
  await page.evaluate(() => window.mount("runtime", { check: "partial-only" }));
  await page.waitForFunction(async () =>
    (await caches.keys()).every((name) => !name.startsWith("warmi-learning-module-"))
  );
  failing = null;
  assert.equal(await download(fixture), "ok");
  await page.evaluate((snapshot) => {
    window.fixture = snapshot;
    window.fixtureVoices = [];
    const synthesis = new EventTarget();
    synthesis.getVoices = () => window.fixtureVoices;
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: synthesis
    });
    window.mount("download");
  }, fixture);
  await page
    .getByRole("status")
    .filter({ hasText: "instala una voz en español" })
    .waitFor();
  await page.screenshot({ path: join(output, "voice-preflight.png"), fullPage: true });
  await page.evaluate(() => {
    window.fixtureVoices = [
      { name: "Español local", voiceURI: "local-es", lang: "es-ES", localService: true }
    ];
    speechSynthesis.dispatchEvent(new Event("voiceschanged"));
  });
  await page
    .getByRole("status")
    .filter({ hasText: "instala una voz en español" })
    .waitFor({ state: "detached" });
  await page.evaluate(() => window.mount("logout"));
  await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
  await page.waitForFunction(() => window.loggedOut);
  assert.equal(await page.evaluate(async () => (await window.readDownloads()).length), 0);
  assert.equal(
    await page.evaluate(
      async () =>
        (await caches.keys()).filter((n) => n.startsWith("warmi-learning-module-")).length
    ),
    0
  );
  console.log(
    `PASS: expired session retains downloads; explicit logout/account switch remove complete/partial media and bookmarks; interrupted download resumes complete files; changed-file-only updates; failed update retains old package; S1/S2/S3/PDF bookmarks after close/reopen; local voice preflight; no real auth or DB mutation. Screenshots: ${output}`
  );
} finally {
  await browser.close();
}
