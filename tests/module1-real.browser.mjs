import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { hash } = require("bcrypt");
const { prisma } = await import("../shared/server/db/prisma.ts");
const { LEARNING_PROGRAM, learningProgress } =
  await import("../shared/learning/program.ts");
const {
  MODULE1_ID,
  MODULE1_SESSIONS,
  MODULE1_VIDEOS,
  MODULE1_INSTITUTIONS,
  MODULE1_SUPPORT_VIDEOS
} = await import("../shared/learning/module1.ts");
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
const userId = randomUUID();
const email = `warmi-m1-${userId}@example.invalid`;
const password = `Warmi!${randomUUID()}`;
const courseHref = `${origin}/artesana/aprender/${LEARNING_PROGRAM.id}`;
const lessonHref = (id) => `${courseHref}/lecciones/${id}`;
let context;
let created = false;
const results = { mp4: [], youtube: [], institutions: [], screenshots: [] };

async function playMp4(page, mapping) {
  await page.getByText(mapping.action, { exact: true }).click();
  const video = page.locator(`video[src*="${mapping.publicId}"]`);
  await video.waitFor();
  await video.evaluate(async (element) => {
    element.muted = true;
    await element.play();
  });
  await page.waitForFunction(
    (element) => element.currentTime > 0.3 && element.videoWidth > 0,
    await video.elementHandle(),
    { timeout: 60000 }
  );
  results.mp4.push(
    await video.evaluate((element) => {
      element.pause();
      return {
        url: element.currentSrc,
        duration: element.duration,
        width: element.videoWidth
      };
    })
  );
}

async function youtube(page, key) {
  const video = MODULE1_SUPPORT_VIDEOS[key];
  await page.getByText(video.action, { exact: true }).click();
  const iframe = page.locator(`iframe[title="${video.title}"]`);
  await iframe.waitFor();
  await iframe.scrollIntoViewIfNeeded();
  assert.match(
    await iframe.getAttribute("src"),
    /^https:\/\/www.youtube-nocookie.com\/embed\//
  );
  assert.equal(await iframe.getAttribute("allowfullscreen"), "");
  const frame = await (await iframe.elementHandle()).contentFrame();
  try {
    await frame
      .locator(".ytp-large-play-button, .ytmCuedOverlayPlayButton")
      .first()
      .click({ timeout: 20000 });
    await frame.waitForFunction(
      () => {
        const element = document.querySelector("video");
        return element?.currentTime > 1 && element.videoWidth > 0;
      },
      null,
      { timeout: 45000 }
    );
    const playback = await frame.locator("video").evaluate((element) => {
      element.pause();
      return {
        currentTime: element.currentTime,
        duration: element.duration,
        width: element.videoWidth,
        height: element.videoHeight
      };
    });
    results.youtube.push({ key, url: video.url, playback });
  } catch (error) {
    const message = await frame
      .locator("body")
      .innerText()
      .catch(() => error.message);
    results.youtube.push({
      key,
      url: video.url,
      playback: "external limitation",
      message: message.slice(0, 300)
    });
    assert.equal(
      await iframe
        .locator("..")
        .getByRole("link", { name: "Abrir este video en YouTube", exact: true })
        .getAttribute("href"),
      video.url
    );
  }
}

async function layout(page, name) {
  for (const width of [320, 390, 1365]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      `${name} overflow ${width}`
    );
    if (width !== 320) {
      const path = join(tmpdir(), `warmi-m1-${name}-${width}.png`);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path, fullPage: true });
      results.screenshots.push(path);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
}

async function nextStep(page) {
  await page
    .getByRole("button", { name: "Continuar al siguiente paso", exact: true })
    .click();
  assert.equal(await page.locator("[data-learning-step]").count(), 1);
  assert.equal(await page.locator("video, iframe").count(), 0);
}

