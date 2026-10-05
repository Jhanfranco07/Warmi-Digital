import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
const courseId = "3889134e-620b-40db-98cf-8f6b2a0c43ec";
const title = "Módulo 3: Herramientas digitales para vender";
const email = process.env.WARMI_TEST_EMAIL;
const password = process.env.WARMI_TEST_PASSWORD;
if (!email || !password)
  throw new Error(
    "Define WARMI_TEST_EMAIL y WARMI_TEST_PASSWORD para la cuenta de prueba."
  );
const profile = await mkdtemp(join(tmpdir(), "warmi-real-module3-"));
const verifyVideos = process.env.WARMI_REAL_MP4 === "1";
const sessionIds = [
  "8a8e449b-76a6-4a6d-9693-6238f75092bc",
  "9bd401d6-5c80-4099-aa7b-e1b90b62d9b7"
];
async function playVideos(page, count, offline) {
  assert.equal(await page.locator("video").count(), count);
  const played = [];
  for (let index = 0; index < count; index++) {
    const video = page.locator("video").nth(index);
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
  await page.goto(`${origin}/artesana/aprender/${courseId}`);
  await page.getByRole("heading", { name: title, exact: true }).waitFor();
  await page.getByText("Módulo 3", { exact: true }).waitFor();
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
          .get("module3");
        request.onsuccess = () => resolve(request.result);
        request.onerror = reject;
      });
      db.close();
      let resourceBytes = 0;
      let shellBytes = 0;
      for (const name of await caches.keys()) {
        if (
          !name.startsWith("warmi-module3-") &&
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
    assert.equal(sizes.assets, 6);
    assert.equal(sizes.resourceBytes, 104293181);
    assert.equal(sizes.declaredBytes, sizes.resourceBytes);
    console.log(JSON.stringify({ packageSizes: sizes }));
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
  await page
    .getByText(/Crea tu catálogo de productos/)
    .first()
    .waitFor();
  if (verifyVideos) await playVideos(page, 4, true);
  await page
    .getByRole("link", { name: "Abrir lección de apoyo", exact: true })
    .first()
    .click();
  await page
    .getByRole("heading", { name: "¿Qué es WhatsApp Business?", exact: true })
    .waitFor();
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
      (await caches.keys()).filter((name) => name.startsWith("warmi-module3-"))
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
        const request = db
          .transaction("downloads")
          .objectStore("downloads")
          .get("module3");
        request.onsuccess = () => resolve(request.result);
        request.onerror = reject;
      });
      db.close();
      return Boolean(saved);
    }),
    false
  );
  console.log(
    `PASS: real course, login, download, full browser restart offline, both sessions, original support lessons, voice API, external guard, reconnect and deletion. Real MP4 online/offline: ${verifyVideos ? "6/6 PASS" : "not requested"}. No media records created by this test.`
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
      .screenshot({ path: join(tmpdir(), "warmi-module3-failure.png"), fullPage: true })
      .catch(() => undefined);
  }
  throw error;
} finally {
  await context?.close();
  await rm(profile, { recursive: true, force: true });
}
