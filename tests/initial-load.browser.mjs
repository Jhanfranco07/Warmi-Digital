import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { hash } = require("bcrypt");
const phase = process.argv[2] ?? "local";
if (!/^[a-z-]+$/.test(phase)) throw new Error("Invalid benchmark label");
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
const userId = randomUUID(),
  password = `Warmi!${randomUUID()}`,
  email = `warmi-perf-${userId}@example.invalid`;
const outsiderId = randomUUID();
const courseId = "93dc7355-d746-4acd-87df-29f71d16a955";
const lessonId = "8a8e449b-76a6-4a6d-9693-6238f75092bc";
const output = join(tmpdir(), `warmi-initial-${phase}`);
await mkdir(output, { recursive: true });
let browser,
  created = false,
  outsiderCreated = false;
const results = [];
try {
  const role = await db.role.findUniqueOrThrow({ where: { name: "ARTESANA" } });
  await db.user.create({
    data: {
      id: userId,
      email,
      name: "Prueba Rendimiento",
      passwordHash: await hash(password, 10),
      profile: {
        create: {
          firstName: "Prueba",
          lastName: "Rendimiento",
          displayName: "Prueba Rendimiento"
        }
      },
      userRoles: { create: { roleId: role.id } },
      enrollments: { create: { courseId, status: "ACTIVE" } }
    }
  });
  created = true;
  browser = await chromium.launch({
    headless: true,
    args: ["--disable-gpu"],
    channel: process.env.WARMI_BROWSER_CHANNEL || "msedge"
  });
  for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    page.setDefaultTimeout(120000);
    const consoleErrors = [];
    page.on("pageerror", (error) => consoleErrors.push(error.name));
    await page.addInitScript(() => {
      window.perfLcp = 0;
      new PerformanceObserver((list) => {
        window.perfLcp = list.getEntries().at(-1)?.startTime ?? 0;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    await page.goto(`${origin}/login`, { waitUntil: "domcontentloaded" });
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    const started = performance.now();
    await page
      .getByRole("button", { name: "Ingresar como artesana", exact: true })
      .click();
    await page.waitForURL("**/artesana/dashboard");
    await page.getByRole("heading", { name: /Bienvenida, Prueba/ }).waitFor();
    await page.getByText("Continúa aprendiendo", { exact: true }).waitFor();
    results.push({
      stage: "login_to_dashboard",
      run,
      readyMs: Math.round(performance.now() - started)
    });
    await page.screenshot({
      path: join(output, `dashboard-${run}.png`),
      fullPage: false
    });
    // A fresh browser context preserves only the test session, not browser caches.
    const state = await context.storageState();
    const lessonContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      storageState: state
    });
    const lessonPage = await lessonContext.newPage();
    lessonPage.setDefaultTimeout(120000);
    await lessonPage.addInitScript(() => {
      window.perfLcp = 0;
      new PerformanceObserver((list) => {
        window.perfLcp = list.getEntries().at(-1)?.startTime ?? 0;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    const startLesson = performance.now();
    await lessonPage.goto(
      `${origin}/artesana/aprender/${courseId}/lecciones/${lessonId}`,
      { waitUntil: "domcontentloaded" }
    );
    await lessonPage.locator("[data-module3-session1]:visible").waitFor();
    await lessonPage.getByRole("button", { name: "Temas", exact: true }).click();
    await lessonPage.getByRole("dialog").waitFor();
    const readyMs = Math.round(performance.now() - startLesson);
    const timing = await lessonPage.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const resources = performance.getEntriesByType("resource");
      const js = resources.filter((entry) =>
        new URL(entry.name).pathname.endsWith(".js")
      );
      return {
        ttfbMs: Math.round(navigation.responseStart - navigation.requestStart),
        documentEndMs: Math.round(navigation.responseEnd),
        lcpMs: Math.round(window.perfLcp),
        jsRequests: js.length,
        jsBytes: js.reduce((sum, entry) => sum + entry.encodedBodySize, 0),
        mediaRequests: resources.filter((entry) => /\.(mp4|pdf)(\?|$)/.test(entry.name))
          .length
      };
    });
    results.push({ stage: "first_lesson", run, readyMs, ...timing });
    assert.equal(await lessonPage.locator("[data-module3-session1]:visible").count(), 1);
    assert.deepEqual(consoleErrors, []);
    await lessonPage
      .getByRole("dialog")
      .getByRole("button", { name: "Crear un catálogo básico", exact: true })
      .click();
    await lessonPage.screenshot({
      path: join(output, `lesson-${run}.png`),
      fullPage: false
    });
    await lessonContext.close();
    await context.close();
    console.log(JSON.stringify(results.slice(-2)));
  }
  await writeFile(join(output, "metrics.json"), JSON.stringify(results, null, 2));
  await db.user.create({
    data: {
      id: outsiderId,
      email: `warmi-perf-${outsiderId}@example.invalid`,
      name: "Sin Acceso",
      passwordHash: await hash(password, 10),
      profile: {
        create: { firstName: "Sin", lastName: "Acceso", displayName: "Sin Acceso" }
      },
      userRoles: { create: { roleId: role.id } }
    }
  });
  outsiderCreated = true;
  const outsiderContext = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const outsiderPage = await outsiderContext.newPage();
  outsiderPage.setDefaultTimeout(120000);
  await outsiderPage.goto(`${origin}/login`);
  await outsiderPage
    .locator('input[name="email"]')
    .fill(`warmi-perf-${outsiderId}@example.invalid`);
  await outsiderPage.locator('input[name="password"]').fill(password);
  await outsiderPage
    .getByRole("button", { name: "Ingresar como artesana", exact: true })
    .click();
  await outsiderPage.waitForURL("**/artesana/dashboard");
  await outsiderPage.getByRole("heading", { name: /Bienvenida, Sin/ }).waitFor();
  const denied = await outsiderContext.request.get(
    `${origin}/artesana/aprender/${courseId}/lecciones/${lessonId}`
  );
  const deniedBody = await denied.text();
  assert.ok(
    denied.status() === 404 || (denied.status() === 200 && deniedBody.includes("404"))
  );
  assert.ok(!deniedBody.includes('data-module3-session1="true"'));
  await outsiderContext.close();
  const guestContext = await browser.newContext();
  const guestResponse = await guestContext.request.get(
    `${origin}/artesana/aprender/${courseId}/lecciones/${lessonId}`,
    { maxRedirects: 0 }
  );
  assert.ok([302, 303, 307, 308].includes(guestResponse.status()));
  assert.equal(new URL(guestResponse.headers().location).pathname, "/login");
  await guestContext.close();
  console.log(
    "PASS: another authenticated account sees its own identity and cannot open an unenrolled lesson; anonymous access requires login."
  );
  const completed = await db.lessonProgress.count({
    where: { enrollment: { userId }, completed: true }
  });
  assert.equal(completed, 0, "Profiling must not complete any lesson");
  console.log(
    `PASS: real login and interactive first lesson in 3 fresh browser contexts. Metrics/screenshots: ${output}. Temporary account cleaned below; no passwords/tokens saved.`
  );
} finally {
  await browser?.close();
  try {
    if (created) {
      await db.enrollment.deleteMany({ where: { userId } });
      await db.user.delete({ where: { id: userId } });
      assert.equal(await db.user.count({ where: { id: userId } }), 0);
      console.log("Temporary performance account and its enrollment/progress deleted.");
    }
    if (outsiderCreated) {
      await db.user.delete({ where: { id: outsiderId } });
      assert.equal(await db.user.count({ where: { id: outsiderId } }), 0);
      console.log("Temporary permission-test account deleted.");
    }
  } finally {
    await db.$disconnect();
  }
}
