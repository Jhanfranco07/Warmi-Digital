import { z } from "zod";
import {
  AnnouncementType,
  AttendanceStatus,
  CourseLevel,
  CourseStatus,
  FollowUpPriority,
  FollowUpType,
  LessonResourceType,
  LessonType,
  WorkshopMode,
  WorkshopStatus
} from "@prisma/client";

export const followUpFormSchema = z.object({
  artisanId: z.string().uuid(),
  occurredAt: z.coerce.date(),
  type: z.nativeEnum(FollowUpType),
  observation: z.string().min(3).max(3000),
  difficulty: z.string().max(2000).optional(),
  recommendation: z.string().max(2000).optional(),
  commitment: z.string().max(2000).optional(),
  nextFollowUpAt: z.coerce.date().optional(),
  priority: z.nativeEnum(FollowUpPriority),
  outcome: z.string().max(1000).optional()
});
export const courseFormSchema = z.object({
  title: z.string().min(3).max(180),
  description: z.string().max(3000).optional(),
  level: z.nativeEnum(CourseLevel),
  status: z.nativeEnum(CourseStatus),
  durationMin: z.coerce.number().int().positive().optional(),
  imageUrl: z.string().url().optional()
});
export const updateCourseFormSchema = courseFormSchema.extend({
  courseId: z.string().uuid()
});
export const moduleFormSchema = z.object({
  courseId: z.string().uuid(),
  moduleId: z.string().uuid().optional(),
  title: z.string().min(3).max(180),
  description: z.string().max(2000).optional(),
  order: z.coerce.number().int().min(0).default(0),
  durationMin: z.coerce.number().int().positive().optional()
});
export const lessonFormSchema = z.object({
  courseId: z.string().uuid(),
  moduleId: z.string().uuid(),
  lessonId: z.string().uuid().optional(),
  title: z.string().min(3).max(180),
  content: z.string().max(8000).optional(),
  type: z.nativeEnum(LessonType).default(LessonType.TEXT),
  order: z.coerce.number().int().min(0).default(0),
  durationMin: z.coerce.number().int().positive().optional()
});
export const lessonResourceFormSchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid(),
  resourceType: z.nativeEnum(LessonResourceType),
  title: z.string().min(3).max(180),
  description: z.string().max(2000).optional(),
  position: z.coerce.number().int().min(0).default(0),
  fileId: z.string().uuid().optional(),
  url: z.string().url().optional()
});
export const workshopFormSchema = z.object({
  title: z.string().min(3).max(180),
  description: z.string().max(3000).optional(),
  communityId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  mode: z.nativeEnum(WorkshopMode),
  status: z.nativeEnum(WorkshopStatus),
  location: z.string().max(180).optional(),
  materials: z.string().max(3000).optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date()
});
export const attendanceFormSchema = z.object({
  workshopId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.nativeEnum(AttendanceStatus)
});
export const announcementFormSchema = z.object({
  title: z.string().min(3).max(180),
  body: z.string().min(3).max(5000),
  type: z.nativeEnum(AnnouncementType),
  institution: z.string().max(180).optional(),
  requirements: z.string().max(3000).optional(),
  officialUrl: z.string().url().optional(),
  communityId: z.string().uuid().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  published: z.boolean().default(false)
});
export const messageFormSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(5000)
});

export type FollowUpFormInput = z.infer<typeof followUpFormSchema>;
