import { navigateDownloadedLearning } from "./offline-navigation.browser.mjs";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { prisma } = await import("../shared/server/db/prisma.ts");
const { LEARNING_PROGRAM } = await import("../shared/learning/program.ts");
const { MODULE4_ID, MODULE4_SESSIONS } = await import("../shared/learning/module4.ts");
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { hash } = require("bcrypt");
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100",
  courseId = LEARNING_PROGRAM.id,
  courseHref = `${origin}/artesana/aprender/${courseId}`;
const userId = randomUUID(),
  email = `warmi-m4-browser-${userId}@example.invalid`,
  password = `Warmi!${randomUUID()}`;
const output = join(tmpdir(), "warmi-m4");
await mkdir(output, { recursive: true });
const profile = await mkdtemp(join(tmpdir(), "warmi-m4-browser-"));
let context,
  created = false;
const seenImages = new Set();
async function snapshot() {
  return JSON.stringify({
    modules: await prisma.module.findMany({
      where: { courseId, id: { not: MODULE4_ID } },
      orderBy: { id: "asc" },
      include: {
        lessons: {
          orderBy: { id: "asc" },
          include: { lessonFiles: { orderBy: { id: "asc" }, include: { file: true } } }
        }
      }
    }),
    progress: await prisma.lessonProgress.findMany({
      where: { enrollment: { courseId, userId: { not: userId } } },
      orderBy: { id: "asc" }
    })
  });
}
const before = await snapshot();
async function open(offline = false) {
  context = await chromium.launchPersistentContext(profile, {
    headless: true,
    channel: process.env.WARMI_BROWSER_CHANNEL || "msedge",
    viewport: { width: 390, height: 844 },
    offline
  });
  const page = context.pages()[0] || (await context.newPage());
  page.setDefaultTimeout(60000);
  return page;
}
async function lesson(page, order) {
  await navigateDownloadedLearning(
    page,
    `${courseHref}/lecciones/${MODULE4_SESSIONS[order - 1].id}`
  );
  await page.locator(`[data-module4-session][data-session-order="${order}"]`).waitFor();
}
async function next(page) {
  await page
    .locator("[data-module4-session]")
    .getByRole("button", { name: "Continuar", exact: true })
    .click();
}
async function photos(page) {
  for (const image of await page.locator("[data-m4-image]").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async (el) => {
      await el.decode();
      if (!el.naturalWidth) throw new Error("Photo failed");
    });
    seenImages.add(await image.getAttribute("data-m4-image"));
  }
}
async function touch(page, button) {
  await button.scrollIntoViewIfNeeded();
  assert.equal(
    await button.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.height >= 48 &&
        el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
      );
    }),
    true
  );
}

