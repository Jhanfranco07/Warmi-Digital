import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient({ log: [{ emit: "event", level: "query" }] });
globalThis.prisma = db;
const {
  ArtisanDashboardService
} = require("../shared/services/artisan-dashboard.service.ts");
const { CourseRepository } = require("../shared/repositories/course.repository.ts");
const {
  ConversationRepository
} = require("../shared/repositories/conversation.repository.ts");
const {
  NotificationRepository
} = require("../shared/repositories/notification.repository.ts");
const { LEARNING_PROGRAM } = require("../shared/learning/program.ts");
const { MODULE3_SESSIONS } = require("../shared/learning/module3-journey.ts");
const phase = process.argv[2] ?? "local";
if (!/^[a-z-]+$/.test(phase)) throw new Error("Invalid benchmark label");
const rows = [];
let count = 0;
db.$on("query", () => count++);
async function measure(name, operation) {
  count = 0;
  const start = performance.now();
  const result = await operation();
  const row = {
    name,
    ms: Math.round(performance.now() - start),
    queries: count,
    payloadBytes: Buffer.byteLength(JSON.stringify(result) ?? "")
  };
  rows.push(row);
  console.log(JSON.stringify(row));
  return result;
}
try {
  await measure("connection", () => db.$queryRaw`SELECT 1`);
  const enrollment = await db.enrollment.findFirstOrThrow({
    where: { courseId: LEARNING_PROGRAM.id, user: { deletedAt: null } },
    select: { userId: true }
  });
  for (let i = 0; i < 3; i++) {
    await measure("dashboard", () =>
      new ArtisanDashboardService().getDashboard(enrollment.userId)
    );
    await measure("navigation", () =>
      Promise.all([
        new NotificationRepository().countUnread(enrollment.userId),
        new ConversationRepository().countUnreadForUser(enrollment.userId),
        new NotificationRepository().findRecentForUser(enrollment.userId, 5)
      ])
    );
    await measure("lesson_read", () =>
      new CourseRepository().findEnrollmentLesson(
        enrollment.userId,
        LEARNING_PROGRAM.id,
        MODULE3_SESSIONS[0].id
      )
    );
    const repository = new CourseRepository();
    await measure("lesson_support", () =>
      typeof repository.findLessonSupport === "function"
        ? repository.findLessonSupport(
            enrollment.userId,
            LEARNING_PROGRAM.id,
            LEARNING_PROGRAM.modules[2].id,
            MODULE3_SESSIONS[1].id
          )
        : repository.findEnrollmentCourse(enrollment.userId, LEARNING_PROGRAM.id)
    );
  }
  const output = join(tmpdir(), `warmi-initial-${phase}-data.json`);
  await writeFile(output, JSON.stringify(rows, null, 2));
  console.log(
    `Read-only benchmark: ${output}. No user IDs, tokens or query parameters saved.`
  );
} finally {
  await db.$disconnect();
}
