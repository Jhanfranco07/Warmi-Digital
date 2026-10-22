import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { assertOfflineImages } from "./helpers/offline-visuals.mjs";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { PrismaClient } = require("@prisma/client");
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { build } = require(
  require.resolve("esbuild", { paths: [require.resolve("tsx/package.json")] })
);
const db = new PrismaClient();
const ids = [
  "8a8e449b-76a6-4a6d-9693-6238f75092bc",
  "9bd401d6-5c80-4099-aa7b-e1b90b62d9b7"
];
const read = () =>
  db.lesson.findMany({
    where: { id: { in: ids } },
    orderBy: { order: "asc" },
    include: { lessonFiles: { orderBy: { position: "asc" }, include: { file: true } } }
  });
let browser;
try {
  const records = await read();
  const before = JSON.stringify(records);
  const first = records.find((lesson) => lesson.id === ids[0]);
  const guides = first.lessonFiles.filter(
    (resource) => resource.file?.mimeType === "application/pdf"
  );
  assert.equal(guides.length, 7);
  assert.deepEqual(
    guides.map((resource) => resource.position),
    [10, 11, 12, 13, 14, 15, 16]
  );
  const videos = records
    .flatMap((lesson) => lesson.lessonFiles)
    .filter((resource) => resource.file?.mimeType === "video/mp4");
  assert.equal(videos.length, 6);
  const assets = [...videos, ...guides];
  assert.equal(new Set(assets.map((resource) => resource.file.id)).size, 13);
  const bytes = new Map();
  for (const { file } of assets) {
    const response = await fetch(file.url, { signal: AbortSignal.timeout(90000) });
    assert.equal(response.status, 200, file.publicId);
    const body = Buffer.from(await response.arrayBuffer());
    assert.ok(body.length > 0);
    if (file.mimeType === "application/pdf")
      assert.equal(body.subarray(0, 5).toString(), "%PDF-");
    bytes.set(file.id, { body, mime: file.mimeType });
    console.log(`HTTP 200: ${file.publicId} (${body.length} bytes)`);
  }
  const resources = records.map((lesson) => ({
    ...lesson,
    resources: lesson.lessonFiles
      .filter((resource) => bytes.has(resource.file?.id))
      .map((resource) => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        externalUrl: resource.originalUrl,
        file: {
          id: resource.file.id,
          mimeType: resource.file.mimeType,
          size: bytes.get(resource.file.id).body.length
        }
      }))
  }));
  const bundle = await build({
    stdin: {
      contents: `import{downloadModule}from'./shared/offline/module3-storage';import{MODULE3_ID,MODULE3_SESSIONS}from'./shared/learning/module3-journey';import{MODULE3_CONTENT_VERSION}from'./shared/learning/module3-version';import{MODULE3_SESSION1_TOPICS}from'./shared/learning/module3-session1';import{LEARNING_PROGRAM}from'./shared/learning/program';window.topics=MODULE3_SESSION1_TOPICS;const records=${JSON.stringify(resources)};window.prepareMedia=()=>downloadModule({userId:'isolated-session1-media',courseId:LEARNING_PROGRAM.id,courseTitle:LEARNING_PROGRAM.title,moduleId:MODULE3_ID,title:'Módulo 3',description:null,contentVersion:MODULE3_CONTENT_VERSION,progress:{completedLessonIds:[],capturedAt:new Date().toISOString()},lessons:MODULE3_SESSIONS.map(s=>({id:s.id,title:s.title,content:null,resources:records.find(r=>r.id===s.id)?.resources??[]}))},()=>{});`,
      resolveDir: process.cwd(),
      loader: "tsx"
    },
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    define: { "process.env.NODE_ENV": '"production"' }
  });
  browser = await chromium.launch({
    headless: true,
    channel: process.env.WARMI_BROWSER_CHANNEL || "msedge"
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
  await context.route("**/api/learning/offline/*/files/*", (route) => {
    const id = new URL(route.request().url()).pathname.split("/").pop();
    const asset = bytes.get(id);
    return asset
      ? route.fulfill({ body: asset.body, contentType: asset.mime })
      : route.fulfill({ status: 404 });
  });
  let page = await context.newPage();
  await page.goto(`${origin}/offline-learning`);
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const topics = await page.evaluate(() => window.topics);
  await page.evaluate(() => window.prepareMedia());
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.close();
  await context.setOffline(true);
  page = await context.newPage();
  await page.goto(
    `${origin}/artesana/aprender/93dc7355-d746-4acd-87df-29f71d16a955/lecciones/${ids[0]}`
  );
  await page.locator("[data-module3-session1]").waitFor();
  let played = 0;
  for (const topic of topics) {
    await page.getByRole("button", { name: "Temas", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: topic.title, exact: true })
      .click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await assertOfflineImages(page, "[data-module3-session1]");
    const secondary = page.locator("details").filter({ has: page.locator("video") });
    for (const details of await secondary.all()) await details.locator("summary").click();
    for (const video of await page.locator("video").all()) {
      await video.scrollIntoViewIfNeeded();
      await video.evaluate(async (element) => {
        element.muted = true;
        await element.play();
      });
      await page.waitForFunction(
        (src) =>
          [...document.querySelectorAll("video")].some(
            (element) => element.getAttribute("src") === src && element.currentTime > 0.1
          ),
        await video.getAttribute("src")
      );
      await video.evaluate((element) => element.pause());
      played++;
    }
    await page.getByRole("button", { name: /^Abrir guía PDF:/ }).click();
    const url = await page.locator("iframe").getAttribute("src");
    assert.ok(url.startsWith("/__warmi_offline__/"));
    assert.equal(
      await page.evaluate(async (path) => (await fetch(path)).status, url),
      200
    );
    await page.getByRole("button", { name: "Volver a la lección", exact: true }).click();
  }
  assert.equal(played, 6);
  assert.equal(
    JSON.stringify(await read()),
    before,
    "Lesson, File, LessonFile, positions and URLs must remain unchanged"
  );
  await context.setOffline(false);
  assert.equal(await page.evaluate(() => navigator.onLine), true);
  console.log(
    `PASS: six real MP4 play offline; seven real PDFs open offline; original relations/URLs/positions unchanged; local images after page close/reopen; reconnect. Media bytes: ${[...bytes.values()].reduce((sum, asset) => sum + asset.body.length, 0)}.`
  );
} finally {
  await browser?.close();
  await db.$disconnect();
}
