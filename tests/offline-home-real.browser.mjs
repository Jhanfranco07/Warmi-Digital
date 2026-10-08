import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { prisma } = await import("../shared/server/db/prisma.ts");
const { LEARNING_PROGRAM } = await import("../shared/learning/program.ts");
const { MODULE3_SESSION1_TOPICS } =
  await import("../shared/learning/module3-session1.ts");
const { LANDING_OFFLINE_IMAGES } = await import("../shared/offline/landing-assets.ts");
const { buildOfflineModule } =
  await import("../shared/services/offline-learning.service.ts");
const { getReferencedLesson, isOfflineModule } =
  await import("../shared/offline/module3-types.ts");
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { build } = require(
  require.resolve("esbuild", { paths: [require.resolve("tsx/package.json")] })
);
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100",
  courseId = LEARNING_PROGRAM.id,
  courseHref = `${origin}/artesana/aprender/${courseId}`;
const email = process.env.WARMI_TEST_EMAIL,
  password = process.env.WARMI_TEST_PASSWORD;
assert.ok(
  email && password,
  "Configure WARMI_TEST_EMAIL / WARMI_TEST_PASSWORD for an existing enrolled test account. This test never creates accounts or updates lessons."
);
const output = join(tmpdir(), "warmi-offline-home-ux");
await mkdir(output, { recursive: true });
const profile = await mkdtemp(join(tmpdir(), "warmi-offline-ux-browser-"));
const snapshot = async () =>
  JSON.stringify(
    await prisma.course.findUniqueOrThrow({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { id: "asc" },
          include: {
            lessons: {
              orderBy: { id: "asc" },
              include: {
                lessonFiles: { orderBy: { id: "asc" }, include: { file: true } }
              }
            }
          }
        },
        enrollments: {
          orderBy: { id: "asc" },
          include: { lessonProgresses: { orderBy: { id: "asc" } }, courseProgress: true }
        }
      }
    })
  );
