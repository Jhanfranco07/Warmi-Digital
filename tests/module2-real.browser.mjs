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
const { LEARNING_PROGRAM } = await import("../shared/learning/program.ts");
const {
  MODULE2_ID,
  MODULE2_SESSIONS,
  MODULE2_VIDEOS,
  MODULE2_PRODUCT,
  MODULE2_QUESTIONS
} = await import("../shared/learning/module2.ts");
const userId = randomUUID();
const email = `warmi-m2-${userId}@example.invalid`;
const password = `Warmi!${randomUUID()}`;
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
const href = `${origin}/artesana/aprender/${LEARNING_PROGRAM.id}`;
let browser;
let created = false;
const played = [];
const shots = [];
const protectedSnapshot = async () =>
  JSON.stringify(
    await prisma.module.findMany({
      where: {
        id: { in: [LEARNING_PROGRAM.modules[0].id, LEARNING_PROGRAM.modules[2].id] }
      },
      orderBy: { id: "asc" },
      include: {
        lessons: {
          orderBy: { id: "asc" },
          include: { lessonFiles: { orderBy: { id: "asc" }, include: { file: true } } }
        }
      }
    })
  );
const before = await protectedSnapshot();
try {
  const role = await prisma.role.findUniqueOrThrow({ where: { name: "ARTESANA" } });
  await prisma.user.create({
    data: {
      id: userId,
      email,
      name: "Prueba Módulo 2",
      passwordHash: await hash(password, 10),
      profile: {
        create: {
          firstName: "Prueba",
          lastName: "Módulo 2",
          displayName: "Prueba Módulo 2"
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
    where: { id: MODULE2_ID },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: { lessonFiles: { include: { file: true } } }
      }
    }
  });
  assert.deepEqual(
    module.lessons.map((item) => [item.id, item.order]),
    MODULE2_SESSIONS.map((item) => [item.id, item.order])
  );
  const links = module.lessons.flatMap((item) => item.lessonFiles);
  assert.equal(links.length, 4);
  assert.equal(new Set(links.map((item) => item.fileId)).size, 4);
  for (const link of links)
    assert.equal(
      await prisma.file.count({
        where: {
          OR: [
            { publicId: link.file.publicId, provider: "cloudinary" },
            { url: link.file.url }
          ]
        }
      }),
      1
    );
  browser = await chromium.launch({
    channel: process.env.WARMI_BROWSER_CHANNEL || "msedge",
    headless: true
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${origin}/login`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Ingresar como artesana", exact: true }).click();
  await page.waitForURL("**/artesana/**", { timeout: 60000 });
  await page.goto(href);
  assert.equal(
    await page
      .getByRole("button", { name: "Descargar para usar sin internet", exact: true })
      .count(),
    1
  );
  await page.getByRole("link", { name: "Empezar Módulo 2", exact: true }).click();
  for (const session of MODULE2_SESSIONS) {
    await page.waitForURL(`**/${session.id}`);
    await page.getByRole("heading", { name: session.title, exact: true }).waitFor();
    if (session.order === 1) {
      await page
        .getByRole("button", { name: "Conocer los concursos", exact: true })
        .click();
      await page
        .getByRole("heading", { name: "¿Qué es un concurso?", exact: true })
        .waitFor();
      await page.getByRole("button", { name: "Paso anterior", exact: true }).click();
      await page.getByRole("button", { name: "Paso anterior", exact: true }).click();
    }
    for (const [index, step] of session.steps.entries()) {
      await page.getByRole("heading", { name: step.title, exact: true }).waitFor();
      assert.equal(await page.locator("[data-learning-step]").count(), 1);
      assert.equal(await page.locator("video, iframe").count(), 0);
      assert.equal(
        await page
          .getByRole("button", { name: /Completar sesión|Finalizar Módulo/ })
          .count(),
        0
      );
      if (step.kind === "questions") {
        for (const [i, question] of MODULE2_QUESTIONS.entries()) {
          const button = page.getByRole("button", {
            name: `${i + 1}. ${question.title}`,
            exact: true
          });
          assert.equal(await button.getAttribute("aria-expanded"), "false");
          await button.click();
          await page.getByText(question.text, { exact: true }).waitFor();
          await button.click();
        }
      }
      if (step.kind === "checklist" || step.kind === "form")
        await page.getByRole("checkbox").first().check();
      if (step.kind === "choice") {
        await page
          .getByRole("button", { name: "Quiero vender directamente", exact: true })
          .click();
        await page
          .getByRole("status")
          .filter({ hasText: "Puedes mostrar tus piezas" })
          .waitFor();
      }
      if (step.kind === "product") {
        for (const field of MODULE2_PRODUCT)
          await page.locator("dd").filter({ hasText: field.value }).waitFor();
        await page
          .getByRole("button", { name: "¿Cómo calcularlo?", exact: true })
          .click();
        await page.getByText(MODULE2_PRODUCT[4].help, { exact: true }).waitFor();
      }
      const play = async (key) => {
        const mapping = MODULE2_VIDEOS.find((item) => item.key === key);
        await page.getByText(mapping.action, { exact: true }).click();
        const video = page.locator("video");
        await video.waitFor();
        await video.evaluate(async (v) => {
          v.muted = true;
          await v.play();
        });
        await page.waitForFunction(
          (v) => v.currentTime > 1 && v.videoWidth > 0,
          await video.elementHandle(),
          { timeout: 60000 }
        );
        played.push(
          await video.evaluate((v) => {
            v.pause();
            return { src: v.currentSrc, duration: v.duration, width: v.videoWidth };
          })
        );
      };
      if (step.videoKey) await play(step.videoKey);
      if (step.kind === "pdf") {
        const additional = page.getByRole("button", {
          name: "Material adicional",
          exact: true
        });
        assert.equal(await additional.getAttribute("aria-expanded"), "false");
        await additional.click();
        await play("M2-S3-01");
        assert.equal(await page.locator("details[name=learning-video][open]").count(), 1);
        await additional.click();
      }
      await page.getByRole("button", { name: "Escuchar este paso", exact: true }).click();
      assert.equal(await page.evaluate(() => "speechSynthesis" in window), true);
      for (const width of [320, 390, 1365]) {
        await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          true,
          `overflow S${session.order} P${index + 1} ${width}`
        );
        if (index === 0 || step.kind === "product" || step.kind === "pdf") {
          await page.evaluate(() => scrollTo(0, 0));
          const path = join(
            tmpdir(),
            `warmi-m2-s${session.order}-p${index + 1}-${width}.png`
          );
          await page.screenshot({ path, fullPage: true });
          shots.push(path);
        }
      }
      await page.setViewportSize({ width: 390, height: 844 });
      const next = page.getByRole("button", {
        name: "Continuar al siguiente paso",
        exact: true
      });
      await next.evaluate((element) => element.scrollIntoView({ block: "nearest" }));
      const box = await next.boundingBox();
      assert.ok(
        box.height >= 44 && box.y + box.height < 844 - 80,
        "CTA must not be under the bottom navigation"
      );
      await next.click();
    }
    await page.getByText("Sesión lista", { exact: true }).waitFor();
    await page
      .getByRole("button", {
        name: session.order === 4 ? "Finalizar Módulo 2" : "Completar sesión y continuar",
        exact: true
      })
      .click();
  }
  await page.waitForURL(href);
  await page.getByText("40%", { exact: true }).waitFor();
  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: { userId_courseId: { userId, courseId: LEARNING_PROGRAM.id } },
    include: { courseProgress: true }
  });
  assert.equal(enrollment.courseProgress.totalLessons, 10);
  assert.equal(enrollment.courseProgress.completedLessons, 4);
  assert.equal(enrollment.courseProgress.percentage, 40);
  assert.equal(before, await protectedSnapshot());
  console.log(
    JSON.stringify(
      {
        result:
          "PASS M2: 4 sessions, 17 steps, 4 real MP4, single active block, disclosure, decision, checklist, forms, speech API, responsive 320/390/1365, progress 40%, return and M1/M3 DB unchanged",
        played,
        shots
      },
      null,
      2
    )
  );
  if (process.env.WARMI_TEST_MODULE3 === "1")
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ["tests/module3-real.browser.mjs"], {
        stdio: "inherit",
        env: {
          ...process.env,
          WARMI_TEST_EMAIL: email,
          WARMI_TEST_PASSWORD: password,
          WARMI_BROWSER_CHANNEL: process.env.WARMI_BROWSER_CHANNEL || "msedge",
          WARMI_REAL_MP4: "1",
          WARMI_LEGACY_DOWNLOAD: "1"
        }
      });
      child.on("error", reject);
      child.on("exit", (code) =>
        code === 0 ? resolve() : reject(new Error(`M3 regression exit ${code}`))
      );
    });
} catch (error) {
  for (const page of browser?.contexts()[0]?.pages() ?? []) {
    console.error((await page.locator("body").innerText()).slice(0, 1800));
    await page
      .screenshot({ path: join(tmpdir(), "warmi-m2-failure.png"), fullPage: true })
      .catch(() => undefined);
  }
  throw error;
} finally {
  await browser?.close();
  if (created) {
    await prisma.enrollment.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    console.log("Cuenta y progreso temporal M2 eliminados.");
  }
  await prisma.$disconnect();
}
