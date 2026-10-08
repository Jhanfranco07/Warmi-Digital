import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
const courseId = "93dc7355-d746-4acd-87df-29f71d16a955";
const title = "Módulo 3: Herramientas digitales para vender";
const email = process.env.WARMI_TEST_EMAIL;
const password = process.env.WARMI_TEST_PASSWORD;
if (!email || !password)
  throw new Error(
    "Define WARMI_TEST_EMAIL y WARMI_TEST_PASSWORD para la cuenta de prueba."
  );
const profile = await mkdtemp(join(tmpdir(), "warmi-real-module3-"));
const verifyVideos = process.env.WARMI_REAL_MP4 === "1";
const verifyGuides = process.env.WARMI_REAL_GUIDES !== "0";
const guides = JSON.parse(
  await readFile(
    new URL("../output/pdf/module3-session1/manifest.json", import.meta.url),
    "utf8"
  )
);
const { MODULE3_SESSION1_TOPICS } =
  await import("../shared/learning/module3-session1.ts");
const sessionIds = [
  "8a8e449b-76a6-4a6d-9693-6238f75092bc",
  "9bd401d6-5c80-4099-aa7b-e1b90b62d9b7"
];
async function playVideos(page, count, offline) {
  assert.equal(await page.locator("video").count(), count);
  const played = [];
  for (let index = 0; index < count; index++) {
    const video = page.locator("video").nth(index);
    await video.evaluate((element) => {
      const details = element.closest("details");
      if (details) details.open = true;
    });
    const src = await video.getAttribute("src");
    assert.equal(
      offline
        ? src.startsWith("/__warmi_offline__/")
        : src.startsWith("https://res.cloudinary.com/szhwzy4q/video/upload/"),
      true
    );
    await video.scrollIntoViewIfNeeded();
    await video.evaluate(async (element) => {
      element.muted = true;
      await element.play();
    });
    await page.waitForFunction(
      (element) => element.currentTime > 0.4 && element.videoWidth > 0,
      await video.elementHandle(),
      { timeout: 60000 }
    );
    played.push(
      await video.evaluate((element) => {
        element.pause();
        return {
          src: element.currentSrc,
          duration: element.duration,
          width: element.videoWidth,
          height: element.videoHeight
        };
      })
    );
  }
  console.log(JSON.stringify({ mode: offline ? "offline" : "online", played }));
}
async function checkSession1(page, offline, withGuides = verifyGuides) {
  await page.locator("[data-module3-session1]").waitFor();
  for (const topic of MODULE3_SESSION1_TOPICS) {
    const section = page.locator(`[data-session1-topic="${topic.key}"]`);
    await page.getByRole("button", { name: "Ver todos los temas", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: topic.title, exact: true })
      .click();
    assert.equal(await page.locator("[data-session1-active]").count(), 1);
    if (verifyVideos && topic.videoIds.length)
      await playVideos(page, topic.videoIds.length, offline);
    if (withGuides) {
      const link = section.getByRole("link", {
        name: `Abrir guía PDF: ${topic.title}`,
        exact: true
      });
      const href = await link.getAttribute("href");
      const data = await page.evaluate(async (url) => {
        const response = await fetch(url);
        const bytes = await response.arrayBuffer();
        return {
          status: response.status,
          type: response.headers.get("content-type"),
          size: bytes.byteLength,
          magic: new TextDecoder().decode(bytes.slice(0, 5)),
          hash: Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)))
            .map((v) => v.toString(16).padStart(2, "0"))
            .join("")
        };
      }, href);
      const expected = guides.find((item) => item.key === topic.key);
      assert.equal(data.status, 200);
      assert.equal(data.type.split(";")[0], "application/pdf");
      assert.equal(data.magic, "%PDF-");
      assert.equal(data.size, expected.bytes);
      assert.equal(data.hash, expected.sha256);
      const downloadLink = section.getByRole("link", {
        name: `Descargar guía PDF: ${topic.title}`,
        exact: true
      });
      const downloadHref = await downloadLink.getAttribute("href");
      const downloadEvent = page.waitForEvent("download", {
        predicate: (download) =>
          offline
            ? download.url().startsWith("blob:") &&
              download.suggestedFilename() === `${topic.key}.pdf`
            : download.url() === new URL(downloadHref, origin).href
      });
      await downloadLink.click();
      const download = await downloadEvent;
      assert.equal(await download.failure(), null);
      assert.equal(
        createHash("sha256")
          .update(await readFile(await download.path()))
          .digest("hex"),
        expected.sha256
      );
      const opened = page.waitForEvent("popup");
      await link.click();
      const pdfPage = await opened;
      await pdfPage.waitForURL((url) =>
        offline ? url.href.startsWith("blob:") : url.href === new URL(href, origin).href
      );
      await pdfPage.goto("about:blank");
      await pdfPage.close();
      console.log(
        JSON.stringify({
          guide: topic.key,
          mode: offline ? "offline" : "online",
          http: data.status,
          opened: true,
          downloaded: true,
          sha256Match: true
        })
      );
    }
    if (!withGuides && offline) {
      await section
        .getByRole("button", { name: "Descargar guía PDF", exact: true })
        .click();
      await page
        .getByRole("alert")
        .getByText("Este contenido todavía no está disponible sin conexión.", {
          exact: true
        })
        .waitFor();
    }
    if (offline && topic.key === "crear-cuenta-facebook") {
      await section.getByRole("button", { name: "Abrir Facebook", exact: true }).click();
      await page
        .getByRole("alert")
        .getByText("Este recurso necesita conexión a internet.", { exact: true })
        .waitFor();
    }
    for (const width of [320, 390, 1365]) {
      await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true
      );
      await page.screenshot({
        path: join(
          tmpdir(),
          `warmi-m3-s1-${topic.key}-${offline ? "offline" : "online"}-${width}.png`
        ),
        fullPage: true,
        animations: "disabled"
      });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await section
      .getByRole("button", { name: "Escuchar este tema", exact: true })
      .click();
  }
  await page.getByRole("button", { name: "Ver todos los temas", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: MODULE3_SESSION1_TOPICS[0].title, exact: true })
    .click();
}
let context;
async function open(offline) {
  context = await chromium.launchPersistentContext(profile, {
    headless: process.env.WARMI_HEADED !== "1",
    args: [
      "--disable-gpu",
      ...(process.env.WARMI_HEADED === "1" ? ["--window-position=-10000,-10000"] : [])
    ],
    acceptDownloads: true,
    channel: process.env.WARMI_BROWSER_CHANNEL || undefined,
    viewport: { width: 390, height: 844 },
    offline
  });
  return context.pages()[0] || context.newPage();
}

