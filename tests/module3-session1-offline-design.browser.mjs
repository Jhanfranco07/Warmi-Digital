import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  assertOfflineImages,
  assertPdfRendered,
  prepareVisualShell
} from "./helpers/offline-visuals.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { build } = require(
  require.resolve("esbuild", { paths: [require.resolve("tsx/package.json")] })
);
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
const pdf = await readFile("output/pdf/module3-session1/estados-o-facebook.pdf").catch(
  async () => {
    const { readdir } = await import("node:fs/promises");
    const names = await readdir("output/pdf/module3-session1");
    return readFile(
      join(
        "output/pdf/module3-session1",
        names.find((name) => name.endsWith(".pdf"))
      )
    );
  }
);
const bundle = await build({
  stdin: {
    contents: `import{sameModeContent}from'./tests/helpers/module3-parity.mjs';import React from 'react';import{createRoot}from'react-dom/client';import{renderToStaticMarkup}from'react-dom/server';import{Module3Session1Content as Current}from'./features/artisan/learning/module3-session1-content';import{MODULE3_SESSION1_TOPICS as topics}from'./shared/learning/module3-session1';
    window.designTopics=topics;window.mountDesign=(offline)=>{const pdfUrl=URL.createObjectURL(new Blob([new Uint8Array(${JSON.stringify([...pdf])})],{type:'application/pdf'}));const resources=topics.map((t,i)=>({id:'guide-'+i,title:t.guideTitle,description:'Guía real de prueba',mimeType:'application/pdf',url:pdfUrl,downloadUrl:pdfUrl}));const props={title:'Sesión 1: Publica tu arte en redes',content:'Contenido original',resources,offline,nextSessionHref:'/artesana/aprender/program/lecciones/session2'};window.onlineUnchanged=sameModeContent(Current,props);[...document.body.children].forEach(el=>el.style.display='none');const host=document.createElement('main');host.id='design-host';host.style.cssText='max-width:768px;margin:auto;padding:16px';document.body.append(host);createRoot(host).render(React.createElement(Current,props));};`,
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
  }
});
const browser = await chromium.launch({
  headless: true,
  args: ["--disable-gpu"],
  channel: process.env.WARMI_BROWSER_CHANNEL || "msedge"
});
const output = join(tmpdir(), "warmi-session1-offline-design");
await mkdir(output, { recursive: true });
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    bypassCSP: true
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => console.error(error.message));
  await page.goto(`${origin}/offline-learning`);
  await page.locator("[data-warmi-offline-learning]").waitFor({ state: "attached" });
  await prepareVisualShell(page);
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.evaluate(() => window.mountDesign(true));
  await page.locator("[data-module3-session1]").waitFor();
  assert.equal(
    await page.evaluate(() => window.onlineUnchanged),
    true,
    "online and offline must share the same educational markup"
  );
  await context.setOffline(true);
  for (const width of [360, 390, 430, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    for (let i = 0; i < 7; i++) {
      const topic = await page.evaluate((index) => window.designTopics[index], i);
      await page.getByRole("button", { name: "Temas", exact: true }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: topic.title, exact: true })
        .click();
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      await page.getByRole("heading", { name: topic.title, exact: true }).waitFor();
      assert.equal(await page.locator("[data-session1-topic]").count(), 1);
      await assertOfflineImages(page, "[data-module3-session1]");
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `overflow ${width} topic ${i + 1}`
      );
      await page.evaluate(() => window.scrollTo(0, 0));
      if (width === 390)
        await page.screenshot({
          path: join(output, `topic-${i + 1}.png`),
          fullPage: true
        });
    }
  }
  await page.getByRole("button", { name: "Anterior", exact: true }).click();
  await page.locator('[data-session1-topic="vender-facebook-marketplace"]').waitFor();
  await page.getByRole("button", { name: "Anterior", exact: true }).click();
  await page
    .getByRole("button", { name: "Ya tengo Facebook, continuar", exact: true })
    .click();
  await page.locator('[data-session1-topic="vender-facebook-marketplace"]').waitFor();
  await page.getByRole("button", { name: "Abrir Marketplace", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Este recurso necesita conexión a internet." })
    .waitFor();
  await page.getByRole("button", { name: /^Abrir guía PDF:/ }).click();
  await assertPdfRendered(page);
  await page.getByRole("button", { name: "Volver a la lección", exact: true }).click();
  assert.equal(await page.locator("[data-pdf-viewer]").count(), 0);
  assert.ok(
    (
      await page
        .getByRole("link", { name: /^Descargar guía PDF:/ })
        .getAttribute("download")
    ).endsWith(".pdf")
  );
  assert.match(
    await page
      .getByRole("link", { name: "Volver al módulo 3", exact: true })
      .getAttribute("href"),
    /module=6c96bcdf/
  );
  await context.setOffline(false);
  console.log(
    `PASS: online/offline content parity; seven real topics; offline selector/previous/next/Facebook skip/external guard/PDF viewer/download control; 360/390/430/1024 widths. Screenshots: ${output}`
  );
} finally {
  await browser.close();
}
