import { prisma } from "@/shared/server/db/prisma";

export class CourseRepository {
  constructor(protected readonly db = prisma) {}

  findEnrolledCourses(userId: string) {
    return this.db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: { orderBy: { order: "asc" } } },
              orderBy: { order: "asc" }
            }
          }
        },
        courseProgress: true,
        lessonProgresses: true
      },
      orderBy: { enrolledAt: "desc" }
    });
  }

  findAvailableCourses(userId: string) {
    return this.db.course.findMany({
      where: {
        status: "PUBLISHED",
        enrollments: { none: { userId } }
      },
      include: {
        modules: {
          include: { lessons: true },
          orderBy: { order: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  findEnrollmentCourse(userId: string, courseId: string) {
    return this.db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: { lessonFiles: { include: { file: true } } },
                  orderBy: { order: "asc" }
                }
              },
              orderBy: { order: "asc" }
            },
            workshops: {
              include: { facilitator: { include: { profile: true } } },
              orderBy: { startsAt: "asc" }
            }
          }
        },
        courseProgress: true,
        lessonProgresses: true
      }
    });
  }

  async findEnrollmentLesson(userId: string, courseId: string, lessonId: string) {
    const enrollment = await this.db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        course: true,
        courseProgress: true,
        lessonProgresses: true
      }
    });

    if (!enrollment) {
      return null;
    }

    const lesson = await this.db.lesson.findFirst({
      where: {
        id: lessonId,
        module: { courseId }
      },
      include: {
        module: true,
        lessonFiles: { include: { file: true } }
      }
    });

    return lesson ? { enrollment, lesson } : null;
  }

  findManagedCourses(facilitatorId: string) {
    return this.db.course.findMany({
      where: { facilitatorId, deletedAt: null },
      include: {
        modules: { include: { lessons: true } },
        enrollments: { include: { courseProgress: true } },
        facilitator: { include: { profile: true } }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  findManagedCourse(facilitatorId: string, courseId: string) {
    return this.db.course.findFirst({
      where: { id: courseId, facilitatorId, deletedAt: null },
      include: {
        modules: {
          include: { lessons: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" }
        }
      }
    });
  }

  create(data: Parameters<typeof this.db.course.create>[0]["data"]) {
    return this.db.course.create({ data });
  }

  update(
    courseId: string,
    facilitatorId: string,
    data: Parameters<typeof this.db.course.update>[0]["data"]
  ) {
    return this.db.course.updateMany({ where: { id: courseId, facilitatorId }, data });
  }
}