try {
  let page = await open(false);
  await page.goto(`${origin}/login`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Ingresar como artesana", exact: true }).click();
  await page.waitForURL("**/artesana/**", { timeout: 60000 });
  await page.goto(`${origin}/artesana/aprender`);
  const cover = page.locator('img[src*="aprender-para-crecer-cover-v1"]').first();
  await cover.waitFor();
  await cover.scrollIntoViewIfNeeded();
  await cover.evaluate((image) => image.decode());
  assert.equal(await cover.evaluate((image) => image.naturalWidth > 0), true);
  await page.screenshot({ path: join(tmpdir(), "warmi-learning-cover-mobile.png") });
  await page.goto(`${origin}/artesana/aprender/${courseId}`);
  await page.getByRole("heading", { name: title, exact: true }).waitFor();
  await page
    .getByRole("heading", { name: "Aprender para crecer", exact: true })
    .waitFor();
  await page
    .getByRole("heading", {
      name: "Módulo 1: Mi celular como herramienta de acceso al Estado",
      exact: true
    })
    .waitFor();
  await page
    .getByRole("heading", {
      name: "Módulo 2: Oportunidades para mi negocio",
      exact: true
    })
    .waitFor();
  await page
    .getByRole("heading", {
      name: "Módulo 4: Estrategias de venta y autonomía digital",
      exact: true
    })
    .waitFor();
  assert.deepEqual(
    await page.getByRole("heading", { name: /^Módulo [1-4]:/ }).allTextContents(),
    [
      "Módulo 1: Mi celular como herramienta de acceso al Estado",
      "Módulo 2: Oportunidades para mi negocio",
      title,
      "Módulo 4: Estrategias de venta y autonomía digital"
    ]
  );
  assert.equal(
    await page.getByText("Contenido en preparación.", { exact: true }).count(),
    1
  );
  assert.equal(
    await page.getByRole("link", { name: /Mi vitrina|Mis pedidos/i }).count(),
    0
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Descargar para usar sin internet", exact: true })
      .count(),
    1
  );
  await page.getByText("Módulo 3", { exact: true }).waitFor();
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true
  );
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => element.decode());
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: join(tmpdir(), "warmi-program-mobile.png"),
    fullPage: true
  });
  await page.setViewportSize({ width: 1365, height: 900 });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true
  );
  await page.screenshot({
    path: join(tmpdir(), "warmi-program-desktop.png"),
    fullPage: true
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    `${origin}/artesana/aprender/3889134e-620b-40db-98cf-8f6b2a0c43ec/lecciones/${sessionIds[0]}`
  );
  await page.waitForURL(`**/artesana/aprender/${courseId}/lecciones/${sessionIds[0]}`);
  await page.goto(`${origin}/artesana/aprender/de47675b-fd20-4fbd-b980-41dbd71a94ae`);
  await page.waitForURL(`**/artesana/aprender/${courseId}`);
  if (verifyVideos) {
    for (const [index, sessionId] of sessionIds.entries()) {
      await page.goto(`${origin}/artesana/aprender/${courseId}/lecciones/${sessionId}`);
      await page.locator("video").first().waitFor();
      if (index === 0) await checkSession1(page, false);
      else await playVideos(page, 2, false);
    }
    await page.goto(`${origin}/artesana/aprender/${courseId}`);
  }
  await page
    .getByRole("button", { name: "Descargar para usar sin internet", exact: true })
    .click();
  await page
    .getByText("Disponible sin conexión", { exact: true })
    .waitFor({ timeout: 300000 });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  if (verifyVideos) {
    const sizes = await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("warmi-learning-offline", 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = reject;
      });
      const record = await new Promise((resolve, reject) => {
        const request = db
          .transaction("downloads")
          .objectStore("downloads")
          .get("module:6c96bcdf-0b41-48d2-bdcd-394d06acd9d2");
        request.onsuccess = () => resolve(request.result);
        request.onerror = reject;
      });
      db.close();
      let resourceBytes = 0;
      let shellBytes = 0;
      for (const name of await caches.keys()) {
        if (
          !name.startsWith("warmi-learning-module-") &&
          !name.startsWith("warmi-offline-shell-")
        )
          continue;
        const cache = await caches.open(name);
        for (const key of await cache.keys()) {
          const bytes = (await (await cache.match(key)).blob()).size;
          if (name === record.cacheName) resourceBytes += bytes;
          else if (name.startsWith("warmi-offline-shell-")) shellBytes += bytes;
        }
      }
      const metadataBytes = new TextEncoder().encode(JSON.stringify(record)).byteLength;
      return {
        assets: Object.keys(record.assets).length,
        declaredBytes: record.bytes,
        resourceBytes,
        metadataBytes,
        shellBytes,
        totalPayloadBytes: resourceBytes + metadataBytes + shellBytes
      };
    });
    const pdfBytes = verifyGuides ? guides.reduce((sum, item) => sum + item.bytes, 0) : 0;
    assert.equal(sizes.assets, verifyGuides ? 13 : 6);
    assert.equal(sizes.resourceBytes, 104293181 + pdfBytes);
    assert.equal(sizes.declaredBytes, sizes.resourceBytes);
    console.log(JSON.stringify({ packageSizes: sizes }));
  }
  if (process.env.WARMI_LEGACY_DOWNLOAD === "1") {
    await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("warmi-learning-offline", 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = reject;
      });
      const current = await new Promise((resolve, reject) => {
        const request = db
          .transaction("downloads")
          .objectStore("downloads")
          .get("module:6c96bcdf-0b41-48d2-bdcd-394d06acd9d2");
        request.onsuccess = () => resolve(request.result);
        request.onerror = reject;
      });
      const legacyCacheName = `warmi-module3-${crypto.randomUUID()}`;
      const oldCache = await caches.open(current.cacheName);
      const legacyCache = await caches.open(legacyCacheName);
      for (const request of await oldCache.keys()) {
        const response = await oldCache.match(request);
        await legacyCache.put(
          request,
          new Response(await response.arrayBuffer(), { headers: response.headers })
        );
      }
      await new Promise((resolve, reject) => {
        const tx = db.transaction("downloads", "readwrite");
        const store = tx.objectStore("downloads");
        const request = store.get("module:6c96bcdf-0b41-48d2-bdcd-394d06acd9d2");
        request.onsuccess = () => {
          store.put(
            {
              ...request.result,
              title: "Módulo 3: Herramienta digitales para crecer",
              cacheName: legacyCacheName,
              courseId: "3889134e-620b-40db-98cf-8f6b2a0c43ec",
              courseTitle: "Aprende a usar WhatsApp Business para tu negocio"
            },
            "module3"
          );
          store.delete("module:6c96bcdf-0b41-48d2-bdcd-394d06acd9d2");
        };
        tx.oncomplete = resolve;
        tx.onerror = reject;
      });
      await caches.delete(current.cacheName);
      db.close();
    });
    console.log(
      "Legacy module3 key, old courseId and warmi-module3-* cache prepared for compatibility test."
    );
  }
  await context.close();
  page = await open(true);
  await page.goto(`${origin}/artesana/aprender`);
  await page
    .getByRole("heading", { name: title, exact: true })
    .waitFor({ timeout: 90000 });
  await page
    .getByRole("link", { name: "1. Sesión 1: Publica tu arte en redes", exact: true })
    .click();
  assert.equal(
    await page.locator("[data-offline-lesson-text]").evaluate((el) => el.open),
    false
  );
  assert.equal(await page.locator("[data-session1-active]").count(), 1);
  await page.getByText("Leer texto completo", { exact: true }).click();
  await page
    .getByText(/Crea tu catálogo de productos/)
    .first()
    .waitFor();
  await page.getByText("Leer texto completo", { exact: true }).click();
  await checkSession1(page, true);
  await page
    .getByRole("link", { name: /Abrir lección de apoyo/ })
    .first()
    .click();
  await page
    .getByRole("heading", { name: "¿Qué es WhatsApp Business?", exact: true })
    .waitFor();
  await page.getByText("Leer texto completo", { exact: true }).click();
  await page.getByText(/Conoce las diferencias entre WhatsApp normal/).waitFor();
  await page
    .getByRole("link", { name: "Configura tu perfil de negocio", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Configura tu perfil de negocio", exact: true })
    .waitFor();
  await page
    .getByRole("link", { name: "2. Sesión 2: Llega a nuevos clientes", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Sesión 2: Llega a nuevos clientes", exact: true })
    .waitFor();
  assert.equal(
    await page.locator("[data-offline-lesson-text]").evaluate((el) => el.open),
    false
  );
  await page.screenshot({
    path: join(tmpdir(), "warmi-offline-session-mobile.png"),
    fullPage: false
  });
  if (verifyVideos) await playVideos(page, 2, true);
  await page.getByRole("button", { name: "Escuchar explicación", exact: true }).click();
  assert.equal(await page.evaluate(() => "speechSynthesis" in window), true);
  await page.getByRole("button", { name: "Abrir enlace", exact: true }).first().click();
  await page
    .getByText("Este recurso necesita conexión a internet.", { exact: true })
    .waitFor();
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true
  );
  await page.screenshot({
    path: join(tmpdir(), "warmi-module3-real-mobile.png"),
    fullPage: true
  });
  await page.setViewportSize({ width: 1365, height: 900 });
  await page.screenshot({
    path: join(tmpdir(), "warmi-module3-real-desktop.png"),
    fullPage: true
  });
  await context.setOffline(false);
  await page.getByRole("button", { name: "Volver con conexión", exact: true }).waitFor();
  await page.getByRole("link", { name: "Volver al curso", exact: true }).click();
  await page.getByRole("button", { name: "Volver con conexión", exact: true }).click();
  await page.getByRole("heading", { name: title, exact: true }).waitFor();
  await page.getByRole("button", { name: "Eliminar descarga", exact: true }).click();
  await page.getByText("No descargado", { exact: true }).waitFor();
  assert.deepEqual(
    await page.evaluate(async () =>
      (await caches.keys()).filter(
        (name) =>
          name.startsWith("warmi-learning-module-") || name.startsWith("warmi-module3-")
      )
    ),
    []
  );
  assert.equal(
    await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("warmi-learning-offline", 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = reject;
      });
      const saved = await new Promise((resolve, reject) => {
        const request = db.transaction("downloads").objectStore("downloads").getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = reject;
      });
      db.close();
      return saved.length > 0;
    }),
    false
  );
  if (verifyGuides) {
    await page
      .getByRole("button", { name: "Descargar para usar sin internet", exact: true })
      .click();
    await page
      .getByText("Disponible sin conexión", { exact: true })
      .waitFor({ timeout: 300000 });
    await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("warmi-learning-offline", 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = reject;
      });
      const saved = await new Promise((resolve, reject) => {
        const request = db
          .transaction("downloads")
          .objectStore("downloads")
          .get("module:6c96bcdf-0b41-48d2-bdcd-394d06acd9d2");
        request.onsuccess = () => resolve(request.result);
        request.onerror = reject;
      });
      const pdfIds = new Set(
        saved.lessons
          .flatMap((lesson) => lesson.resources)
          .filter((resource) => resource.file?.mimeType === "application/pdf")
          .map((resource) => resource.file.id)
      );
      const cache = await caches.open(saved.cacheName);
      for (const fileId of pdfIds) {
        await cache.delete(saved.assets[fileId]);
        delete saved.assets[fileId];
      }
      saved.lessons = saved.lessons.map((lesson) => ({
        ...lesson,
        resources: lesson.resources.filter((resource) => !pdfIds.has(resource.file?.id))
      }));
      saved.bytes = 104293181;
      const legacyName = `warmi-module3-${crypto.randomUUID()}`;
      const legacyCache = await caches.open(legacyName);
      for (const request of await cache.keys()) {
        const response = await cache.match(request);
        await legacyCache.put(
          request,
          new Response(await response.arrayBuffer(), { headers: response.headers })
        );
      }
      const previousCache = saved.cacheName;
      saved.cacheName = legacyName;
      saved.courseId = "3889134e-620b-40db-98cf-8f6b2a0c43ec";
      saved.courseTitle = "Aprende a usar WhatsApp Business para tu negocio";
      await new Promise((resolve, reject) => {
        const tx = db.transaction("downloads", "readwrite");
        tx.objectStore("downloads").put(saved, "module3");
        tx.objectStore("downloads").delete("module:6c96bcdf-0b41-48d2-bdcd-394d06acd9d2");
        tx.oncomplete = resolve;
        tx.onerror = reject;
      });
      db.close();
      await caches.delete(previousCache);
    });
    await context.close();
    page = await open(true);
    await page.goto(`${origin}/artesana/aprender`);
    await page
      .getByRole("link", { name: "1. Sesión 1: Publica tu arte en redes", exact: true })
      .click();
    await checkSession1(page, true, false);
    await page
      .getByRole("link", { name: "2. Sesión 2: Llega a nuevos clientes", exact: true })
      .click();
    if (verifyVideos) await playVideos(page, 2, true);
    await context.setOffline(false);
    await page.getByRole("link", { name: "Volver al curso", exact: true }).click();
    await page.getByRole("button", { name: "Volver con conexión", exact: true }).click();
    await page.getByRole("button", { name: "Eliminar descarga", exact: true }).click();
    await page.getByText("No descargado", { exact: true }).waitFor();
    console.log(
      "PASS: older six-MP4 package without PDFs survives full offline restart; missing guides show the correct message and deletion still works."
    );
  }
  console.log(
    `PASS: real course, login, download, full browser restart offline, both sessions, original support lessons, voice API, external guard, reconnect and deletion. Real MP4 online/offline: ${verifyVideos ? "6/6 PASS" : "not requested"}. Real PDF online/offline: ${verifyGuides ? "7/7 PASS" : "not requested; older package without guides tested"}. No media records created by this test.`
  );
} catch (error) {
  console.error(error);
  const page = context?.pages()[0];
  if (page) {
    console.error(
      await page
        .evaluate(async () => ({
          url: location.href,
          online: navigator.onLine,
          content: document.body.innerText.slice(0, 2000),
          caches: await caches.keys(),
          storage: await navigator.storage.estimate(),
          worker: navigator.serviceWorker.controller?.scriptURL
        }))
        .catch(() => "Page unavailable")
    );
    await page
      .screenshot({ path: join(tmpdir(), "warmi-module3-failure.png"), fullPage: true })
      .catch(() => undefined);
  }
  throw error;
} finally {
  await context?.close();
  assert.equal(dirname(resolve(profile)), resolve(tmpdir()));
  assert.equal(basename(profile).startsWith("warmi-real-module3-"), true);
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 });
}