try {
  const role = await prisma.role.findUniqueOrThrow({ where: { name: "ARTESANA" } });
  await prisma.user.create({
    data: {
      id: userId,
      email,
      name: "Prueba Módulo 1",
      passwordHash: await hash(password, 10),
      profile: {
        create: {
          firstName: "Prueba",
          lastName: "Módulo 1",
          displayName: "Prueba Módulo 1"
        }
      },
      userRoles: { create: { roleId: role.id } },
      enrollments: {
        create: [
          { courseId: LEARNING_PROGRAM.id },
          { courseId: LEARNING_PROGRAM.modules[0].previousCourseId }
        ]
      }
    }
  });
  created = true;
  const module = await prisma.module.findUniqueOrThrow({
    where: { id: MODULE1_ID },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: { lessonFiles: { include: { file: true } } }
      }
    }
  });
  assert.deepEqual(
    module.lessons.map((lesson) => lesson.id),
    MODULE1_SESSIONS.map((lesson) => lesson.id)
  );
  const mp4 = module.lessons
    .flatMap((lesson) => lesson.lessonFiles)
    .filter((item) => item.type === "VIDEO_UPLOAD");
  assert.equal(mp4.length, 7);
  assert.equal(new Set(mp4.map((item) => item.fileId)).size, 7);
  assert.ok(mp4.every((item) => !item.file.publicId.includes("DUPLICADO")));
  context = await chromium
    .launch({ channel: process.env.WARMI_BROWSER_CHANNEL || "msedge", headless: true })
    .then((browser) => browser.newContext({ viewport: { width: 390, height: 844 } }));
  const page = await context.newPage();
  await page.goto(`${origin}/login`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Ingresar como artesana", exact: true }).click();
  await page.waitForURL("**/artesana/**", { timeout: 60000 });
  await page.goto(courseHref);
  await page.getByRole("link", { name: "Empezar Módulo 1", exact: true }).click();
  await page.waitForURL(`**/${MODULE1_SESSIONS[0].id}`);
  assert.equal(await page.getByText("Material adicional", { exact: true }).count(), 0);
  assert.equal(
    await page.getByRole("link", { name: "Sesión anterior", exact: true }).count(),
    0
  );
  await playMp4(page, MODULE1_VIDEOS[0]);
  await page
    .getByRole("button", { name: "Ya sé cómo crear mi cuenta", exact: true })
    .click();
  assert.equal(await page.locator("video").count(), 0);
  await playMp4(page, MODULE1_VIDEOS[1]);
  assert.equal(
    await page
      .getByRole("button", { name: "Material adicional", exact: true })
      .getAttribute("aria-expanded"),
    "false"
  );
  await page.getByText("Material adicional", { exact: true }).click();
  await playMp4(page, MODULE1_VIDEOS[2]);
  await playMp4(page, MODULE1_VIDEOS[3]);
  const pdf = await page
    .getByRole("link", { name: "Abrir guía de Gmail en PDF", exact: true })
    .getAttribute("href");
  const pdfResponse = await page.request.get(`${origin}${pdf}`);
  assert.equal(pdfResponse.status(), 200);
  assert.match(pdfResponse.headers()["content-type"], /application\/pdf/);
  await layout(page, "session1");
  await page.getByRole("button", { name: "Escuchar este paso", exact: true }).click();
  assert.equal(await page.evaluate(() => "speechSynthesis" in window), true);
  await page
    .getByRole("button", { name: "Ya sé cómo adjuntar un archivo", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Completar sesión y continuar", exact: true })
    .click();
  await page.waitForURL(`**/${MODULE1_SESSIONS[1].id}`);
  for (const item of MODULE1_INSTITUTIONS) {
    const link = page.getByRole("link", { name: item.action, exact: true });
    assert.equal(await link.getAttribute("href"), item.url);
    assert.equal(await link.getAttribute("target"), "_blank");
    const popupPromise = page.waitForEvent("popup");
    await link.click();
    const popup = await popupPromise;
    let result = "opened";
    try {
      await popup.waitForURL((url) => url.protocol === "https:", {
        waitUntil: "domcontentloaded",
        timeout: 20000
      });
    } catch {
      result = "external timeout";
    }
    results.institutions.push({ url: item.url, result });
    await popup.close();
  }
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => element.decode());
  }
  await nextStep(page);
  await playMp4(page, MODULE1_VIDEOS[4]);
  await nextStep(page);
  await youtube(page, "artesanias");
  await layout(page, "session2");
  await nextStep(page);
  await page
    .getByRole("button", { name: "Completar sesión y continuar", exact: true })
    .click();
  await page.waitForURL(`**/${MODULE1_SESSIONS[2].id}`);
  await page
    .getByRole("heading", { name: MODULE1_SESSIONS[2].title, exact: true })
    .waitFor();
  assert.equal(await page.getByRole("checkbox").count(), 6);
  await page.getByRole("checkbox").first().check();
  await nextStep(page);
  await playMp4(page, MODULE1_VIDEOS[5]);
  await nextStep(page);
  await playMp4(page, MODULE1_VIDEOS[6]);
  await nextStep(page);
  await youtube(page, "bank");
  await layout(page, "session3");
  await nextStep(page);
  await page
    .getByRole("button", { name: "Completar sesión y continuar", exact: true })
    .click();
  await page.waitForURL(`**/${MODULE1_SESSIONS[3].id}`);
  await page
    .getByRole("heading", { name: MODULE1_SESSIONS[3].title, exact: true })
    .waitFor();
  await youtube(page, "zoom");
  await nextStep(page);
  await youtube(page, "meet");
  assert.equal(
    results.youtube.filter(
      ({ playback }) =>
        typeof playback === "object" && playback.width > 0 && playback.currentTime > 1
    ).length,
    4,
    "Los cuatro tutoriales deben reproducirse, no solo cargar el iframe."
  );
  await layout(page, "session4");
  await nextStep(page);
  await page
    .getByRole("heading", { name: "Al terminar el Módulo 1, yo puedo…", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Finalizar Módulo 1", exact: true }).click();
  await page.waitForURL(courseHref);
  await page.getByText("40%", { exact: true }).waitFor();
  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: { userId_courseId: { userId, courseId: LEARNING_PROGRAM.id } },
    include: {
      courseProgress: true,
      lessonProgresses: true,
      course: { include: { modules: { include: { lessons: true } } } }
    }
  });
  assert.deepEqual(learningProgress(enrollment.course, enrollment.lessonProgresses), {
    completedLessons: 4,
    totalLessons: 10,
    percentage: 40
  });
  assert.equal(enrollment.courseProgress.percentage, 40);
  console.log(
    JSON.stringify(
      {
        ...results,
        progress: enrollment.courseProgress,
        result:
          "PASS M1 journey, 7 MP4, PDF, 4 sessions, 320/390/1365 layouts, voice API, progress and return"
      },
      null,
      2
    )
  );
  if (process.env.WARMI_TEST_MODULE3 === "1") {
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ["tests/module3-real.browser.mjs"], {
        stdio: "inherit",
        env: {
          ...process.env,
          WARMI_TEST_EMAIL: email,
          WARMI_TEST_PASSWORD: password,
          WARMI_BROWSER_CHANNEL: process.env.WARMI_BROWSER_CHANNEL || "msedge",
          WARMI_REAL_MP4: "1"
        }
      });
      child.on("error", reject);
      child.on("exit", (code) =>
        code === 0 ? resolve() : reject(new Error(`M3 regression exit ${code}`))
      );
    });
  }
} catch (error) {
  const page = context?.pages()[0];
  if (page) {
    console.error((await page.locator("body").innerText()).slice(0, 1800));
    await page
      .screenshot({ path: join(tmpdir(), "warmi-m1-failure.png"), fullPage: true })
      .catch(() => undefined);
  }
  throw error;
} finally {
  await context?.browser()?.close();
  if (created) {
    await prisma.enrollment.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    console.log("Cuenta temporal y progreso de prueba eliminados.");
  }
  await prisma.$disconnect();
}