const before = await snapshot();
await writeFile(join(output, "database-before.json"), before);
const account = await prisma.user.findUniqueOrThrow({ where: { email } });
const enrollment = await prisma.enrollment.findUniqueOrThrow({
  where: { userId_courseId: { userId: account.id, courseId } },
  include: { lessonProgresses: true }
});
const modules = await prisma.module.findMany({
  where: {
    courseId,
    id: { in: LEARNING_PROGRAM.modules.filter((m) => m.offline).map((m) => m.id) }
  },
  orderBy: { order: "asc" },
  include: {
    lessons: {
      orderBy: { order: "asc" },
      include: { lessonFiles: { orderBy: { position: "asc" }, include: { file: true } } }
    }
  }
});
const m3 = modules.find((m) => m.id === LEARNING_PROGRAM.modules[2].id);
const props = {
  title: m3.lessons[0].title,
  content: m3.lessons[0].content,
  nextSessionHref: `${courseHref.replace(origin, "")}/lecciones/${m3.lessons[1].id}`,
  resources: m3.lessons[0].lessonFiles.map(view),
  relatedResources: m3.lessons[1].lessonFiles
    .filter((r) => r.file?.mimeType === "video/mp4")
    .map(view)
};
function view(r) {
  const reference = getReferencedLesson(r);
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    ...(reference
      ? {
          internalHref: `${courseHref.replace(origin, "")}/lecciones/${reference.lessonId}`
        }
      : {}),
    ...(r.file
      ? {
          fileId: r.file.id,
          mimeType: r.file.mimeType,
          size: r.file.size,
          url:
            r.file.mimeType === "application/pdf"
              ? `/api/files/${r.file.id}/preview`
              : r.file.url,
          downloadUrl: `/api/files/${r.file.id}/preview?download=1`
        }
      : {})
  };
}
const bundle = await build({
  stdin: {
    contents: `import React from 'react';import{createRoot}from'react-dom/client';import{Module3Session1Content}from'./features/artisan/learning/module3-session1-content';import{LearningLessonHeader}from'./features/artisan/learning/learning-lesson-header';window.mountReference=(props)=>{document.querySelectorAll('body header,body nav').forEach(el=>el.style.visibility='hidden');const host=document.createElement('div');host.style.zIndex='49';host.dataset.onlineReference='';host.className='fixed inset-0 z-[45] overflow-auto bg-[#fffaf8] px-4 py-5';document.body.appendChild(host);createRoot(host).render(React.createElement('div',{className:'mx-auto max-w-3xl space-y-5'},React.createElement(LearningLessonHeader,{courseHref:'${courseHref.replace(origin, "")}',moduleTitle:'${LEARNING_PROGRAM.modules[2].title}',title:props.title}),React.createElement(Module3Session1Content,props)));};`,
    resolveDir: process.cwd(),
    loader: "tsx"
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" }
});
let context;
const played = [];
async function open(offline = false) {
  context = await chromium.launchPersistentContext(profile, {
    headless: true,
    channel: process.env.WARMI_BROWSER_CHANNEL || "msedge",
    viewport: { width: 390, height: 844 },
    offline,
    acceptDownloads: true
  });
  const page = context.pages()[0] || (await context.newPage());
  page.setDefaultTimeout(60000);
  page.on("pageerror", (error) => console.error("Browser error:", error.message));
  await context.route("**/artesana/aprender/**/lecciones/**", (route) => route.abort());
  return page;
}
async function read(page) {
  return page.evaluate(async () => {
    const db = await new Promise((res, rej) => {
      const q = indexedDB.open("warmi-learning-offline", 1);
      q.onsuccess = () => res(q.result);
      q.onerror = () => rej(q.error);
    });
    const rows = await new Promise((res) => {
      const q = db.transaction("downloads").objectStore("downloads").getAll();
      q.onsuccess = () => res(q.result);
    });
    db.close();
    return rows;
  });
}
async function touch(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  assert.equal(
    await locator.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.height >= 48 &&
        el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
      );
    }),
    true
  );
}
async function widthCheck(page, name) {
  for (const width of [360, 390, 430, 768, 1365]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    );
    if (name === "home") {
      const cta = page.locator("[data-offline-learning-cta]");
      assert.equal(
        await cta.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.height >= 48 &&
            r.bottom < innerHeight - 64 &&
            r.top >= 0 &&
            el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
          );
        }),
        true
      );
    }
    await page.screenshot({ path: join(output, `${name}-${width}.png`) });
  }
  await page.setViewportSize({ width: 390, height: 844 });
}
async function lesson(page, id) {
  const home = page.locator("[data-warmi-offline-home]");
  if (await home.count())
    await page
      .getByRole("link", { name: "Continuar mi aprendizaje", exact: true })
      .click();
  await page
    .getByRole("navigation", { name: "Navegación Warmi sin conexión" })
    .getByRole("link", { name: "Mi aprendizaje", exact: true })
    .click();
  const target = modules.find((m) => m.lessons.some((l) => l.id === id));
  if (modules.length > 1)
    await page
      .locator(`[data-downloaded-module="${target.id}"]`)
      .getByRole("link")
      .click();
  await page
    .getByRole("navigation", { name: "Lecciones del módulo" })
    .locator(`a[href$="/lecciones/${id}"]`)
    .click();
}
async function selectTopic(page, title) {
  await page.getByRole("button", { name: "Ver todos los temas", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: title, exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.waitForFunction(() =>
    document.activeElement?.matches("[data-session1-topic] h2")
  );
}
async function play(page, video = page.locator("video").first()) {
  await video.evaluate(async (el) => {
    el.muted = true;
    await el.play();
  });
  await page.waitForFunction(() =>
    [...document.querySelectorAll("video")].some(
      (v) => v.currentTime > 0.25 && v.videoWidth > 0
    )
  );
  played.push(await video.getAttribute("src"));
  await video.evaluate((el) => el.pause());
}
async function signature(page, root = "body") {
  return page.locator(root).evaluate((el) => ({
    header: el.querySelector("[data-learning-lesson-header]")?.className,
    content: el.querySelector("[data-module3-session1]")?.className,
    topics: [...el.querySelectorAll("[data-session1-topic]")].map((e) => ({
      key: e.dataset.session1Topic,
      text: e.querySelector("h2").innerText,
      className: e.querySelector("h2").className
    })),
    text: el
      .querySelector("[data-session1-active]")
      ?.innerText.replace(/\s+/g, " ")
      .trim()
  }));
}
try {
  let page = await open();
  await page.goto(origin);
  for (const label of [
    "PROGRAMA WARMI",
    "DESCUBRE",
    "IDENTIDAD WARMI - RIQSICHIQ WARMI",
    "UNETE A WARMI"
  ])
    await page.getByRole("link", { name: label, exact: true }).waitFor();
  assert.equal(await page.locator("[data-warmi-offline-home]").count(), 0);
  await page.goto(`${origin}/login`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Ingresar como artesana", exact: true }).click();
  await page.waitForURL("**/artesana/**");
  await page.goto(`${origin}/artesana/aprender`);
  assert.equal(await page.locator("[data-warmi-offline-home]").count(), 0);
  await page.goto(courseHref);
  assert.deepEqual(
    modules.map((m) => m.id),
    [LEARNING_PROGRAM.modules[2].id]
  );
  assert.deepEqual(
    await page
      .locator('[id^="modulo-"]')
      .evaluateAll((elements) => elements.map((el) => el.id)),
    [`modulo-${LEARNING_PROGRAM.modules[2].id}`]
  );
  const onlineOnly = JSON.parse(before).modules.filter((m) => !isOfflineModule(m.id));
  for (const m of onlineOnly) {
    await page
      .getByRole("heading", {
        name: LEARNING_PROGRAM.modules.find((cap) => cap.id === m.id).title,
        exact: true
      })
      .waitFor();
    assert.equal(await page.locator(`#modulo-${m.id}`).count(), 0);
    const file = m.lessons.flatMap((l) => l.lessonFiles).find((r) => r.file)?.file;
    if (file)
      assert.equal(
        (
          await page.request.get(
            `${origin}/api/learning/offline/${courseId}/files/${file.id}`
          )
        ).status(),
        404
      );
  }
  for (const m of modules) {
    const card = page.locator(`#modulo-${m.id}`);
    await card
      .getByRole("button", { name: "Descargar para usar sin internet", exact: true })
      .click();
    await card
      .getByText("Disponible sin conexión", { exact: true })
      .waitFor({ timeout: 300000 });
  }
  let downloads = await read(page);
  assert.equal(downloads.length, modules.length);
  for (const d of downloads) {
    const expected = enrollment.lessonProgresses
      .filter((p) => p.completed && d.lessons.some((l) => l.id === p.lessonId))
      .map((p) => p.lessonId)
      .sort();
    assert.deepEqual([...d.progress.completedLessonIds].sort(), expected);
    assert.ok(Date.parse(d.progress.capturedAt));
  }
  const originalDownload = downloads.find((d) => d.moduleId === m3.id);
  console.log("Real downloads verified; mounting online presentation reference.");
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.evaluate((props) => window.mountReference(props), props);
  await page.locator("[data-online-reference] [data-module3-session1]").waitFor();
  const onlineSignature = await signature(page, "[data-online-reference]");
  const afterReferenceHeights = [];
  for (let i = 0; i < 7; i++) {
    if (i)
      await page.getByRole("button", { name: "Siguiente tema", exact: true }).click();
    await page
      .locator(`[data-session1-topic="${MODULE3_SESSION1_TOPICS[i].key}"]`)
      .waitFor();
    afterReferenceHeights.push(
      await page.locator("[data-online-reference]").evaluate((el) => el.scrollHeight)
    );
  }
  await selectTopic(page, MODULE3_SESSION1_TOPICS[0].title);
  const beforeScroll = JSON.parse(
    await readFile(
      new URL("./fixtures/offline-scroll-before.json", import.meta.url),
      "utf8"
    )
  );
  const afterAverage = Math.round(afterReferenceHeights.reduce((a, b) => a + b) / 7);
  const scrollComparison = {
    before: beforeScroll,
    after: { heights: afterReferenceHeights, averageHeight: afterAverage },
    reductionPercent: Math.round((1 - afterAverage / beforeScroll.averageHeight) * 100),
    method:
      "Same 390x844 reference container, shared header, actual S1 resources and seven active states. Heights, not time or official progress."
  };
  await writeFile(
    join(output, "scroll-comparison.json"),
    JSON.stringify(scrollComparison, null, 2)
  );

  await page.screenshot({ path: join(output, "online-reference-390.png") });
  const manifest = await (
    await page.request.get(`${origin}/manifest.webmanifest`)
  ).json();
  assert.equal(manifest.start_url, "/artesana/aprender");
  assert.equal(manifest.display, "standalone");
  await context.close();
  context = undefined;
  page = await open(true);
  // Manifest start URL opens Home, and a saved deep link must do so as well.
  await page.goto(`${origin}/artesana/aprender`);
  await page
    .getByRole("link", { name: "Continuar mi aprendizaje", exact: true })
    .waitFor();
  await widthCheck(page, "home");
  assert.equal(
    await page
      .locator("[data-warmi-offline-home] img")
      .first()
      .evaluate((el) => el.complete && el.naturalWidth > 0),
    true
  );
  assert.equal(
    (
      await page.evaluate(async () => {
        const r = await fetch("/images/hero/warmi-hero.png");
        return { ok: r.ok, bytes: (await r.arrayBuffer()).byteLength };
      })
    ).ok,
    true
  );
  assert.equal(
    await page.getByRole("link", { name: "UNETE A WARMI", exact: true }).count(),
    0
  );
  await page.screenshot({ path: join(output, "01-home-hero-390.png") });
  await page
    .getByRole("navigation", { name: "Accesos Warmi" })
    .evaluate((el) => window.scrollTo(0, scrollY + el.getBoundingClientRect().top - 64));
  await page.screenshot({ path: join(output, "02-home-four-accesses-390.png") });
  for (const [id, label] of [
    ["programa", "PROGRAMA WARMI"],
    ["descubre", "DESCUBRE"],
    ["identidad", "IDENTIDAD WARMI - RIQSICHIQ WARMI"]
  ]) {
    await page
      .getByRole("navigation", { name: "Accesos Warmi" })
      .getByRole("link", { name: label, exact: true })
      .click();
    await page.waitForFunction((id) => {
      const el = document.getElementById(id);
      return el && Math.abs(el.getBoundingClientRect().top - 64) < 10;
    }, id);
    if (id === "programa")
      await page.screenshot({ path: join(output, "03-programme-offline-390.png") });
    if (id === "identidad")
      await page.screenshot({ path: join(output, "04-identity-offline-390.png") });
  }
  await page.goBack();
  await page.locator("#descubre").waitFor();
  await page.goForward();
  await page.locator("#identidad").waitFor();
  for (const src of Object.values(LANDING_OFFLINE_IMAGES)) {
    assert.equal(
      await page.evaluate(async (src) => {
        const r = await fetch(src);
        return r.ok && (await r.blob()).size > 0;
      }, src),
      true
    );
  }
  // Ensure the shared offline images actually decode (including the logo and welcome photo).
  for (const img of await page.locator("[data-warmi-offline-home] img").all())
    await img.evaluate((el) => el.decode());
  await page.getByRole("link", { name: "Continuar mi aprendizaje", exact: true }).click();
  await page.locator("[data-warmi-offline-home]").waitFor({ state: "detached" });
  await page.goBack();
  await page.locator("[data-warmi-offline-home]").waitFor();
  await page.goForward();
  await page.locator("[data-warmi-offline-home]").waitFor({ state: "detached" });
  await lesson(page, m3.lessons[0].id);
  await page.locator("[data-module3-session1]").waitFor();
  assert.deepEqual(await signature(page), onlineSignature);
  assert.equal(
    await page.getByRole("heading", { name: "Material de apoyo", exact: true }).count(),
    0
  );
  await widthCheck(page, "session-offline");
  const screenshot = async (name) => page.screenshot({ path: join(output, name) });
  await screenshot("05-session-topic-390.png");
  // PDF pair at 390/430, stacked at 360; native 48px targets remain.
  for (const width of [360, 390, 430, 768, 1365]) {
    await page.setViewportSize({ width, height: 844 });
    const first = page.getByRole("link", { name: /Abrir guía PDF:/ }),
      second = page.getByRole("link", { name: /Descargar guía PDF:/ });
    const a = await first.boundingBox(),
      b = await second.boundingBox();
    assert.ok(a.height >= 48 && b.height >= 48);
    assert.equal(Math.abs(a.y - b.y) < 2, width >= 390);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Siguiente tema", exact: true }).click();
  await page.locator('[data-session1-topic="configurar-whatsapp-business"]').waitFor();
  await page.getByRole("button", { name: "Anterior", exact: true }).click();
  await page
    .locator(`[data-session1-topic="${MODULE3_SESSION1_TOPICS[0].key}"]`)
    .waitFor();
  await page.getByRole("button", { name: "Siguiente tema", exact: true }).click();
  await page.getByRole("button", { name: "Ver todos los temas", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await screenshot("06-topic-selector-390.png");
  for (const topic of MODULE3_SESSION1_TOPICS)
    await dialog.getByRole("button", { name: topic.title, exact: true }).waitFor();
  await dialog
    .getByRole("button", { name: MODULE3_SESSION1_TOPICS[5].title, exact: true })
    .click();
  await dialog.waitFor({ state: "detached" });
  await page.waitForFunction(() =>
    document.activeElement?.matches("[data-session1-topic] h2")
  );
  assert.equal(
    await page.locator("[data-session1-topic]").getAttribute("data-session1-topic"),
    MODULE3_SESSION1_TOPICS[5].key
  );
  await play(page);
  // Verify every real topic, description, steps and guide without changing official progress.
  for (const topic of MODULE3_SESSION1_TOPICS) {
    await selectTopic(page, topic.title);
    const active = page.locator("[data-session1-active]");
    assert.equal(await page.locator("[data-session1-topic]").count(), 1);
    assert.equal(await page.locator("[data-session1-active]").count(), 1);
    assert.equal(
      await active
        .getByRole("button", { name: "Escuchar este tema", exact: true })
        .count(),
      1
    );
    await active.getByText(topic.description, { exact: true }).waitFor();
    for (const step of topic.steps)
      await active.getByText(step, { exact: true }).waitFor();
    assert.equal(
      await active
        .getByRole("link", { name: `Abrir guía PDF: ${topic.title}`, exact: true })
        .count(),
      1
    );
  }
  await selectTopic(page, MODULE3_SESSION1_TOPICS[0].title);
  await page.locator("video").first().scrollIntoViewIfNeeded();
  await screenshot("07-topic-video-390.png");
  await page.getByRole("link", { name: /Abrir guía PDF:/ }).scrollIntoViewIfNeeded();
  await screenshot("08-topic-pdf-390.png");
  await selectTopic(page, MODULE3_SESSION1_TOPICS[0].title);
  await page.getByText("Material adicional · Ver materiales", { exact: true }).click();
  await page.getByRole("heading", { name: "Material de apoyo", exact: true }).waitFor();
  await page.getByText("Leer texto completo", { exact: true }).click();
  await page.getByText(props.content, { exact: true }).waitFor();
  await page.getByText("Material adicional · Ver materiales", { exact: true }).click();
  // Speech API invocation is real; availability of an installed Spanish voice depends on the OS.
  await page.evaluate(() => {
    const original = speechSynthesis.speak.bind(speechSynthesis);
    window.spoken = [];
    speechSynthesis.speak = (utterance) => {
      window.spoken.push(utterance.text);
      original(utterance);
    };
  });
  await page.getByRole("button", { name: "Escuchar este tema", exact: true }).click();
  await page.waitForFunction(() => window.spoken.length > 0);
  await selectTopic(page, MODULE3_SESSION1_TOPICS[1].title);
  await selectTopic(page, MODULE3_SESSION1_TOPICS[0].title);
  const pdfEvent = page.waitForEvent("download");
  await page.getByRole("link", { name: /Descargar guía PDF:/ }).click();
  const exported = await pdfEvent;
  assert.equal(await exported.failure(), null);
  assert.equal(
    (await readFile(await exported.path())).subarray(0, 5).toString(),
    "%PDF-"
  );
  const popupEvent = page.waitForEvent("popup");
  await page.getByRole("link", { name: /Abrir guía PDF:/ }).click();
  const popup = await popupEvent;
  await popup.waitForURL("blob:**");
  await popup.close();
  await play(page);
  await selectTopic(page, MODULE3_SESSION1_TOPICS[6].title);
  const next = page.getByRole("link", {
    name: "Continuar a siguiente sesión",
    exact: true
  });
  await touch(page, next);
  await next.click();
  await page.locator('[data-session-order="2"]').waitFor();
  await page
    .getByRole("navigation", { name: "Navegación Warmi sin conexión" })
    .getByRole("link", { name: "Mi aprendizaje", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Navegación Warmi sin conexión" })
    .getByRole("link", { name: "Inicio Warmi", exact: true })
    .click();
  await page.locator("[data-warmi-offline-home]").waitFor();
  const d3 = downloads.find((d) => d.moduleId === m3.id);
  assert.equal(Object.keys(d3.assets).length, 18);
  for (const r of d3.lessons.flatMap((l) => l.resources).filter((r) => r.file)) {
    const result = await page.evaluate(async (url) => {
      const r = await fetch(url);
      const bytes = await r.arrayBuffer();
      const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const part = await fetch(url, { headers: { Range: "bytes=0-15" } });
      return {
        ok: r.ok,
        mime: r.headers.get("content-type"),
        bytes: bytes.byteLength,
        hash,
        range: part.status,
        rangeBytes: (await part.arrayBuffer()).byteLength
      };
    }, d3.assets[r.file.id]);
    assert.equal(result.ok, true);
    assert.equal(result.bytes, r.file.size);
    assert.equal(result.mime, r.file.mimeType);
    assert.equal(result.range, 206);
    assert.equal(result.rangeBytes, 16);
    const file = m3.lessons
      .flatMap((l) => l.lessonFiles)
      .find((f) => f.fileId === r.file.id)?.file;
    if (file?.metadata?.sha256) assert.equal(result.hash, file.metadata.sha256);
  }
  for (const l of m3.lessons) {
    await lesson(page, l.id);
    if (l === m3.lessons[0]) {
      for (let i = 0; i < 4; i++) {
        await selectTopic(page, MODULE3_SESSION1_TOPICS[i].title);
        await play(page);
      }
    } else if (l.order === 2) {
      await page.getByRole("button", { name: "Continuar", exact: true }).click();
      await page.getByRole("button", { name: "Continuar", exact: true }).click();
      await play(page);
      await page.getByRole("button", { name: "Ver otro ejemplo", exact: true }).click();
      await play(page);
    } else if (l.order === 3) {
      for (const label of ["Yape", "Plin"]) {
        await page.getByRole("button", { name: label, exact: true }).click();
        await play(page);
      }
    }
  }
  assert.equal(new Set(played).size, 8);
  // Seed a historical copy directly in this disposable test profile. Never use the disabled M4 download service/API.
  const historicalCourse = JSON.parse(before);
  const historicalModule = historicalCourse.modules.find(
    (m) => m.id === LEARNING_PROGRAM.modules[3].id
  );
  historicalModule.lessons.sort((a, b) => a.order - b.order);
  const legacy = buildOfflineModule(account.id, historicalCourse, historicalModule);
  const legacyFiles = [
    ...new Map(
      historicalModule.lessons
        .flatMap((l) => l.lessonFiles)
        .filter((r) => r.file)
        .map((r) => [r.file.id, r.file])
    ).values()
  ];
  const imageBytes = [];
  for (const file of legacyFiles) {
    const response = await fetch(file.url);
    assert.equal(response.ok, true);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (file.metadata?.sha256)
      assert.equal(
        createHash("sha256").update(bytes).digest("hex"),
        file.metadata.sha256
      );
    imageBytes.push({ id: file.id, mime: file.mimeType, data: bytes.toString("base64") });
  }
  await page.evaluate(
    async ({ legacy, files }) => {
      const cacheName = `warmi-learning-module-${legacy.moduleId}-historical-test`;
      const cache = await caches.open(cacheName),
        assets = {};
      let bytes = 0;
      for (const file of files) {
        const url = `/__warmi_offline__/historical-test-m4/${file.id}`;
        const data = Uint8Array.from(atob(file.data), (c) => c.charCodeAt(0));
        bytes += data.length;
        await cache.put(
          url,
          new Response(data, { headers: { "Content-Type": file.mime } })
        );
        assets[file.id] = url;
      }
      const db = await new Promise((res) => {
        const q = indexedDB.open("warmi-learning-offline", 1);
        q.onsuccess = () => res(q.result);
      });
      await new Promise((res) => {
        const tx = db.transaction("downloads", "readwrite");
        tx.objectStore("downloads").put(
          { ...legacy, cacheName, assets, bytes, downloadedAt: new Date().toISOString() },
          `module:${legacy.moduleId}`
        );
        tx.oncomplete = res;
      });
      db.close();
    },
    { legacy, files: imageBytes }
  );
  await page.reload();
  await page.locator("[data-warmi-offline-home]").waitFor();
  await page
    .locator(`[data-downloaded-module="${legacy.moduleId}"]`)
    .getByRole("link")
    .click();
  await page
    .getByRole("navigation", { name: "Lecciones del módulo" })
    .locator(`a[href$="/lecciones/${legacy.lessons[0].id}"]`)
    .click();
  await page.locator("[data-module4-session]").waitFor();
  for (const img of await page.locator("[data-m4-image]").all())
    await img.evaluate((el) => el.decode());
  assert.equal(
    await page
      .getByRole("button", {
        name: /Actualizar descarga|Descargar para usar sin internet/
      })
      .count(),
    0
  );
  await page.getByRole("button", { name: "Eliminar descarga", exact: true }).click();
  await page.locator("[data-module4-session]").waitFor({ state: "detached" });
  assert.equal(
    (await read(page)).some((d) => d.moduleId === legacy.moduleId),
    false
  );
  assert.equal(
    (await read(page)).some((d) => d.moduleId === m3.id),
    true
  );
  await context.close();
  context = undefined;
  page = await open(true);
  await page.goto(`${courseHref}/lecciones/${m3.lessons[0].id}`);
  await page.locator("[data-warmi-offline-home]").waitFor();
  assert.equal(await page.locator("[data-module3-session1]").count(), 0);
  await page.getByRole("link", { name: "Continuar mi aprendizaje", exact: true }).click();
  // Legacy record still works: no new storage or download is required to see Home.
  await page.evaluate(async (id) => {
    const db = await new Promise((res) => {
      const q = indexedDB.open("warmi-learning-offline", 1);
      q.onsuccess = () => res(q.result);
    });
    const key = `module:${id}`;
    const row = await new Promise((res) => {
      const q = db.transaction("downloads").objectStore("downloads").get(key);
      q.onsuccess = () => res(q.result);
    });
    delete row.contentVersion;
    delete row.progress;
    await new Promise((res) => {
      const tx = db.transaction("downloads", "readwrite");
      tx.objectStore("downloads").put(row, key);
      tx.oncomplete = res;
    });
    db.close();
  }, m3.id);
  await page.reload();
  await page.locator("[data-warmi-offline-home]").waitFor();
  assert.equal(
    await page
      .locator(`[data-downloaded-module="${m3.id}"]`)
      .getByText(/sesiones completadas/)
      .count(),
    0
  );
  await lesson(page, m3.lessons[0].id);
  await page.getByText(/Tienes una descarga anterior del Módulo 3/).waitFor();
  await page.locator("[data-module3-session1]").waitFor();
  await page
    .getByRole("navigation", { name: "Navegación Warmi sin conexión" })
    .getByRole("link", { name: "Mi aprendizaje", exact: true })
    .click();
  await context.setOffline(false);
  await page.getByRole("button", { name: "Volver con conexión", exact: true }).click();
  // Reconnect to the course instead of opening an online lesson (which marks a visit in PostgreSQL).
  await page.goto(courseHref);
  const card = page.locator(`#modulo-${m3.id}`);
  await card.getByRole("button", { name: "Actualizar descarga", exact: true }).waitFor();
  await page.route(`**/api/learning/offline/${courseId}/files/*`, (r) =>
    r.fulfill({ status: 503, body: "test failure" })
  );
  await card.getByRole("button", { name: "Actualizar descarga", exact: true }).click();
  await card.getByText("Error de descarga", { exact: true }).waitFor();
  assert.equal(
    (await read(page)).find((d) => d.moduleId === m3.id).cacheName,
    originalDownload.cacheName
  );
  await page.unroute(`**/api/learning/offline/${courseId}/files/*`);
  await card
    .getByRole("button", { name: "Descargar para usar sin internet", exact: true })
    .click();
  await card
    .getByText("Disponible sin conexión", { exact: true })
    .waitFor({ timeout: 300000 });
  await card.getByRole("button", { name: "Eliminar descarga", exact: true }).click();
  await card.getByText("No descargado", { exact: true }).waitFor();
  assert.equal(
    (await read(page)).some((d) => d.moduleId === m3.id),
    false
  );
  assert.equal((await read(page)).length, 0);
  assert.equal(await snapshot(), before);
  await writeFile(
    join(output, "result.json"),
    JSON.stringify(
      {
        passed: true,
        dbUnchanged: true,
        downloadableModuleIds: modules.map((m) => m.id),
        played: played.length,
        scrollComparison,
        legacyM4: true,
        resources: Object.keys(d3.assets).length,
        widths: [360, 390, 430, 768, 1365],
        screenshots: [
          "01-home-hero-390.png",
          "02-home-four-accesses-390.png",
          "03-programme-offline-390.png",
          "04-identity-offline-390.png",
          "05-session-topic-390.png",
          "06-topic-selector-390.png",
          "07-topic-video-390.png",
          "08-topic-pdf-390.png"
        ]
      },
      null,
      2
    )
  );
  console.log(
    "PASS: real login/download M3 only; M1/M2/M4 absent from download controls and rejected by file API; public/online flow; Home-first cold launch/deep link/restart; CTA/back/forward/module/session; shared S1 DOM; single topic/7-choice selector/previous/next; full institutional offline landing; PDF viewer/export; 8 MP4 and PDF/range/hash delivery; five widths; legacy; update rollback/success; isolated deletion; PostgreSQL unchanged."
  );
} catch (error) {
  const page = context?.pages()[0];
  if (page) {
    await page
      .screenshot({ path: join(output, "failure.png"), fullPage: true })
      .catch(() => {});
    console.error(
      await page
        .evaluate(() => ({
          path: location.pathname,
          text: document.body.innerText.slice(-1800)
        }))
        .catch(() => ({}))
    );
  }
  throw error;
} finally {
  await context?.close();
  await prisma.$disconnect();
  assert.equal(dirname(resolve(profile)), resolve(tmpdir()));
  assert.equal(
    resolve(profile).startsWith(join(resolve(tmpdir()), "warmi-offline-ux-browser-")),
    true
  );
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 });
}
