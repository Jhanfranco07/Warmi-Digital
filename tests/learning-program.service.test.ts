import assert from "node:assert/strict";
import test from "node:test";
import { LEARNING_PROGRAM, PUBLISHED_PROGRAM_LESSONS } from "@/shared/learning/program";
import { WARMI_CURRICULUM } from "@/shared/learning/curriculum";
import { CourseRepository } from "@/shared/repositories/course.repository";
import { ArtisanDashboardService } from "@/shared/services/artisan-dashboard.service";
import { LearningService } from "@/shared/services/learning.service";

for (const completed of [0, 8, 16]) {
  test(`course and My learning agree for ${completed}/16 completed sessions`, async () => {
    const course = {
      id: LEARNING_PROGRAM.id,
      title: LEARNING_PROGRAM.title,
      facilitator: null,
      modules: LEARNING_PROGRAM.modules.map((learningModule) => ({
        ...learningModule,
        durationMin: learningModule.order === 3 ? 60 : 0,
        lessons: [
          ...WARMI_CURRICULUM.sessions.filter(
            (session) => session.module === learningModule.order
          ),
          { id: `historical-${learningModule.order}` }
        ]
      }))
    };
    const enrollment = {
      id: "enrollment",
      status: "COMPLETED",
      course,
      courseProgress: { percentage: 100 },
      lessonProgresses: [
        ...PUBLISHED_PROGRAM_LESSONS.slice(0, completed).map((lessonId) => ({
          lessonId,
          completed: true
        })),
        { lessonId: "historical-1", completed: true }
      ]
    };
    const repository = {
      findEnrolledCourseSummaries: async () => [enrollment],
      findAvailableCourseSummaries: async () => [],
      findEnrollmentCourse: async () => enrollment
    } as unknown as CourseRepository;
    const service = new LearningService(repository);
    const detail = await service.getCourseDetail("artisan", course.id);
    const learning = await service.getLearningPage("artisan");
    assert.equal(detail.progress, (completed * 100) / 16);
    assert.equal(learning.enrolledCourses[0].progress, detail.progress);
    assert.equal(
      learning.enrolledCourses[0].status,
      completed === 16 ? "COMPLETED" : "ACTIVE"
    );
    assert.equal(
      detail.enrollment.course.modules.flatMap((item) => item.lessons).length,
      16
    );
    assert.equal(detail.firstIncompleteLesson?.id, PUBLISHED_PROGRAM_LESSONS[completed]);
    assert.equal(detail.lessonProgress.has("historical-1"), false);
    assert.equal(enrollment.course.modules.flatMap((item) => item.lessons).length, 20);
    const readers = [
      { findDashboardProfile: async () => null },
      repository,
      { getWorkshops: async () => ({ upcoming: [], completed: [] }) },
      { getOpportunities: async () => [] },
      { findByUser: async () => null },
      { findSummaryByArtisan: async () => [] },
      { findRecentSummaryForArtisan: async () => [] },
      { findRecentForUser: async () => [], countUnread: async () => 0 }
    ] as unknown as ConstructorParameters<typeof ArtisanDashboardService>;
    const dashboard = await new ArtisanDashboardService(...readers).getDashboard(
      "artisan"
    );
    assert.equal(
      dashboard.currentEnrollment?.courseProgress?.percentage,
      detail.progress
    );
  });
}
