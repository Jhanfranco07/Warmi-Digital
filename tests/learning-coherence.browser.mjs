// Real data + real presentation components, with in-memory progress scenarios.
// Lesson GETs are blocked because the existing route records a started lesson.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { prisma } = await import("../shared/server/db/prisma.ts");
const { LEARNING_PROGRAM } = await import("../shared/learning/program.ts");
const { LearningService } = await import("../shared/services/learning.service.ts");
const { ArtisanDashboardService } =
  await import("../shared/services/artisan-dashboard.service.ts");
const { CourseRepository } = await import("../shared/repositories/course.repository.ts");
const { buildOfflineModule } =
  await import("../shared/services/offline-learning.service.ts");
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const { build } = require(
  require.resolve("esbuild", { paths: [require.resolve("tsx/package.json")] })
);
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
assert.ok(
  process.env.WARMI_TEST_EMAIL && process.env.WARMI_TEST_PASSWORD,
  "Configure the existing enrolled test account in process env."
);
const output = join(tmpdir(), "warmi-learning-coherence");
await mkdir(output, { recursive: true });
const snapshot = async () =>
  JSON.stringify(
    await prisma.course.findUniqueOrThrow({
      where: { id: LEARNING_PROGRAM.id },
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
const account = await prisma.user.findUniqueOrThrow({
  where: { email: process.env.WARMI_TEST_EMAIL }
});
const repository = new CourseRepository();
const enrollment = await repository.findEnrollmentCourse(account.id, LEARNING_PROGRAM.id);
assert.ok(enrollment);
const course = enrollment.course;
const bundle = await build({
  stdin: {
    contents: `import React from 'react';import{createRoot}from'react-dom/client';
import CoursePage from './app/(artisan)/artesana/aprender/[courseId]/page';
import LearningPage from './app/(artisan)/artesana/aprender/page';
import DashboardPage from './app/(artisan)/artesana/dashboard/page';
import{Module1Lesson}from'./features/artisan/learning/module1-lesson';
import{Module2Lesson}from'./features/artisan/learning/module2-lesson';
import{Module3Session1Content}from'./features/artisan/learning/module3-session1-content';
import{Module3JourneyLesson}from'./features/artisan/learning/module3-journey-lesson';
import{Module4Lesson}from'./features/artisan/learning/module4-lesson';
import{LearningLessonHeader}from'./features/artisan/learning/learning-lesson-header';
let root;
window.mountCoherence=async(kind,data)=>{
 window.coherenceFixture=data;
 document.querySelectorAll('body header,body nav').forEach(el=>{if(!el.closest('[data-coherence-fixture]'))el.style.visibility='hidden'});
 let host=document.querySelector('[data-coherence-fixture]');if(!host){host=document.createElement('div');host.dataset.coherenceFixture='';host.style.cssText='position:fixed;inset:0;z-index:49;overflow:auto;background:#fffaf8';document.body.appendChild(host);root=createRoot(host)};
 let content;if(kind==='course')content=await CoursePage({params:Promise.resolve({courseId:data.courseId})});
 else if(kind==='learning')content=await LearningPage();
 else if(kind==='dashboard')content=await DashboardPage();
 else if(kind==='m1')content=React.createElement(Module1Lesson,data);
 else if(kind==='m2')content=React.createElement(Module2Lesson,data);
 else if(kind==='m4')content=React.createElement(Module4Lesson,data);
 else if(kind==='journey')content=React.createElement(Module3JourneyLesson,data);
 else content=React.createElement('div',{className:'mx-auto max-w-3xl space-y-5 px-4 py-5'},React.createElement(LearningLessonHeader,{courseHref:'/artesana/aprender/'+data.courseId,moduleTitle:data.moduleTitle,title:data.title}),React.createElement(Module3Session1Content,data));
 root.render(React.createElement('div',{key:kind+':'+data.scenario,'data-audit-kind':kind,'data-audit-scenario':data.scenario},content));host.scrollTop=0;
};`,
    resolveDir: process.cwd(),
    loader: "tsx"
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
  plugins: [
    {
      name: "read-only-fixture-services",
      setup(b) {
        b.onLoad({ filter: /shared[\\/]server[\\/]auth[\\/]helpers\.ts$/ }, () => ({
          contents:
            "export async function requireRole(){return {user:{id:'fixture',name:'Artesana de prueba'}}}"
        }));
        b.onLoad({ filter: /shared[\\/]services[\\/]learning\.service\.ts$/ }, () => ({
          contents:
            "export class LearningService {async getCourseDetail(){const d=window.coherenceFixture.detail;return {...d,lessonProgress:new Map(d.lessonProgress)}} async getLearningPage(){return window.coherenceFixture.learning}}"
        }));
        b.onLoad(
          { filter: /shared[\\/]services[\\/]offline-learning\.service\.ts$/ },
          () => ({
            contents:
              "export class OfflineLearningService{async getModuleSnapshot(){return window.coherenceFixture.offline}}"
          })
        );
        b.onLoad(
          { filter: /shared[\\/]services[\\/]artisan-dashboard\.service\.ts$/ },
          () => ({
            contents:
              "export class ArtisanDashboardService {async getDashboard(){return window.coherenceFixture.dashboard} async getLearningOverview(){return {artisan:null,workshops:{upcoming:[],completed:[]},nextWorkshop:null}}}"
          })
        );
        b.onLoad(
          { filter: /shared[\\/]actions[\\/]artisan[\\/]complete-lesson\.ts$/ },
          () => ({
            contents:
              "export async function completeLessonAction(){throw new Error('Audit must never persist progress')}"
          })
        );
      }
    }
  ]
});
const browser = await chromium.launch({
  headless: true,
  channel: process.env.WARMI_BROWSER_CHANNEL || "msedge"
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
page.setDefaultTimeout(30000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await context.route("**/artesana/aprender/**/lecciones/**", (r) => r.abort());
const results = [];
async function widths(name, locator = page.locator("[data-coherence-fixture]")) {
  for (const width of [360, 390, 430, 768, 1365]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `${name} document ${width}`
    );
    assert.ok(
      await locator.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      `${name} container ${width}`
    );
    const text = await locator.innerText();
    assert.ok(
      !/(?:\b0 min\b|NaN%|undefined|1 sesiones|1 recursos|0 de 0)/.test(text),
      `${name} invalid text`
    );
    results.push({ name, width, overflow: false });
  }
  await page.setViewportSize({ width: 390, height: 844 });
}
async function mount(kind, data) {
  await page.evaluate(async ({ kind, data }) => window.mountCoherence(kind, data), {
    kind,
    data
  });
  await page
    .locator(`[data-audit-kind="${kind}"][data-audit-scenario="${data.scenario}"]`)
    .waitFor();
  await page.addStyleTag({
    content:
      "[data-coherence-fixture] .warmi-scroll-reveal{opacity:1!important;transform:none!important}"
  });
}
try {
  await page.goto(`${origin}/login`);
  await page.locator('input[name="email"]').fill(process.env.WARMI_TEST_EMAIL);
  await page.locator('input[name="password"]').fill(process.env.WARMI_TEST_PASSWORD);
  await page.getByRole("button", { name: "Ingresar como artesana", exact: true }).click();
  await page.waitForURL("**/artesana/**", { timeout: 60000 });
  await page.goto(`${origin}/artesana/dashboard`);
  await page.getByText(course.title, { exact: true }).first().waitFor();
  await widths("real-dashboard", page.locator("body"));
  await page.screenshot({ path: join(output, "dashboard-real-390.png"), fullPage: true });
  await page.goto(`${origin}/artesana/aprender`);
  await page.getByRole("heading", { name: "Mis cursos", exact: false }).first().waitFor();
  await widths("real-learning", page.locator("body"));
  await page.screenshot({
    path: join(output, "mi-aprendizaje-real-390.png"),
    fullPage: true
  });
  await page.goto(`${origin}/artesana/aprender/${course.id}`);
  await page.getByRole("heading", { name: course.title, exact: true }).waitFor();
  await widths("real-course", page.locator("body"));
  for (const module of LEARNING_PROGRAM.modules) {
    const panel = page
      .locator("section")
      .filter({
        has: page.getByRole("heading", {
          name: module.title.replace(/^Módulo \d+:\s*/, ""),
          exact: true
        })
      })
      .last();
    await panel.scrollIntoViewIfNeeded();
    await panel
      .getByRole("link", {
        name: new RegExp(`(?:Comenzar|Continuar|Repasar) Módulo ${module.order}`)
      })
      .waitFor();
    const action = panel.getByRole("link", {
      name: new RegExp(`(?:Comenzar|Continuar|Repasar) Módulo ${module.order}`)
    });
    await action.scrollIntoViewIfNeeded();
    assert.ok(
      await action.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
        );
      }),
      "CTA covered by navigation"
    );
    // Section crops hide fixed chrome only for the capture, after real hit testing.
    await panel.screenshot({
      path: join(output, `m${module.order}-overview-real-390.png`),
      style: ".sticky,.fixed{visibility:hidden!important}"
    });
  }
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  for (const scenario of ["new", "started", "partial", "completed", "course-completed"]) {
    const lessons = course.modules[2].lessons;
    const rows =
      scenario === "new"
        ? []
        : scenario === "started"
          ? [
              {
                lessonId: lessons[0].id,
                completed: false,
                startedAt: new Date(),
                progress: 10
              }
            ]
          : (scenario === "course-completed"
              ? course.modules.flatMap((m) => m.lessons)
              : lessons.slice(0, scenario === "partial" ? 2 : 4)
            ).map((l) => ({
              lessonId: l.id,
              completed: true,
              startedAt: new Date(),
              progress: 100
            }));
    const fixtureEnrollment = {
      ...enrollment,
      lastActivityAt: null,
      lessonProgresses: rows
    };
    const repo = new CourseRepository();
    repo.findEnrollmentCourse = async () => fixtureEnrollment;
    repo.findEnrolledCourseSummaries = async () => [fixtureEnrollment];
    repo.findAvailableCourseSummaries = async () => [];
    const service = new LearningService(repo);
    const detail = await service.getCourseDetail(account.id, course.id);
    const learning = await service.getLearningPage(account.id);
    const dashboard = await new ArtisanDashboardService(
      { findDashboardProfile: async () => null },
      repo,
      { getWorkshops: async () => ({ upcoming: [], completed: [] }) },
      { getOpportunities: async () => [] },
      { findByUser: async () => null },
      { findSummaryByArtisan: async () => [] },
      { findRecentSummaryForArtisan: async () => [] },
      { findRecentForUser: async () => [], countUnread: async () => 0 }
    ).getDashboard(account.id);
    const data = {
      scenario,
      courseId: course.id,
      detail: { ...detail, lessonProgress: [...detail.lessonProgress] },
      learning,
      dashboard,
      offline: buildOfflineModule(
        account.id,
        course,
        course.modules[2],
        [],
        rows.filter((r) => r.completed).map((r) => r.lessonId)
      )
    };
    await mount("course", data);
    const expected =
      scenario === "new"
        ? "Comenzar"
        : scenario.includes("completed")
          ? "Repasar"
          : "Continuar";
    await page
      .locator("[data-coherence-fixture]")
      .getByRole("link", { name: `${expected} Módulo 3`, exact: true })
      .waitFor();
    assert.ok(
      await page
        .locator("[data-coherence-fixture]")
        .getByText(
          `${scenario.includes("completed") ? 100 : scenario === "partial" ? 50 : 0}% completado`,
          { exact: true }
        )
        .count()
    );
    await widths(`course-${scenario}`);
    await page
      .locator("[data-coherence-fixture]")
      .screenshot({ path: join(output, `course-${scenario}-390.png`) });
    await mount("learning", data);
    await widths(`learning-${scenario}`);
    const root = page.locator("[data-coherence-fixture]");
    if (scenario === "course-completed")
      await root.getByRole("tab", { name: "Completados", exact: true }).click();
    await root
      .getByText(
        scenario === "new"
          ? "Comenzar"
          : scenario === "course-completed"
            ? "Repasar"
            : "Continuar",
        { exact: true }
      )
      .first()
      .waitFor();
    await page.setViewportSize({ width: 1365, height: 844 });
    await root
      .getByText(
        `${scenario === "completed" ? 1 : scenario === "course-completed" ? 4 : 0} de 4 módulos completados`,
        { exact: true }
      )
      .waitFor();
    assert.ok(!(await root.innerText()).includes("Cuenta tu historia."));
    assert.ok(!(await root.innerText()).includes("Guardiana de la Tradición"));
    await mount("dashboard", data);
    await widths(`dashboard-${scenario}`);
    await root
      .getByText(
        `${scenario === "new" ? "Comenzar" : scenario === "course-completed" ? "Repasar" : "Continuar"} curso`,
        { exact: true }
      )
      .first()
      .waitFor();
    await root.screenshot({ path: join(output, `dashboard-${scenario}-390.png`) });
  }
  for (let index = 0; index < 4; index++) {
    const module = course.modules[index],
      lesson = module.lessons[0];
    let kind = ["m1", "m2", "s1", "m4"][index];
    const data = {
      scenario: "session",
      courseId: course.id,
      lesson: { ...lesson, module },
      completed: false,
      completedIds: [],
      moduleTitle: LEARNING_PROGRAM.modules[index].title,
      title: lesson.title,
      content: lesson.content,
      nextSessionHref: `/artesana/aprender/${course.id}/lecciones/${module.lessons[1].id}`,
      resources: lesson.lessonFiles.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        fileId: r.fileId,
        mimeType: r.file?.mimeType,
        url:
          r.file?.mimeType === "application/pdf"
            ? `/api/files/${r.fileId}/preview`
            : r.file?.url,
        downloadUrl: `/api/files/${r.fileId}/preview?download=1`
      })),
      relatedResources: course.modules[2].lessons[1].lessonFiles
        .filter((r) => r.file?.mimeType === "video/mp4")
        .map((r) => ({
          id: r.id,
          title: r.title,
          mimeType: r.file.mimeType,
          url: r.file.url
        }))
    };
    await mount(kind, data);
    await page.locator("[data-coherence-fixture] h1").waitFor();
    await widths(`m${index + 1}-session1`);
    const fixture = page.locator("[data-coherence-fixture]");
    for (const img of await fixture.locator("img").all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((el) => el.decode());
      assert.ok(await img.evaluate((el) => el.naturalWidth > 0));
    }
    if (index === 3) assert.equal(await fixture.locator("[data-m4-image]").count(), 3);
    await fixture.evaluate((el) => (el.scrollTop = 0));
    await page
      .locator("[data-coherence-fixture]")
      .screenshot({ path: join(output, `m${index + 1}-session1-390.png`) });
    const links = await page
      .locator('[data-coherence-fixture] a[href*="/lecciones/"]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")));
    for (const link of links)
      assert.ok(
        course.modules.flatMap((m) => m.lessons).some((l) => link.endsWith("/" + l.id)),
        "Unknown session navigation"
      );
  }
  for (const index of [2, 3]) {
    const module = course.modules[index],
      lesson = module.lessons[3];
    const data = {
      scenario: "closing",
      courseId: course.id,
      lesson: { ...lesson, module },
      completedIds: module.lessons.map((l) => l.id)
    };
    await mount(index === 2 ? "journey" : "m4", data);
    const root = page.locator("[data-coherence-fixture]");
    assert.equal(
      await root.locator(`nav[aria-label="Sesiones del Módulo ${index + 1}"] a`).count(),
      4
    );
    for (let step = 0; step < 3; step++)
      await root.getByRole("button", { name: "Continuar", exact: true }).click();
    await root.getByRole("button", { name: "Finalizar práctica", exact: true }).click();
    await root
      .getByRole("link", { name: `Finalizar Módulo ${index + 1}`, exact: true })
      .waitFor();
    assert.ok((await root.innerText()).includes("100% completado"));
    assert.ok(!(await root.innerText()).includes("Sesión 5"));
    await widths(`m${index + 1}-closing`);
    await root.screenshot({ path: join(output, `m${index + 1}-closing-390.png`) });
  }
  assert.deepEqual(errors, [], "Browser runtime errors");
  assert.equal(
    await snapshot(),
    before,
    "Audit must preserve all course, lesson, file and enrollment progress records"
  );
  await writeFile(
    join(output, "browser-report.json"),
    JSON.stringify(
      {
        checks: results.length,
        widths: [360, 390, 430, 768, 1365],
        scenarios: ["new", "started", "partial", "completed", "course-completed"],
        databaseUnchanged: true,
        runtimeErrors: errors,
        results
      },
      null,
      2
    )
  );
  console.log(
    `PASS: ${results.length} responsive views; four modules and progress scenarios; DB unchanged. ${output}`
  );
} finally {
  await browser.close();
  await prisma.$disconnect();
}
