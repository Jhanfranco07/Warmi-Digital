import { z } from "zod";
import {
  AnnouncementType,
  AttendanceStatus,
  CourseLevel,
  CourseStatus,
  FollowUpPriority,
  FollowUpType,
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
