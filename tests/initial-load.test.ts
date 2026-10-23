import assert from "node:assert/strict";
import test from "node:test";
import type { Prisma } from "@prisma/client";
import { CourseRepository } from "../shared/repositories/course.repository";
import { ConversationRepository } from "../shared/repositories/conversation.repository";
import { AnnouncementRepository } from "../shared/repositories/announcement.repository";

test("unread counter uses one parameterized count, not conversation hydration", async () => {
  let calls = 0;
  const owner = "bound-owner-not-sql";
  const repository = new ConversationRepository({
    $queryRaw: async (strings: TemplateStringsArray, ...values: unknown[]) => {
      calls++;
      const sql = strings.join("?");
      assert.ok(sql.includes('ORDER BY "createdAt" DESC'));
      assert.ok(sql.includes("LIMIT 1"));
      assert.ok(!sql.includes(owner));
      assert.deepEqual(values, [owner, owner]);
      return [{ count: 2 }];
    }
  } as unknown as ConstructorParameters<typeof ConversationRepository>[0]);
  assert.equal(await repository.countUnreadForUser(owner), 2);
  assert.equal(calls, 1);
});

test("lesson support is constrained to enrolled user, course, module and target lesson", async () => {
  let query: Prisma.LessonFindFirstArgs | undefined;
  const repository = new CourseRepository({
    lesson: {
      findFirst: async (args: Prisma.LessonFindFirstArgs) => {
        query = args;
        return null;
      }
    }
  } as unknown as ConstructorParameters<typeof CourseRepository>[0]);
  assert.equal(
    await repository.findLessonSupport("owner", "course", "module", "support"),
    null
  );
  assert.deepEqual(query?.where, {
    id: "support",
    module: {
      id: "module",
      courseId: "course",
      course: { deletedAt: null, enrollments: { some: { userId: "owner" } } }
    }
  });
  assert.deepEqual(query?.select, {
    id: true,
    lessonFiles: {
      where: { file: { mimeType: "video/mp4" } },
      include: { file: true },
      orderBy: { position: "asc" }
    }
  });
});

test("unauthorized lesson request never reads the lesson resources", async () => {
  const repository = new CourseRepository({
    enrollment: { findUnique: async () => null },
    lesson: {
      findFirst: async () => {
        throw new Error("Unexpected lesson read");
      }
    }
  } as unknown as ConstructorParameters<typeof CourseRepository>[0]);
  assert.equal(
    await repository.findEnrollmentLesson("outsider", "course", "lesson"),
    null
  );
});

test("dashboard opportunities are bounded summaries without author profiles", async () => {
  let query: Prisma.AnnouncementFindManyArgs | undefined;
  const repository = new AnnouncementRepository({
    announcement: {
      findMany: async (args: Prisma.AnnouncementFindManyArgs) => {
        query = args;
        return [];
      }
    }
  } as unknown as ConstructorParameters<typeof AnnouncementRepository>[0]);
  assert.deepEqual(await repository.findDashboardOpportunities("community"), []);
  assert.equal(query?.take, 3);
  assert.deepEqual(query?.select, { id: true, title: true, endsAt: true });
  assert.equal(query?.include, undefined);
  assert.deepEqual(query?.orderBy, [{ endsAt: "asc" }, { createdAt: "desc" }]);
});

test("dashboard course query filters the program and omits facilitator profiles", async () => {
  let query: Prisma.EnrollmentFindManyArgs | undefined;
  const repository = new CourseRepository({
    enrollment: {
      findMany: async (args: Prisma.EnrollmentFindManyArgs) => {
        query = args;
        return [];
      }
    }
  } as unknown as ConstructorParameters<typeof CourseRepository>[0]);
  await repository.findDashboardCourseSummaries("owner", "program");
  assert.deepEqual(query?.where, { userId: "owner", courseId: "program" });
  const course = query?.select?.course as { select: Prisma.CourseSelect };
  assert.equal(course.select.facilitator, undefined);
  assert.ok(course.select.modules);
  assert.ok(query?.select?.lessonProgresses);
});
