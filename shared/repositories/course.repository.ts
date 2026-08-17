import { prisma } from "@/shared/server/db/prisma";
import type { Prisma } from "@prisma/client";

export class CourseRepository {
  constructor(protected readonly db = prisma) {}

  findEnrolledCourses(userId: string) {
    return this.db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            facilitator: { include: { profile: true } },
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

  findEnrolledCourseSummaries(userId: string) {
    return this.db.enrollment.findMany({
      where: { userId },
      select: {
        status: true,
        lastActivityAt: true,
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            level: true,
            imageUrl: true,
            facilitator: {
              select: {
                id: true,
                name: true,
                profile: { select: { displayName: true, avatarUrl: true } }
              }
            },
            modules: {
              select: {
                id: true,
                durationMin: true,
                lessons: { select: { id: true } }
              },
              orderBy: { order: "asc" }
            }
          }
        },
        courseProgress: { select: { percentage: true } },
        lessonProgresses: { select: { completed: true } }
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

  findAvailableCourseSummaries(userId: string) {
    return this.db.course.findMany({
      where: {
        status: "PUBLISHED",
        enrollments: { none: { userId } }
      },
      select: {
        id: true,
        title: true,
        description: true,
        level: true,
        imageUrl: true,
        facilitator: {
          select: {
            id: true,
            name: true,
            profile: { select: { displayName: true, avatarUrl: true } }
          }
        },
        modules: {
          select: {
            id: true,
            durationMin: true
          },
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
            facilitator: { include: { profile: true } },
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
        course: {
          include: {
            facilitator: { include: { profile: true } }
          }
        },
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
          include: {
            coverFile: true,
            lessons: {
              include: {
                lessonFiles: {
                  include: { file: true },
                  orderBy: { order: "asc" }
                }
              },
              orderBy: { order: "asc" }
            }
          },
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

  updateManagedCourse(
    courseId: string,
    facilitatorId: string,
    data: Prisma.CourseUpdateManyMutationInput
  ) {
    return this.db.course.updateMany({
      where: { id: courseId, facilitatorId, deletedAt: null },
      data
    });
  }

  async createModule(
    facilitatorId: string,
    courseId: string,
    data: {
      title: string;
      description?: string | null;
      durationMin?: number | null;
      coverFileId?: string | null;
    }
  ) {
    return this.db.$transaction(async (tx) => {
      const course = await tx.course.findFirst({
        where: { id: courseId, facilitatorId, deletedAt: null },
        select: { id: true }
      });

      if (!course) {
        return null;
      }

      const lastModule = await tx.module.findFirst({
        where: { courseId },
        orderBy: { order: "desc" },
        select: { order: true }
      });

      return tx.module.create({
        data: {
          ...data,
          courseId,
          order: (lastModule?.order ?? -1) + 1
        }
      });
    });
  }

  updateModule(
    facilitatorId: string,
    moduleId: string,
    data: Prisma.ModuleUpdateManyMutationInput
  ) {
    return this.db.module.updateMany({
      where: { id: moduleId, course: { facilitatorId, deletedAt: null } },
      data
    });
  }

  async moveModule(
    facilitatorId: string,
    moduleId: string,
    direction: "up" | "down"
  ) {
    return this.db.$transaction(async (tx) => {
      const current = await tx.module.findFirst({
        where: { id: moduleId, course: { facilitatorId, deletedAt: null } },
        select: { id: true, courseId: true, order: true }
      });

      if (!current) {
        return false;
      }

      const adjacent = await tx.module.findFirst({
        where: {
          courseId: current.courseId,
          order: direction === "up" ? { lt: current.order } : { gt: current.order }
        },
        orderBy: { order: direction === "up" ? "desc" : "asc" },
        select: { id: true, order: true }
      });

      if (!adjacent) {
        return false;
      }

      await tx.module.update({
        where: { id: current.id },
        data: { order: adjacent.order }
      });
      await tx.module.update({
        where: { id: adjacent.id },
        data: { order: current.order }
      });

      return true;
    });
  }

  async createLesson(
    facilitatorId: string,
    moduleId: string,
    data: {
      title: string;
      slug: string;
      content?: string | null;
      durationMin?: number | null;
      type?: "TEXT" | "VIDEO" | "AUDIO" | "PDF" | "QUIZ" | "ASSIGNMENT";
    }
  ) {
    return this.db.$transaction(async (tx) => {
      const module = await tx.module.findFirst({
        where: { id: moduleId, course: { facilitatorId, deletedAt: null } },
        select: { id: true }
      });

      if (!module) {
        return null;
      }

      const lastLesson = await tx.lesson.findFirst({
        where: { moduleId },
        orderBy: { order: "desc" },
        select: { order: true }
      });

      return tx.lesson.create({
        data: {
          ...data,
          moduleId,
          order: (lastLesson?.order ?? -1) + 1
        }
      });
    });
  }

  updateLesson(
    facilitatorId: string,
    lessonId: string,
    data: Prisma.LessonUpdateManyMutationInput
  ) {
    return this.db.lesson.updateMany({
      where: {
        id: lessonId,
        module: { course: { facilitatorId, deletedAt: null } }
      },
      data
    });
  }

  async attachLessonFile(
    facilitatorId: string,
    lessonId: string,
    fileId: string
  ) {
    return this.db.$transaction(async (tx) => {
      const lesson = await tx.lesson.findFirst({
        where: {
          id: lessonId,
          module: { course: { facilitatorId, deletedAt: null } }
        },
        select: { id: true }
      });

      if (!lesson) {
        return null;
      }

      const lastResource = await tx.lessonFile.findFirst({
        where: { lessonId },
        orderBy: { order: "desc" },
        select: { order: true }
      });

      return tx.lessonFile.create({
        data: {
          lessonId,
          fileId,
          order: (lastResource?.order ?? -1) + 1
        }
      });
    });
  }

  async moveLessonFile(
    facilitatorId: string,
    lessonFileId: string,
    direction: "up" | "down"
  ) {
    return this.db.$transaction(async (tx) => {
      const current = await tx.lessonFile.findFirst({
        where: {
          id: lessonFileId,
          lesson: { module: { course: { facilitatorId, deletedAt: null } } }
        },
        select: { id: true, lessonId: true, order: true }
      });

      if (!current) {
        return false;
      }

      const adjacent = await tx.lessonFile.findFirst({
        where: {
          lessonId: current.lessonId,
          order: direction === "up" ? { lt: current.order } : { gt: current.order }
        },
        orderBy: { order: direction === "up" ? "desc" : "asc" },
        select: { id: true, order: true }
      });

      if (!adjacent) {
        return false;
      }

      await tx.lessonFile.update({
        where: { id: current.id },
        data: { order: adjacent.order }
      });
      await tx.lessonFile.update({
        where: { id: adjacent.id },
        data: { order: current.order }
      });

      return true;
    });
  }

  deleteLessonFile(facilitatorId: string, lessonFileId: string) {
    return this.db.lessonFile.deleteMany({
      where: {
        id: lessonFileId,
        lesson: { module: { course: { facilitatorId, deletedAt: null } } }
      }
    });
  }
}
