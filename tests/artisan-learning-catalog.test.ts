import assert from "node:assert/strict";
import test from "node:test";
import { LEARNING_PROGRAM, isArtisanLearningCourse } from "@/shared/learning/program";
import { CourseRepository } from "@/shared/repositories/course.repository";
import { ArtisanDashboardService } from "@/shared/services/artisan-dashboard.service";
import { LearningService } from "@/shared/services/learning.service";

type Enrollment = Awaited<
  ReturnType<CourseRepository["findEnrolledCourseSummaries"]>
>[number];
type Course = Enrollment["course"];

function course(id: string, title: string): Course {
  return {
    id,
    title,
    description: null,
    level: "BEGINNER",
    imageUrl: null,
    durationMin: null,
    facilitator: null,
    modules: [
      {
        id: LEARNING_PROGRAM.modules[2].id,
        durationMin: 80,
        title: "Módulo 3",
        order: 3,
        lessons: [
          { id: "session-1", durationMin: null },
          { id: "session-2", durationMin: null }
        ]
      }
    ]
  };
}

function enrollment(input: Course): Enrollment {
  return {
    id: `enrollment-${input.id}`,
    status: "ACTIVE",
    lastActivityAt: null,
    course: input,
    courseProgress: { percentage: 0 },
    lessonProgresses:
      input.id === LEARNING_PROGRAM.id
        ? [{ lessonId: "session-1", completed: true, startedAt: null, progress: 100 }]
        : []
  };
}

const program = course(LEARNING_PROGRAM.id, LEARNING_PROGRAM.title);
const gmail = course(LEARNING_PROGRAM.modules[0].previousCourseId, "Gmail");
gmail.modules = [];
const whatsapp = course(LEARNING_PROGRAM.modules[2].previousCourseId, "WhatsApp");

class CatalogRepository extends CourseRepository {
  constructor(
    private readonly enrollments: Enrollment[],
    private readonly available: Course[] = []
  ) {
    super();
  }
  findEnrolledCourseSummaries() {
    return Promise.resolve(this.enrollments) as ReturnType<
      CourseRepository["findEnrolledCourseSummaries"]
    >;
  }
  findAvailableCourseSummaries() {
    return Promise.resolve(this.available) as ReturnType<
      CourseRepository["findAvailableCourseSummaries"]
    >;
  }
}

function dashboard(repository: CourseRepository) {
  type Dependencies = ConstructorParameters<typeof ArtisanDashboardService>;
  return new ArtisanDashboardService(
    { findDashboardProfile: async () => null } as unknown as Dependencies[0],
    repository,
    {
      getWorkshops: async () => ({ upcoming: [], completed: [] })
    } as unknown as Dependencies[2],
    { getOpportunities: async () => [] } as unknown as Dependencies[3],
    { findByUser: async () => null } as unknown as Dependencies[4],
    { findSummaryByArtisan: async () => [] } as unknown as Dependencies[5],
    { findRecentSummaryForArtisan: async () => [] } as unknown as Dependencies[6],
    {
      findRecentForUser: async () => [],
      countUnread: async () => 0
    } as unknown as Dependencies[7]
  );
}

test("artisan catalog allows only the program by stable ID", () => {
  assert.equal(isArtisanLearningCourse(program.id), true);
  for (const id of [gmail.id, whatsapp.id, "other-course", program.title])
    assert.equal(isArtisanLearningCourse(id), false);
});

test("learning tabs hide legacy enrolled and available courses without mutating them", async () => {
  const enrolled = [enrollment(gmail), enrollment(whatsapp), enrollment(program)];
  const before = JSON.stringify(enrolled);
  const result = await new LearningService(
    new CatalogRepository(enrolled)
  ).getLearningPage("artisan");
  assert.deepEqual(
    result.enrolledCourses.map((item) => item.id),
    [program.id]
  );
  assert.equal(result.enrolledCourses[0].progress, 50);
  assert.equal(JSON.stringify(enrolled), before);
  const available = await new LearningService(
    new CatalogRepository([], [gmail, whatsapp, program])
  ).getLearningPage("artisan");
  assert.deepEqual(
    available.availableCourses.map((item) => item.id),
    [program.id]
  );
});

test("dashboard continuation and recommendations select the program even after legacy enrollments", async () => {
  const enrolled = [enrollment(gmail), enrollment(whatsapp), enrollment(program)];
  const before = JSON.stringify(enrolled);
  const result = await dashboard(new CatalogRepository(enrolled)).getDashboard("artisan");
  assert.equal(result.currentEnrollment?.course.id, program.id);
  assert.deepEqual(
    result.enrollments.map((item) => item.course.id),
    [program.id]
  );
  assert.equal(result.currentEnrollment?.courseProgress?.percentage, 50);
  assert.equal(result.generalProgress, 25);
  assert.equal(JSON.stringify(enrolled), before);
});

test("legacy-only users do not see an old course as continuation", async () => {
  const repository = new CatalogRepository([enrollment(gmail), enrollment(whatsapp)]);
  assert.deepEqual(
    (await new LearningService(repository).getLearningPage("artisan")).enrolledCourses,
    []
  );
  const result = await dashboard(repository).getDashboard("artisan");
  assert.equal(result.currentEnrollment, undefined);
  assert.deepEqual(result.enrollments, []);
});
