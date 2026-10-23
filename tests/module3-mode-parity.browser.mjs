import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertOfflineImages } from "./helpers/offline-visuals.mjs";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { build } = require(
  require.resolve("esbuild", { paths: [require.resolve("tsx/package.json")] })
);
const read = () =>
  db.module.findUniqueOrThrow({
    where: { id: "6c96bcdf-0b41-48d2-bdcd-394d06acd9d2" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          lessonFiles: { orderBy: { position: "asc" }, include: { file: true } }
        }
      }
    }
  });
let browser;
try {
  const record = await read();
  const before = JSON.stringify(record);
  const lessons = record.lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    content: lesson.content,
    resources: lesson.lessonFiles.flatMap((resource) =>
      resource.file
        ? [
            {
              id: resource.id,
              title: resource.title,
              description: resource.description,
              mimeType: resource.file.mimeType,
              publicId: resource.file.publicId,
              url: resource.file.url
            }
          ]
        : []
    )
  }));
  assert.equal(lessons.length, 4);
  const bundle = await build({
    stdin: {
      contents: `import React from'react';import{createRoot}from'react-dom/client';import{Module3Session1Content}from'./features/artisan/learning/module3-session1-content';import{Module3JourneyContent}from'./features/artisan/learning/module3-journey-content';import{MODULE3_SESSION1_TOPICS}from'./shared/learning/module3-session1';import{SESSION2_OFFLINE_TOPICS}from'./features/artisan/learning/module3-session2-content';import{SESSION3_OFFLINE_STEPS}from'./features/artisan/learning/module3-session3-content';import{MODULE3_DELIVERY_STEPS}from'./shared/learning/module3-journey';import{normalizeModule3Content}from'./tests/helpers/module3-parity.mjs';
    const lessons=${JSON.stringify(lessons)};let root;const host=document.createElement('main');host.id='mode-test';host.style.cssText='max-width:768px;margin:auto;padding:12px';window.completionCalls=[];window.actionOk=true;window.mountMode=(index,offline)=>{root?.unmount();[...document.body.children].forEach(el=>el.style.display='none');host.style.display='block';document.body.append(host);root=createRoot(host);const lesson=lessons[index];root.render(index===0?React.createElement(Module3Session1Content,{...lesson,offline,relatedResources:lessons[1].resources.filter(r=>r.mimeType==='video/mp4'),nextSessionHref:'/artesana/aprender/93dc7355-d746-4acd-87df-29f71d16a955/lecciones/'+lessons[1].id}):React.createElement(Module3JourneyContent,{courseId:'93dc7355-d746-4acd-87df-29f71d16a955',lessonId:lesson.id,resources:lesson.resources,offline,completedIds:[]}));};window.captureMode=()=>normalizeModule3Content(host.innerHTML);window.steps=[MODULE3_SESSION1_TOPICS.map(t=>t.title),SESSION2_OFFLINE_TOPICS,SESSION3_OFFLINE_STEPS,MODULE3_DELIVERY_STEPS.map(s=>s.title)];`,
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
        name: "isolated-completion",
        setup(builder) {
          builder.onResolve({ filter: /actions\/artisan\/complete-lesson$/ }, () => ({
            path: "action",
            namespace: "test"
          }));
          builder.onLoad({ filter: /.*/, namespace: "test" }, () => ({
            loader: "js",
            contents:
              "export async function completeLessonAction(courseId,lessonId){window.completionCalls.push({courseId,lessonId});return window.actionOk?{ok:true,message:'Guardado'}:{ok:false,message:'No se pudo guardar en la prueba'};}"
          }));
        }
      }
    ]
  });
  browser = await chromium.launch({
    headless: true,
    args: ["--disable-gpu"],
    channel: process.env.WARMI_BROWSER_CHANNEL || "msedge"
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    const voice = {
      name: "Voz local español",
      voiceURI: "test-es",
      lang: "es-ES",
      localService: true,
      default: true
    };
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: class {
        constructor(text) {
          this.text = text;
        }
      }
    });
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [voice],
        addEventListener() {},
        removeEventListener() {},
        cancel() {},
        pause() {},
        resume() {},
        speak(utterance) {
          utterance.onstart?.();
          utterance.onend?.();
        }
      }
    });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(120000);
  const errors = [];
  page.on("pageerror", (error) => {
    errors.push(error.message);
    console.error("Browser error:", error.message);
  });
  await page.goto(
    `${process.env.WARMI_TEST_URL || "http://localhost:3100"}/offline-learning`,
    { waitUntil: "domcontentloaded" }
  );
  await page
    .locator("[data-warmi-offline-learning]")
    .waitFor({ state: "attached" })
    .catch(async (error) => {
      console.error({
        url: page.url(),
        text: (await page.locator("body").innerText()).slice(0, 1000),
        errors
      });
      throw error;
    });
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const steps = await page.evaluate(() => window.steps);
  const output = join(tmpdir(), "warmi-module3-mode-parity");
  await mkdir(output, { recursive: true });
  let comparisons = 0;
  async function choose(session, index) {
    await page
      .getByRole("button", { name: session < 2 ? "Temas" : "Pasos", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: steps[session][index], exact: true })
      .click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page
      .getByRole("heading", { name: steps[session][index], exact: true })
      .waitFor();
    await assertOfflineImages(page, "#mode-test");
  }
  for (const width of [360, 390, 430, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    for (let session = 0; session < 4; session++) {
      for (let index = 0; index < steps[session].length; index++) {
        const snapshots = [];
        for (const offline of [false, true]) {
          await page.evaluate(
            ({ session, offline }) => window.mountMode(session, offline),
            { session, offline }
          );
          await choose(session, index);
          if (session === 2 && index === 0) {
            await page.getByRole("button", { name: "Yape", exact: true }).click();
            const yape = await page.locator("#mode-test video").getAttribute("src");
            await page.getByRole("button", { name: "Plin", exact: true }).click();
            assert.notEqual(
              await page.locator("#mode-test video").getAttribute("src"),
              yape
            );
          }
          if (session === 2 && index === 2)
            await page.locator("#mode-test button[aria-controls]").first().click();
          if (session === 3) await page.getByRole("checkbox").first().check();
          snapshots.push(await page.evaluate(() => window.captureMode()));
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            true,
            `${width}/${session}/${index}`
          );
          assert.equal(
            await page
              .getByRole("navigation", { name: "Sesiones del Módulo 3" })
              .getByRole("link")
              .count(),
            4
          );
          if (width === 390)
            await page.locator("#mode-test").screenshot({
              path: join(
                output,
                `s${session + 1}-${index + 1}-${offline ? "offline" : "online"}.png`
              )
            });
        }
        assert.equal(
          snapshots[0],
          snapshots[1],
          `Content parity ${width}/S${session + 1}/${index + 1}`
        );
        comparisons++;
      }
    }
  }
  assert.equal(
    await page.evaluate(() => window.completionCalls.length),
    0,
    "Reading, selectors, checklists and offline navigation must not save progress"
  );
  const closing = [];
  for (const offline of [false, true]) {
    await page.evaluate((offline) => window.mountMode(3, offline), offline);
    await choose(3, 3);
    await page
      .getByRole("button", {
        name: offline ? "Ver logros del Módulo 3" : "Completar sesión y ver logros",
        exact: true
      })
      .click();
    await page.locator("[data-module3-closing]").waitFor();
    await assertOfflineImages(page, "#mode-test");
    closing.push(await page.evaluate(() => window.captureMode()));
    await page.locator("#mode-test").screenshot({
      path: join(output, `outcomes-${offline ? "offline" : "online"}.png`)
    });
  }
  assert.equal(closing[0], closing[1]);
  assert.equal(
    await page.evaluate(() => window.completionCalls.length),
    1,
    "Only explicit online completion saves progress"
  );
  await page.evaluate(() => {
    window.actionOk = false;
    window.mountMode(3, false);
  });
  await choose(3, 3);
  await page
    .getByRole("button", { name: "Completar sesión y ver logros", exact: true })
    .click();
  await page
    .getByRole("alert")
    .filter({ hasText: "No se pudo guardar en la prueba" })
    .waitFor();
  assert.equal(await page.locator("[data-module3-closing]").count(), 0);
  await page.evaluate(() => {
    window.actionOk = true;
  });
  await page
    .getByRole("button", { name: "Completar sesión y ver logros", exact: true })
    .click();
  await page.locator("[data-module3-closing]").waitFor();
  const saved = await page.evaluate(() => window.completionCalls.length);
  await page.getByRole("button", { name: "Volver a la sesión 4", exact: true }).click();
  await page
    .getByRole("button", { name: "Ver logros del Módulo 3", exact: true })
    .click();
  assert.equal(
    await page.evaluate(() => window.completionCalls.length),
    saved,
    "Revisiting outcomes must not complete twice"
  );
  assert.deepEqual(errors, []);
  assert.equal(
    JSON.stringify(await read()),
    before,
    "The test must not mutate real lessons or media"
  );
  console.log(
    `PASS: ${comparisons} online/offline content comparisons + shared outcomes; 360/390/430/1024; same images/text/cards/activities; session navigation; Yape/Plin selection; checklists; explicit online completion and failure/retry; zero offline completion; database untouched. Screenshots: ${output}`
  );
} finally {
  await browser?.close();
  await db.$disconnect();
}
