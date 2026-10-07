import assert from "node:assert/strict";
import curriculum from "../shared/learning/curriculum.json" with { type: "json" };
import legacyFixture from "./fixtures/module3-legacy.json" with { type: "json" };
import { createRequire } from "node:module";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

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
const screenshotDir = process.env.WARMI_SCREENSHOT_DIR || tmpdir();
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
let context;
async function open(offline) {
  context = await chromium.launchPersistentContext(profile, {
    headless: true,
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
  await page.screenshot({ path: join(screenshotDir, "warmi-learning-cover-mobile.png") });
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
    0
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
  const forbiddenGuide = await page.request.get(
    `${origin}/api/learning/offline/${courseId}/files/${curriculum.sessions[0].guides[0].id}`
  );
  assert.equal(forbiddenGuide.status(), 404);
  const allowedGuide = await page.request.get(
    `${origin}/api/learning/offline/${courseId}/files/${curriculum.sessions[8].guides[0].id}`
  );
  assert.equal(allowedGuide.status(), 200);
  assert.equal((await allowedGuide.body()).length, curriculum.sessions[8].guides[0].size);

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
    path: join(screenshotDir, "warmi-program-mobile.png"),
    fullPage: true
  });
  await page.setViewportSize({ width: 1365, height: 900 });
  await page.evaluate(async () => {
    for (const element of document.querySelectorAll('main [style*="background-image"]')) {
      const match =
        getComputedStyle(element).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
      if (match) {
        const image = new Image();
        image.src = match[1];
        await image.decode();
      }
    }
  });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true
  );
  await page.screenshot({
    path: join(screenshotDir, "warmi-program-desktop.png"),
    fullPage: true
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    `${origin}/artesana/aprender/3889134e-620b-40db-98cf-8f6b2a0c43ec/lecciones/${sessionIds[0]}`
  );
  await page.waitForURL(`**/artesana/aprender/${courseId}/lecciones/${sessionIds[0]}`);
  await page.goto(`${origin}/artesana/aprender/de47675b-fd20-4fbd-b980-41dbd71a94ae`);
  await page.waitForURL(`**/artesana/aprender/${courseId}`);
  assert.equal(await page.getByRole("link", { name: /Sesión [1-4]:/ }).count(), 16);
  for (const source of curriculum.sessions) {
    await page.goto(`${origin}/artesana/aprender/${courseId}/lecciones/${source.id}`);
    await page.getByRole("heading", { name: source.title, exact: true }).waitFor();
    assert.equal(
      await page.getByRole("link", { name: /^Ampliar guía:/ }).count(),
      source.guides.length
    );
    assert.equal(
      await page
        .getByRole("button", { name: "Escuchar explicación", exact: true })
        .count(),
      1
    );
    for (const image of await page
      .locator('img[src*="module-"][src*="session-"]')
      .all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((element) => element.decode());
      assert.equal(await image.evaluate((element) => element.naturalWidth > 0), true);
    }
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    );
    if (verifyVideos && source.module !== 3 && (await page.locator("video").count()))
      await playVideos(page, source.module === 1 ? 1 : 2, false);
    if (
      (source.module === 1 && source.order === 1) ||
      (source.module === 2 && source.order === 3) ||
      (source.module === 3 && source.order === 3) ||
      (source.module === 4 && source.order === 4)
    ) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: join(screenshotDir, `warmi-curriculum-m${source.module}-mobile.png`),
        fullPage: true
      });
    }
  }
  await page.goto(
    `${origin}/artesana/aprender/${courseId}/lecciones/5a317a3f-dc5c-4000-b059-ddf8b5f9e149`
  );
  await page.getByRole("heading", { name: "¿Qué es Gmail?", exact: true }).waitFor();
  assert.equal(await page.getByRole("button", { name: /complet/i }).count(), 0);
  await page.goto(`${origin}/artesana/aprender/${courseId}`);
  if (verifyVideos) {
    for (const [index, sessionId] of sessionIds.entries()) {
      await page.goto(`${origin}/artesana/aprender/${courseId}/lecciones/${sessionId}`);
      await page.locator("video").first().waitFor();
      await playVideos(page, index === 0 ? 4 : 2, false);
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
    assert.equal(sizes.assets, 23);
    assert.equal(
      sizes.resourceBytes,
      104293181 +
        curriculum.sessions
          .filter((session) => session.module === 3)
          .flatMap((session) => session.guides)
          .reduce((sum, guide) => sum + guide.size, 0)
    );
    assert.equal(sizes.declaredBytes, sizes.resourceBytes);
    console.log(JSON.stringify({ packageSizes: sizes }));
  }
  if (process.env.WARMI_LEGACY_DOWNLOAD === "1") {
    await page.evaluate(async (fixture) => {
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
      const legacyLessons = current.lessons.slice(0, 2).map((lesson, index) => ({
        ...lesson,
        title:
          index === 0
            ? "Sesión 1: Publica tu arte en redes"
            : "Sesión 2: Llega a nuevos clientes",
        resources: lesson.resources.filter(
          (resource) => resource.file?.mimeType !== "image/webp"
        )
      }));
      const ids = new Set(
        legacyLessons
          .flatMap((lesson) => lesson.resources)
          .filter((resource) => resource.file)
          .map((resource) => resource.file.id)
      );
      const assets = Object.fromEntries(
        Object.entries(current.assets).filter(([id]) => ids.has(id))
      );
      for (const url of Object.values(assets))
        await legacyCache.put(url, await oldCache.match(url));
      await new Promise((resolve, reject) => {
        const tx = db.transaction("downloads", "readwrite");
        const store = tx.objectStore("downloads");
        const request = store.get("module:6c96bcdf-0b41-48d2-bdcd-394d06acd9d2");
        request.onsuccess = () => {
          store.put(
            {
              ...request.result,
              description: fixture.description,
              lessons: legacyLessons,
              assets,
              bytes: 104293181,
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
    }, legacyFixture);
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
  assert.equal(await page.locator("details:has(video)[open]").count(), 1);
  await page.getByText("Leer texto completo", { exact: true }).click();
  await page
    .getByText(
      process.env.WARMI_LEGACY_DOWNLOAD === "1"
        ? /Crea tu catálogo de productos/
        : /CREA UN CATÁLOGO BÁSICO/
    )
    .first()
    .waitFor();
  await page.getByText("Leer texto completo", { exact: true }).click();
  if (verifyVideos) await playVideos(page, 4, true);
  await page
    .getByRole("link", { name: "Abrir lección de apoyo", exact: true })
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
    .getByRole("link", { name: /^2\. Sesión 2: Llega a nuevos clientes/ })
    .click();
  await page
    .getByRole("heading", { name: /^Sesión 2: Llega a nuevos clientes/ })
    .waitFor();
  assert.equal(
    await page.locator("[data-offline-lesson-text]").evaluate((el) => el.open),
    false
  );
  await page.screenshot({
    path: join(screenshotDir, "warmi-offline-session-mobile.png"),
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
    path: join(screenshotDir, "warmi-module3-real-mobile.png"),
    fullPage: true
  });
  await page.setViewportSize({ width: 1365, height: 900 });
  await page.screenshot({
    path: join(screenshotDir, "warmi-module3-real-desktop.png"),
    fullPage: true
  });
  if (process.env.WARMI_LEGACY_DOWNLOAD !== "1") {
    for (const source of curriculum.sessions.filter(
      (session) => session.module === 3 && session.order >= 3
    )) {
      await page
        .getByRole("link", { name: `${source.order}. ${source.title}`, exact: true })
        .click();
      await page.getByRole("heading", { name: source.title, exact: true }).waitFor();
      assert.equal(await page.locator("video").count(), 0);
      for (const image of await page.locator('img[src^="/__warmi_offline__/"]').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element) => element.decode());
      }
      await page.getByText("Leer texto completo", { exact: true }).click();
      await page
        .getByText(source.order === 3 ? /La captura no es el pago/ : /Empaco con cuidado/)
        .first()
        .waitFor();
    }
  } else {
    assert.equal(
      await page.getByRole("link", { name: /^3\. Sesión 3:|^4\. Sesión 4:/ }).count(),
      0
    );
  }
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
  console.log(
    `PASS: real course, login, download, full browser restart offline, all 16 online sessions, current four-session or legacy two-session offline package, original support lessons, voice API, external guard, reconnect and deletion. Real MP4 online/offline: ${verifyVideos ? "6/6 PASS" : "not requested"}. No media records created by this test.`
  );
} catch (error) {
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
      .screenshot({
        path: join(screenshotDir, "warmi-module3-failure.png"),
        fullPage: true
      })
      .catch(() => undefined);
  }
  throw error;
} finally {
  await context?.close();
  await rm(profile, { recursive: true, force: true });
}