try {
  const role = await prisma.role.findUniqueOrThrow({ where: { name: "ARTESANA" } });
  await prisma.user.create({
    data: {
      id: userId,
      email,
      name: "Prueba M4",
      passwordHash: await hash(password, 10),
      profile: {
        create: { firstName: "Prueba", lastName: "M4", displayName: "Prueba M4" }
      },
      userRoles: { create: { roleId: role.id } },
      enrollments: { create: { courseId, status: "ACTIVE" } }
    }
  });
  created = true;
  const learningModule = await prisma.module.findUniqueOrThrow({
    where: { id: MODULE4_ID },
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
    MODULE4_SESSIONS.map((s) => s.id)
  );
  const files = [
    ...new Map(
      learningModule.lessons.flatMap((l) => l.lessonFiles).map((r) => [r.file.id, r.file])
    ).values()
  ];
  assert.equal(files.length, 9);
  let page = await open();
  const anon = await page.request.get(
    `${origin}/api/learning/offline/${courseId}/files/${files[0].id}`,
    { maxRedirects: 0 }
  );
  assert.notEqual(anon.status(), 200);
  await page.goto(`${origin}/login`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Ingresar como artesana", exact: true }).click();
  await page.waitForURL("**/artesana/**");
  await lesson(page, 4);
  for (let i = 0; i < 3; i++) await next(page);
  await page.getByRole("button", { name: "Finalizar práctica", exact: true }).click();
  await page.getByText("Módulo 4: 25% completado.", { exact: true }).waitFor();
  for (let order = 1; order <= 4; order++) {
    await lesson(page, order);
    const steps = order === 1 ? 3 : order === 2 || order === 3 ? 2 : 4;
    for (let step = 0; step < steps; step++) {
      await page.getByText(`Paso ${step + 1} de ${steps}`, { exact: true }).waitFor();
      assert.equal(await page.locator("[data-m4-step]").count(), 1);
      await photos(page);
      if (order === 3 && step === 0) {
        const disclosure = page.getByRole("button", {
          name: "Ver el documento de apoyo",
          exact: true
        });
        await disclosure.click();
        await photos(page);
        await disclosure.click();
      }
      if (step === 0 || (order === 2 && step === 1))
        for (const width of [360, 390, 430, 768, 1365]) {
          await page.setViewportSize({ width, height: 900 });
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            true
          );
          const button = page.locator("[data-module4-session]").getByRole("button", {
            name:
              step < steps - 1
                ? "Continuar"
                : order === 4
                  ? "Finalizar práctica"
                  : "Completar sesión y continuar",
            exact: true
          });
          await touch(page, button);
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({
            path: join(output, `m4-s${order}-step${step + 1}-${width}-viewport.png`)
          });
          await page.screenshot({
            path: join(output, `m4-s${order}-step${step + 1}-${width}.png`),
            fullPage: true
          });
        }
      await page.setViewportSize({ width: 390, height: 844 });
      if (step < steps - 1) await next(page);
    }
    if (order < 4) {
      await page
        .getByRole("button", { name: "Completar sesión y continuar", exact: true })
        .click();
      await page.waitForURL(`**/${MODULE4_SESSIONS[order].id}`);
    } else {
      await page.getByRole("button", { name: "Finalizar práctica", exact: true }).click();
      await page.getByText("Módulo 4: 100% completado.", { exact: true }).waitFor();
      await photos(page);
      await touch(
        page,
        page.getByRole("link", { name: "Finalizar Módulo 4", exact: true })
      );
      await page.screenshot({
        path: join(output, "m4-closing-online.png"),
        fullPage: true
      });
    }
  }
  assert.equal(seenImages.size, 9);
  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: { userId_courseId: { userId, courseId } },
    include: { lessonProgresses: true, courseProgress: true }
  });
  assert.equal(enrollment.lessonProgresses.filter((p) => p.completed).length, 4);
  assert.equal(enrollment.courseProgress.totalLessons, 16);
  assert.equal(enrollment.courseProgress.percentage, 25);
  console.log(
    "PASS online: all four sessions, nine source images, partial/final closing, saved progress 4/16, responsive 360/390/430/tablet/desktop and uncovered touch targets."
  );
  await page.getByRole("link", { name: "Finalizar Módulo 4", exact: true }).click();
  await page.waitForURL(courseHref);
  assert.equal(await page.locator(`#modulo-${MODULE4_ID}`).count(), 0);
  assert.equal(
    await page
      .getByRole("button", { name: "Descargar para usar sin internet", exact: true })
      .count(),
    1
  );
  assert.equal(await snapshot(), before);
  await writeFile(
    join(output, "browser-result.json"),
    JSON.stringify(
      {
        passed: true,
        assets: 9,
        sourceImages: [...seenImages],
        protected: true,
        offline: false
      },
      null,
      2
    )
  );
  console.log(
    "PASS capability: M4 remains online with no download control; only M3 is downloadable."
  );
} catch (error) {
  const page = context?.pages()[0];
  if (page) {
    console.error(
      await page
        .evaluate(() => ({
          url: location.href,
          text: document.body.innerText.slice(-2200),
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
    resolve(profile).startsWith(join(resolve(tmpdir()), "warmi-m4-browser-")),
    true
  );
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 });
}
