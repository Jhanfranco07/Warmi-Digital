import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { build } = require(
  require.resolve("esbuild", { paths: [require.resolve("tsx/package.json")] })
);
const previous = execFileSync(
  "git",
  ["show", "8939d7d:features/artisan/learning/module3-journey-content.tsx"],
  { encoding: "utf8" }
);
const pdf = await readFile("output/pdf/module3-sessions-2-4/elegir-donde-vender.pdf");
const bundle = await build({
  stdin: {
    contents: `import React from 'react';import{createRoot}from'react-dom/client';import{renderToStaticMarkup}from'react-dom/server';import{Module3JourneyContent as Current}from'./features/artisan/learning/module3-journey-content';import{Module3JourneyContent as Previous}from'baseline';import{MODULE3_SESSIONS,MODULE3_ID}from'./shared/learning/module3-journey';import{SESSION2_OFFLINE_TOPICS}from'./features/artisan/offline/module3-session2-offline';import{downloadModule}from'./shared/offline/module3-storage';import{MODULE3_CONTENT_VERSION}from'./shared/learning/module3-version';
  window.downloadSession2=()=>downloadModule({userId:'isolated-design-test',courseId:'93dc7355-d746-4acd-87df-29f71d16a955',courseTitle:'Aprender para crecer',moduleId:MODULE3_ID,title:'Módulo 3',description:null,contentVersion:MODULE3_CONTENT_VERSION,progress:{completedLessonIds:[MODULE3_SESSIONS[0].id],capturedAt:new Date().toISOString()},lessons:MODULE3_SESSIONS.map(s=>({id:s.id,title:s.title,content:null,resources:s.order===2?[{id:'existing-guide',title:'Guía para elegir dónde vender por internet',type:'PDF',externalUrl:null,description:null,file:{id:'design-guide',mimeType:'application/pdf',size:${pdf.length}}}]:[]}))},()=>{});
  window.topics=SESSION2_OFFLINE_TOPICS;window.mountSession2=()=>{const pdfUrl=URL.createObjectURL(new Blob([new Uint8Array(${JSON.stringify([...pdf])})],{type:'application/pdf'}));const props={courseId:'93dc7355-d746-4acd-87df-29f71d16a955',lessonId:MODULE3_SESSIONS[1].id,resources:[{id:'existing-guide',title:'Guía para elegir dónde vender por internet',mimeType:'application/pdf',url:pdfUrl}],completedIds:[MODULE3_SESSIONS[0].id]};window.unchanged=MODULE3_SESSIONS.slice(1).flatMap(session=>[false,true].filter(offline=>!offline||session.order!==3).map(offline=>{const p={...props,lessonId:session.id,offline};return renderToStaticMarkup(React.createElement(Current,p))===renderToStaticMarkup(React.createElement(Previous,p))})).every(Boolean);const host=document.createElement('main');[...document.body.children].forEach(el=>el.style.display='none');host.style.cssText='max-width:768px;margin:auto;padding:16px';document.body.append(host);createRoot(host).render(React.createElement(Current,{...props,offline:true}));};`,
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
            "export async function completeLessonAction(){window.completionCalls=(window.completionCalls||0)+1;throw Error('Unexpected completion');}",
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
const output = join(tmpdir(), "warmi-session2-offline-design");
await mkdir(output, { recursive: true });
try {
  const context = await browser.newContext({
    bypassCSP: true,
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  await page.goto(
    `${process.env.WARMI_TEST_URL || "http://localhost:3100"}/offline-learning`
  );
  await page.waitForLoadState("networkidle");
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.evaluate(() => window.mountSession2());
  await page.locator("[data-module3-session2-offline]").waitFor();
  assert.equal(
    await page.evaluate(() => window.unchanged),
    true,
    "S2 online/offline, S3 online and S4 online/offline render unchanged"
  );
  await context.setOffline(true);
  for (const width of [360, 390, 430, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    for (let index = 0; index < 4; index++) {
      const title = await page.evaluate((i) => window.topics[i], index);
      await page.getByRole("button", { name: "Temas", exact: true }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: title, exact: true })
        .click();
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      await page.getByRole("heading", { name: title, exact: true }).waitFor();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `overflow ${width}/${index}`
      );
      assert.equal(
        await page.getByRole("navigation", { name: "Navegación de temas" }).count(),
        1
      );
      if (width === 390)
        await page.screenshot({
          path: join(output, `topic-${index + 1}.png`),
          fullPage: true
        });
    }
  }
  await page.getByRole("button", { name: "Anterior", exact: true }).click();
  await page.locator('[data-session2-topic="3"]').waitFor();
  assert.equal(await page.locator("[data-module3-session2-offline] article").count(), 4);
  await page.getByRole("button", { name: "Conocer Ruraq Maki", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Este recurso necesita conexión a internet." })
    .waitFor();
  await page.getByRole("button", { name: "Abrir guía PDF", exact: true }).click();
  await page.locator("iframe").waitFor();
  await page.getByRole("button", { name: "Volver a la sesión", exact: true }).click();
  assert.equal(await page.locator("iframe").count(), 0);
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await page.locator('[data-session2-topic="4"]').waitFor();
  assert.equal(await page.evaluate(() => window.completionCalls || 0), 0);
  assert.ok(
    (
      await page
        .getByRole("link", { name: "Volver al módulo 3", exact: true })
        .first()
        .getAttribute("href")
    ).includes("module=6c96bcdf")
  );
  await context.setOffline(false);
  await context.route("**/api/learning/offline/*/files/design-guide", (route) =>
    route.fulfill({ contentType: "application/pdf", body: pdf })
  );
  await page.evaluate(() => window.downloadSession2());
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto(
    `${process.env.WARMI_TEST_URL || "http://localhost:3100"}/artesana/aprender/93dc7355-d746-4acd-87df-29f71d16a955/lecciones/9bd401d6-5c80-4099-aa7b-e1b90b62d9b7`
  );
  await reopened.locator("[data-module3-session2-offline]").waitFor();
  await reopened.getByRole("button", { name: "Abrir guía PDF", exact: true }).click();
  const localUrl = await reopened.locator("iframe").getAttribute("src");
  assert.ok(localUrl.startsWith("/__warmi_offline__/"));
  assert.equal(
    await reopened.evaluate(async (url) => (await fetch(url)).status, localUrl),
    200
  );
  await reopened.getByRole("button", { name: "Volver a la sesión", exact: true }).click();
  await reopened.getByRole("link", { name: "Volver al módulo 3", exact: true }).click();
  await reopened.locator("[data-offline-module-overview]").waitFor();
  await reopened.getByRole("button", { name: "Eliminar descarga", exact: true }).click();
  await reopened
    .getByRole("status")
    .filter({ hasText: "Este contenido todavía no está disponible sin conexión." })
    .waitFor();
  await context.setOffline(false);
  console.log(
    `PASS: S2 online/offline, S3 online and S4 unchanged; four offline topics/selector/previous/next/PDF return/external guard/no completion; real shell download, close/reopen S2 offline, cached PDF HTTP200, explicit module return/delete/reconnect; 360/390/430/1024px. Screenshots: ${output}`
  );
} finally {
  await browser.close();
}
