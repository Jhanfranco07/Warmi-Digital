import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { randomUUID, createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { prisma } = await import("../shared/server/db/prisma.ts");
const { LEARNING_PROGRAM } = await import("../shared/learning/program.ts");
const { MODULE3_ID, MODULE3_SESSIONS, MODULE3_GUIDES, MODULE3_PLATFORMS } =
  await import("../shared/learning/module3-journey.ts");
const { MODULE3_CONTENT_VERSION } = await import("../shared/learning/module3-version.ts");
const { MODULE3_SESSION1_TOPICS } =
  await import("../shared/learning/module3-session1.ts");
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { hash } = require("bcrypt");
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
const courseId = LEARNING_PROGRAM.id;
const courseHref = `${origin}/artesana/aprender/${courseId}`;
const userId = randomUUID(),
  password = `Warmi!${randomUUID()}`,
  email = `warmi-m3-journey-${userId}@example.invalid`;
const profile = await mkdtemp(join(tmpdir(), "warmi-m3-journey-browser-"));
const output = join(tmpdir(), "warmi-m3-journey");
const snapshot = async () =>
  JSON.stringify(
    await prisma.module.findMany({
      where: { courseId },
      orderBy: { id: "asc" },
      include: {
        lessons: {
          orderBy: { id: "asc" },
          include: { lessonFiles: { orderBy: { id: "asc" }, include: { file: true } } }
        }
      }
    })
  );
const before = await snapshot();
let context,
  created = false;
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
  return page;
}
async function play(page) {
  const video = page.locator("video").first();
  assert.equal(await page.locator("video").count(), 1);
  await video.evaluate(async (el) => {
    el.muted = true;
    await el.play();
  });
  await page.waitForFunction(() => {
    const video = document.querySelector("video");
    return video?.currentTime > 0.4 && video.videoWidth > 0;
  });
  played.push(await video.getAttribute("src"));
  await video.evaluate((el) => el.pause());
}
async function next(page) {
  await page
    .locator("[data-module3-journey]")
    .getByRole("button", { name: "Continuar", exact: true })
    .click();
}
async function openLesson(page, order) {
  await page.goto(`${courseHref}/lecciones/${MODULE3_SESSIONS[order - 1].id}`);
  await page
    .locator(order === 1 ? "[data-module3-session1]" : `[data-session-order="${order}"]`)
    .waitFor();
}
async function pdfBytes(page, guide, offline) {
  const url = offline
    ? guide.localUrl
    : `/api/learning/offline/${courseId}/files/${guide.file.id}`;
  const result = await page.evaluate(async (url) => {
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", data)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return {
      status: response.status,
      mime: response.headers.get("content-type")?.split(";")[0],
      bytes: data.byteLength,
      hash
    };
  }, url);
  assert.deepEqual(result, {
    status: 200,
    mime: "application/pdf",
    bytes: guide.file.size,
    hash: guide.file.metadata.sha256
  });
}
try {
  const role = await prisma.role.findUniqueOrThrow({ where: { name: "ARTESANA" } });
  await prisma.user.create({
    data: {
      id: userId,
      email,
      name: "Prueba M3",
      passwordHash: await hash(password, 10),
      profile: {
        create: { firstName: "Prueba", lastName: "M3", displayName: "Prueba M3" }
      },
      userRoles: { create: { roleId: role.id } },
      enrollments: { create: { courseId, status: "ACTIVE" } }
    }
  });
  created = true;
  const learningModule = await prisma.module.findUniqueOrThrow({
    where: { id: MODULE3_ID },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          lessonFiles: { orderBy: { position: "asc" }, include: { file: true } }
        }
      }
    }
  });
  assert.deepEqual(
    learningModule.lessons.map((l) => l.id),
    MODULE3_SESSIONS.map((s) => s.id)
  );
  const guides = learningModule.lessons
    .flatMap((l) => l.lessonFiles)
    .filter((r) => r.file?.mimeType === "application/pdf");
  assert.equal(guides.length, 10);
  assert.deepEqual(
    learningModule.lessons[0].lessonFiles
      .filter((r) => r.type === "PDF")
      .map((r) => r.position),
    [10, 11, 12, 13, 14, 15, 16]
  );
  for (const lesson of learningModule.lessons)
    assert.equal(
      new Set(lesson.lessonFiles.map((r) => r.position)).size,
      lesson.lessonFiles.length
    );
  let page = await open();
  await page.goto(`${origin}/login`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Ingresar como artesana", exact: true }).click();
  await page.waitForURL("**/artesana/**");
  await openLesson(page, 4);
  for (let i = 0; i < 3; i++) await next(page);
  await page.getByRole("button", { name: "Finalizar práctica", exact: true }).click();
  await page.getByText("Módulo 3: 25% completado.", { exact: true }).waitFor();
  await page
    .getByText("Completa las sesiones pendientes para llegar al 100%.", { exact: true })
    .waitFor();
  console.log("PASS honest closing: S4 alone is 25%, never an artificial 100%.");
  await openLesson(page, 1);
  for (const topic of MODULE3_SESSION1_TOPICS.slice(0, 4)) {
    const section = page.locator(`[data-session1-topic="${topic.key}"]`);
    if (
      (await section.getByRole("button").first().getAttribute("aria-expanded")) !== "true"
    )
      await section.getByRole("button").first().click();
    await play(page);
  }
  for (const guide of guides) await pdfBytes(page, guide, false);
  console.log("PASS S1: four videos and ten authenticated PDF hashes.");
  await page.getByRole("button", { name: "Marcar como completada", exact: true }).click();
  await page.getByRole("button", { name: "Lección completada", exact: true }).waitFor();
  await openLesson(page, 2);
  assert.equal(await page.getByRole("checkbox").count(), 5);
  await next(page);
  for (const width of [360, 390, 430, 768, 1365]) {
    await page.setViewportSize({ width, height: 900 });
    for (const option of MODULE3_PLATFORMS) {
      await page.getByRole("button", { name: option.name, exact: true }).click();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true
      );
      const action = page.getByRole("button", { name: option.cta, exact: true });
      await action.scrollIntoViewIfNeeded();
      assert.equal(
        await action.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.height >= 48 &&
            el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
          );
        }),
        true,
        `Platform CTA must be touchable and uncovered at ${width}px`
      );
    }
    await page.screenshot({ path: join(output, `s2-${width}-viewport.png`) });
    const continueButton = page
      .locator("[data-module3-journey]")
      .getByRole("button", { name: "Continuar", exact: true });
    await continueButton.scrollIntoViewIfNeeded();
    assert.equal(
      await continueButton.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.height >= 48 &&
          el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
        );
      }),
      true,
      `Main CTA must stay above fixed navigation at ${width}px`
    );
    await page.screenshot({ path: join(output, `s2-${width}.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await next(page);
  await play(page);
  await page.getByRole("button", { name: "Ver otro ejemplo", exact: true }).click();
  await play(page);
  await page
    .getByRole("button", { name: "Completar sesión y continuar", exact: true })
    .click();
  await page.waitForURL(`**/${MODULE3_SESSIONS[2].id}`);
  console.log(
    "PASS S2: questions, options, responsive widths, two videos, saved progress."
  );
  for (const name of ["Yape", "Plin"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await play(page);
  }
  await next(page);
  await page
    .getByText(
      "La captura no confirma el pago. Confirma el dinero dentro de tu propia aplicación.",
      { exact: true }
    )
    .waitFor();
  await page.screenshot({ path: join(output, "s3-payment-rule.png"), fullPage: true });
  await next(page);
  const alerts = page.getByRole("button", {
    name: "¿Cómo reconocer un posible pago falso?",
    exact: true
  });
  await alerts.click();
  assert.equal(await alerts.getAttribute("aria-expanded"), "true");
  await page
    .getByRole("button", { name: "Completar sesión y continuar", exact: true })
    .click();
  await page.waitForURL(`**/${MODULE3_SESSIONS[3].id}`);
  console.log("PASS S3: Yape/Plin, payment rule, alerts, saved progress.");
  for (let i = 1; i <= 4; i++) {
    await page.getByText(`Paso ${i} de 4`, { exact: true }).waitFor();
    assert.equal(await page.locator("[data-m3-step]").count(), 1);
    if (i < 4) await next(page);
  }
  await page.getByRole("button", { name: "Finalizar práctica", exact: true }).click();
  await page.getByText("Módulo 3: 100% completado.", { exact: true }).waitFor();
  await page.screenshot({ path: join(output, "m3-closing-online.png"), fullPage: true });
  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: { userId_courseId: { userId, courseId } },
    include: { lessonProgresses: true, courseProgress: true }
  });
  assert.equal(enrollment.lessonProgresses.filter((p) => p.completed).length, 4);
  assert.equal(enrollment.courseProgress.percentage, 33);
  assert.equal(enrollment.courseProgress.totalLessons, 12);
  console.log(
    "PASS S4: four steps, closing 100%, global progress 33% of twelve lessons."
  );
  await page.getByRole("link", { name: "Finalizar Módulo 3", exact: true }).click();
  await page.waitForURL(courseHref);
  await page
    .getByRole("button", { name: "Descargar para usar sin internet", exact: true })
    .click();
  await page
    .getByText("Disponible sin conexión", { exact: true })
    .waitFor({ timeout: 240000 });
  const read = () =>
    page.evaluate(async () => {
      const db = await new Promise((res, rej) => {
        const q = indexedDB.open("warmi-learning-offline", 1);
        q.onsuccess = () => res(q.result);
        q.onerror = () => rej(q.error);
      });
      const values = await new Promise((res, rej) => {
        const q = db.transaction("downloads").objectStore("downloads").getAll();
        q.onsuccess = () => res(q.result);
        q.onerror = () => rej(q.error);
      });
      db.close();
      return values[0];
    });
  let download = await read();
  assert.equal(download.lessons.length, 4);
  assert.equal(download.contentVersion, MODULE3_CONTENT_VERSION);
  assert.equal(Object.keys(download.assets).length, 18);
  // Simulate the real 13-resource legacy package without touching server-side records.
  await page.evaluate(async () => {
    const db = await new Promise((res) => {
      const q = indexedDB.open("warmi-learning-offline", 1);
      q.onsuccess = () => res(q.result);
    });
    const key = "module:6c96bcdf-0b41-48d2-bdcd-394d06acd9d2";
    const value = await new Promise((res) => {
      const q = db.transaction("downloads").objectStore("downloads").get(key);
      q.onsuccess = () => res(q.result);
    });
    delete value.contentVersion;
    value.lessons = value.lessons.slice(0, 2);
    value.lessons[1].resources = value.lessons[1].resources.filter(
      (r) => r.type !== "PDF"
    );
    const ids = new Set(
      value.lessons
        .flatMap((l) => l.resources)
        .flatMap((r) => (r.file ? [r.file.id] : []))
    );
    const cache = await caches.open(value.cacheName);
    for (const [id, url] of Object.entries(value.assets))
      if (!ids.has(id)) {
        await cache.delete(url);
        delete value.assets[id];
      }
    await new Promise((res) => {
      const tx = db.transaction("downloads", "readwrite");
      tx.objectStore("downloads").put(value, key);
      tx.oncomplete = res;
    });
    db.close();
  });
  await page.reload();
  await page.getByRole("button", { name: "Actualizar descarga", exact: true }).waitFor();
  const legacy = await read();
  await context.setOffline(true);
  await openLesson(page, 1);
  await page.getByText(/Tienes una descarga anterior del Módulo 3/).waitFor();
  await pdfBytes(page, { ...guides[0], localUrl: legacy.assets[guides[0].fileId] }, true);
  await page.goto(`${courseHref}/lecciones/${MODULE3_SESSIONS[1].id}`);
  await page.getByText(/Tienes una descarga anterior del Módulo 3/).waitFor();
  assert.equal(await page.locator("[data-module3-journey]").count(), 0);
  assert.equal(await page.locator("video").count(), 2);
  await context.setOffline(false);
  await page.goto(courseHref);
  await page.getByRole("button", { name: "Actualizar descarga", exact: true }).waitFor();
  console.log(
    "PASS legacy: previous S1/PDF and S2 remain readable offline with update warning."
  );
  await page.route(`**/api/learning/offline/${courseId}/files/*`, (route) =>
    route.fulfill({ status: 503, body: "test failure" })
  );
  await page.getByRole("button", { name: "Actualizar descarga", exact: true }).click();
  await page.getByText("Error de descarga", { exact: true }).waitFor();
  assert.equal((await read()).cacheName, legacy.cacheName);
  await page.unroute(`**/api/learning/offline/${courseId}/files/*`);
  await page
    .getByRole("button", { name: "Descargar para usar sin internet", exact: true })
    .click();
  await page
    .getByText("Disponible sin conexión", { exact: true })
    .waitFor({ timeout: 240000 });
  download = await read();
  assert.equal(Object.keys(download.assets).length, 18);
  const sizes = await page.evaluate(async () => {
    let resources = 0,
      shell = 0;
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        const size = (await (await cache.match(request)).arrayBuffer()).byteLength;
        if (name.startsWith("warmi-learning-module-")) resources += size;
        else if (name.startsWith("warmi-offline-shell-")) shell += size;
      }
    }
    return { resources, shell };
  });
  sizes.metadata = new TextEncoder().encode(JSON.stringify(download)).byteLength;
  sizes.total = sizes.resources + sizes.shell + sizes.metadata;
  await writeFile(
    join(output, "browser-result.json"),
    JSON.stringify({ assets: 18, sizes, played }, null, 2)
  );
  console.log(JSON.stringify({ assets: 18, sizes }));
  await context.close();
  context = undefined;
  page = await open(true);
  await openLesson(page, 1);
  for (const guide of guides)
    await pdfBytes(page, { ...guide, localUrl: download.assets[guide.fileId] }, true);
  for (const topic of MODULE3_SESSION1_TOPICS.slice(0, 4)) {
    const section = page.locator(`[data-session1-topic="${topic.key}"]`);
    if (
      (await section.getByRole("button").first().getAttribute("aria-expanded")) !== "true"
    )
      await section.getByRole("button").first().click();
    await play(page);
  }
  await openLesson(page, 2);
  await next(page);
  await page
    .getByRole("button", { name: "Conocer Artesanías del Perú", exact: true })
    .click();
  await page
    .getByText("Este recurso necesita conexión a internet.", { exact: true })
    .waitFor();
  await next(page);
  await play(page);
  await page.getByRole("button", { name: "Ver otro ejemplo", exact: true }).click();
  await play(page);
  await openLesson(page, 3);
  for (const name of ["Yape", "Plin"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await play(page);
  }
  await next(page);
  await next(page);
  // Native exports of each new PDF use the same SW bytes, never a network URL.
  for (const guide of MODULE3_GUIDES) {
    await openLesson(page, guide.order);
    await page.getByRole("button", { name: guide.title, exact: true }).click();
    const event = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar PDF", exact: true }).click();
    const file = await event;
    assert.equal(await file.failure(), null);
    const bytes = await readFile(await file.path());
    const expected = guides.find((g) => g.title === guide.title);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      expected.file.metadata.sha256
    );
  }
  await openLesson(page, 4);
  for (let i = 0; i < 3; i++) await next(page);
  await page.getByRole("button", { name: "Finalizar práctica", exact: true }).click();
  await page.locator("[data-module3-closing]").waitFor();
  await page.getByText(/Práctica finalizada sin conexión/).waitFor();
  await page.screenshot({ path: join(output, "m3-closing-offline.png"), fullPage: true });
  await context.setOffline(false);
  await page.getByRole("button", { name: "Volver con conexión", exact: true }).click();
  await page.locator("[data-module3-journey]").waitFor();
  await page.goto(courseHref);
  await page.getByRole("button", { name: "Eliminar descarga", exact: true }).click();
  await page.getByText("No descargado", { exact: true }).waitFor();
  assert.equal(
    await page.evaluate(async () => {
      const db = await new Promise((res) => {
        const q = indexedDB.open("warmi-learning-offline", 1);
        q.onsuccess = () => res(q.result);
      });
      const count = await new Promise((res) => {
        const q = db.transaction("downloads").objectStore("downloads").count();
        q.onsuccess = () => res(q.result);
      });
      db.close();
      return count;
    }),
    0
  );
  assert.equal(
    (await page.evaluate(() => caches.keys())).filter(
      (n) => n.startsWith("warmi-learning-module-") || n.startsWith("warmi-module3-")
    ).length,
    0
  );
  assert.equal(await snapshot(), before);
  console.log(
    "PASS M3: four sessions, closing, real progress, 8 videos online/offline, 10 PDF hashes offline, 3 native PDF exports, legacy warning, failed update rollback, successful update, responsive 360/390/430/tablet/desktop, reconnect/delete; protected content unchanged."
  );
} catch (error) {
  const page = context?.pages()[0];
  if (page) {
    console.error(
      await page
        .evaluate(() => ({
          url: location.href,
          text: document.body.innerText.slice(-2500),
          online: navigator.onLine
        }))
        .catch(() => "Page unavailable")
    );
    await page
      .screenshot({ path: join(output, "failure.png"), fullPage: true })
      .catch(() => undefined);
  }
  throw error;
} finally {
  await context?.close();
  if (created) {
    await prisma.enrollment.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  }
  await prisma.$disconnect();
  assert.equal(dirname(resolve(profile)), resolve(tmpdir()));
  assert.equal(
    resolve(profile).startsWith(join(resolve(tmpdir()), "warmi-m3-journey-browser-")),
    true
  );
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 });
}
