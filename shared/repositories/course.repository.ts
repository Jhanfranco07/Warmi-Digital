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
                  include: {
                    lessonFiles: {
                      include: { file: true },
                      orderBy: { position: "asc" }
                    }
                  },
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
        lessonFiles: {
          include: { file: true },
          orderBy: { position: "asc" }
        }
      }
    });

    return lesson ? { enrollment, lesson } : null;
  }

  findManagedCourses(facilitatorId: string) {
    return this.db.course.findMany({
      where: { facilitatorId, deletedAt: null },
      include: {
        modules: {
          include: {
            coverFile: true,
            lessons: {
              include: {
                lessonFiles: {
                  include: { file: true },
                  orderBy: { position: "asc" }
                }
              },
              orderBy: { order: "asc" }
            }
          },
          orderBy: { order: "asc" }
        },
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
                  orderBy: { position: "asc" }
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

      const { coverFileId, ...moduleData } = data;

      return tx.module.create({
        data: {
          ...moduleData,
          order: (lastModule?.order ?? -1) + 1,
          course: { connect: { id: courseId } },
          ...(coverFileId ? { coverFile: { connect: { id: coverFileId } } } : {})
        }
      });
    });
  }

  async updateModule(
    facilitatorId: string,
    moduleId: string,
    data: {
      title?: string;
      description?: string | null;
      durationMin?: number | null;
      order?: number;
      coverFileId?: string | null;
    }
  ) {
    const { coverFileId, ...moduleData } = data;

    const result = await this.db.module.updateMany({
      where: { id: moduleId, course: { facilitatorId, deletedAt: null } },
      data: moduleData
    });

    if (result.count === 0) {
      return result;
    }

    if (coverFileId !== undefined) {
      await this.db.module.update({
        where: { id: moduleId },
        data:
          coverFileId === null
            ? { coverFile: { disconnect: true } }
            : { coverFile: { connect: { id: coverFileId } } }
      });
    }

    return result;
  }

  async moveModule(facilitatorId: string, moduleId: string, direction: "up" | "down") {
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
      const courseModule = await tx.module.findFirst({
        where: { id: moduleId, course: { facilitatorId, deletedAt: null } },
        select: { id: true }
      });

      if (!courseModule) {
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

  async attachLessonFile(facilitatorId: string, lessonId: string, fileId: string) {
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

      const file = await tx.file.findFirst({
        where: { id: fileId, ownerId: facilitatorId },
        select: { id: true, type: true, publicId: true, altText: true }
      });

      if (!file) {
        return null;
      }

      const lastResource = await tx.lessonFile.findFirst({
        where: { lessonId },
        orderBy: { position: "desc" },
        select: { position: true }
      });

      const resourceType =
        file.type === "IMAGE"
          ? "IMAGE"
          : file.type === "AUDIO"
            ? "AUDIO"
            : file.type === "VIDEO"
              ? "VIDEO_UPLOAD"
              : "DOCUMENT";

      return tx.lessonFile.create({
        data: {
          lessonId,
          fileId,
          type: resourceType,
          title: file.altText ?? file.publicId ?? "Recurso",
          position: (lastResource?.position ?? -1) + 1
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
        select: { id: true, lessonId: true, position: true }
      });

      if (!current) {
        return false;
      }

      const adjacent = await tx.lessonFile.findFirst({
        where: {
          lessonId: current.lessonId,
          position:
            direction === "up" ? { lt: current.position } : { gt: current.position }
        },
        orderBy: { position: direction === "up" ? "desc" : "asc" },
        select: { id: true, position: true }
      });

      if (!adjacent) {
        return false;
      }

      await tx.lessonFile.update({
        where: { id: current.id },
        data: { position: adjacent.position }
      });
      await tx.lessonFile.update({
        where: { id: adjacent.id },
        data: { position: current.position }
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

  findManagedLesson(facilitatorId: string, courseId: string, lessonId: string) {
    return this.db.lesson.findFirst({
      where: {
        id: lessonId,
        module: { course: { id: courseId, facilitatorId, deletedAt: null } }
      },
      include: { module: true }
    });
  }

  async upsertModule(
    facilitatorId: string,
    data: {
      id?: string;
      courseId: string;
      title: string;
      description?: string | null;
      order: number;
      durationMin?: number | null;
      coverFileId?: string | null;
    }
  ) {
    const { id, courseId, coverFileId, ...moduleData } = data;

    if (id) {
      const result = await this.db.module.updateMany({
        where: { id, course: { facilitatorId, deletedAt: null } },
        data: moduleData
      });

      if (result.count === 0) {
        return result;
      }

      if (coverFileId !== undefined) {
        await this.db.module.update({
          where: { id },
          data:
            coverFileId === null
              ? { coverFile: { disconnect: true } }
              : { coverFile: { connect: { id: coverFileId } } }
        });
      }

      return result;
    }

    const course = await this.db.course.findFirst({
      where: { id: courseId, facilitatorId, deletedAt: null },
      select: { id: true }
    });

    if (!course) {
      throw new Error("Curso no encontrado o no autorizado.");
    }

    return this.db.module.create({
      data: {
        ...moduleData,
        course: { connect: { id: courseId } },
        ...(coverFileId ? { coverFile: { connect: { id: coverFileId } } } : {})
      }
    });
  }

  upsertLesson(
    facilitatorId: string,
    data: {
      id?: string;
      moduleId: string;
      title: string;
      slug?: string;
      content?: string | null;
      type: import("@prisma/client").LessonType;
      order: number;
      durationMin?: number | null;
    }
  ) {
    const { id, moduleId, ...lessonData } = data;

    if (id) {
      return this.db.lesson.updateMany({
        where: { id, module: { course: { facilitatorId } } },
        data: lessonData
      });
    }

    if (!lessonData.slug) {
      throw new Error("La lección nueva requiere slug.");
    }

    return this.db.lesson.create({
      data: {
        ...lessonData,
        slug: lessonData.slug,
        module: { connect: { id: moduleId } }
      }
    });
  }

  createLessonResource(data: Parameters<typeof this.db.lessonFile.create>[0]["data"]) {
    return this.db.lessonFile.create({ data });
  }

  deleteLessonResource(resourceId: string, facilitatorId: string) {
    return this.db.lessonFile.deleteMany({
      where: {
        id: resourceId,
        lesson: { module: { course: { facilitatorId } } }
      }
    });
  }

  async createManagedLessonResource(
    facilitatorId: string,
    lessonId: string,
    data: {
      fileId?: string | null;
      type: import("@prisma/client").LessonResourceType;
      title: string;
      description?: string | null;
      provider?: string | null;
      externalId?: string | null;
      originalUrl?: string | null;
    }
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
        orderBy: { position: "desc" },
        select: { position: true }
      });

      return tx.lessonFile.create({
        data: {
          lessonId,
          fileId: data.fileId ?? null,
          type: data.type,
          title: data.title,
          description: data.description ?? null,
          position: (lastResource?.position ?? -1) + 1,
          provider: data.provider ?? null,
          externalId: data.externalId ?? null,
          originalUrl: data.originalUrl ?? null
        }
      });
    });
  }

  async updateLessonResource(
    facilitatorId: string,
    resourceId: string,
    data: {
      fileId?: string | null;
      type?: import("@prisma/client").LessonResourceType;
      title?: string;
      description?: string | null;
      provider?: string | null;
      externalId?: string | null;
      originalUrl?: string | null;
    }
  ) {
    const { fileId, ...resourceData } = data;
    const result = await this.db.lessonFile.updateMany({
      where: {
        id: resourceId,
        lesson: { module: { course: { facilitatorId, deletedAt: null } } }
      },
      data: resourceData
    });

    if (result.count === 0 || fileId === undefined) {
      return result;
    }

    await this.db.lessonFile.update({
      where: { id: resourceId },
      data:
        fileId === null
          ? { file: { disconnect: true } }
          : { file: { connect: { id: fileId } } }
    });

    return result;
  }

  moveLessonResource(
    facilitatorId: string,
    resourceId: string,
    direction: "up" | "down"
  ) {
    return this.moveLessonFile(facilitatorId, resourceId, direction);
  }
}
