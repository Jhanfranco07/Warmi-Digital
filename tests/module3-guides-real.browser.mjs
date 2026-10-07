import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { hash } = require("bcrypt");
const { prisma } = await import("../shared/server/db/prisma.ts");
const { LEARNING_PROGRAM } = await import("../shared/learning/program.ts");
const { MODULE3_SESSION1_ID, MODULE3_SESSION1_TOPICS, module3GuidePublicId } =
  await import("../shared/learning/module3-session1.ts");
const userId = randomUUID();
let created = false;
const email = `warmi-m3-guides-${userId}@example.invalid`;
const password = `Warmi!${randomUUID()}`;
const snapshot = async () =>
  JSON.stringify(
    await prisma.module.findMany({
      where: { courseId: LEARNING_PROGRAM.id },
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
try {
  const manifest = JSON.parse(
    await readFile("output/pdf/module3-session1/manifest.json", "utf8")
  );
  const guides = await prisma.lessonFile.findMany({
    where: { lessonId: MODULE3_SESSION1_ID, type: "PDF" },
    orderBy: { position: "asc" },
    include: { file: true }
  });
  assert.equal(guides.length, 7);
  for (const [index, guide] of guides.entries()) {
    const publicId = module3GuidePublicId(MODULE3_SESSION1_TOPICS[index].key);
    assert.equal(guide.externalId, publicId);
    assert.equal(guide.position, index + 10);
    assert.equal(guide.title, MODULE3_SESSION1_TOPICS[index].guideTitle);
    assert.equal(guide.file.publicId, publicId);
    assert.equal(guide.originalUrl, guide.file.url);
    assert.equal(guide.file.mimeType, "application/pdf");
    assert.equal(guide.file.size, manifest[index].bytes);
    assert.equal(
      await prisma.file.count({
        where: { OR: [{ publicId }, { url: guide.file.url }] }
      }),
      1
    );
    assert.equal(
      await prisma.lessonFile.count({
        where: {
          lessonId: MODULE3_SESSION1_ID,
          OR: [{ fileId: guide.fileId }, { externalId: publicId }, { title: guide.title }]
        }
      }),
      1
    );
  }
  const positions = await prisma.lessonFile.findMany({
    where: { lessonId: MODULE3_SESSION1_ID },
    select: { position: true }
  });
  assert.equal(new Set(positions.map((item) => item.position)).size, positions.length);
  const videoFixtures = [
    [
      "af430a8c-97fc-4557-a191-5706b5ebef2d",
      "ec24466c-9be8-4705-b42c-1243b6c75a4e",
      MODULE3_SESSION1_ID,
      2
    ],
    [
      "af15d63f-32b3-449e-92a5-5179e678d487",
      "b66accc4-ec68-419e-8a9a-3e86cc1b4ca2",
      MODULE3_SESSION1_ID,
      3
    ],
    [
      "0ac3afdd-5a77-4bca-9cb9-425d44b47bd8",
      "47979adf-99ef-4f97-adec-47b011ce6250",
      MODULE3_SESSION1_ID,
      4
    ],
    [
      "dfa3fa09-435f-45f0-9af2-399285e875a8",
      "eaddda21-2adc-4169-a452-55f0556a65d5",
      MODULE3_SESSION1_ID,
      5
    ],
    [
      "ecb96475-8fdd-4e3c-9899-c5e2bc0cc0b6",
      "9882194e-8dad-4b45-b8ba-c6936375e08e",
      "9bd401d6-5c80-4099-aa7b-e1b90b62d9b7",
      2
    ],
    [
      "4171b83c-da65-4d47-8bee-3bd71d48fbe3",
      "bbacb861-cfc6-4c6c-b830-e55b68a747f6",
      "9bd401d6-5c80-4099-aa7b-e1b90b62d9b7",
      3
    ]
  ];
  for (const [id, fileId, lessonId, position] of videoFixtures) {
    const link = await prisma.lessonFile.findUniqueOrThrow({
      where: { id },
      include: { file: true }
    });
    assert.equal(link.fileId, fileId);
    assert.equal(link.lessonId, lessonId);
    assert.equal(link.position, position);
    assert.equal(link.file.mimeType, "video/mp4");
    assert.equal(link.file.provider, "cloudinary");
  }
  console.log(
    "PASS: exactly 7 guides, zero File/LessonFile duplicates, unique positions and six original video IDs/relations."
  );
  const role = await prisma.role.findUniqueOrThrow({ where: { name: "ARTESANA" } });
  await prisma.user.create({
    data: {
      id: userId,
      email,
      name: "Prueba guías M3",
      passwordHash: await hash(password, 10),
      profile: {
        create: {
          firstName: "Prueba",
          lastName: "Guías M3",
          displayName: "Prueba guías M3"
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
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["tests/module3-real.browser.mjs"], {
      stdio: "inherit",
      env: {
        ...process.env,
        WARMI_TEST_EMAIL: email,
        WARMI_TEST_PASSWORD: password,
        WARMI_BROWSER_CHANNEL: process.env.WARMI_BROWSER_CHANNEL || "msedge",
        WARMI_HEADED: process.env.WARMI_HEADED ?? "1",
        WARMI_REAL_MP4: "1",
        WARMI_REAL_GUIDES: process.env.WARMI_REAL_GUIDES ?? "1",
        WARMI_LEGACY_DOWNLOAD: process.env.WARMI_LEGACY_DOWNLOAD ?? "0"
      }
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`M3 browser exit ${code}`))
    );
  });
  assert.equal(before, await snapshot());
  console.log(
    "PASS: snapshots Course/Module/Lesson/File/LessonFile no modificados por las pruebas."
  );
} finally {
  if (created) {
    await prisma.enrollment.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  }
  await prisma.$disconnect();
}
