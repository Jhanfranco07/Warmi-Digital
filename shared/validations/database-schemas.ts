import { z } from "zod";
import {
  BadgeType,
  CourseLevel,
  CourseStatus,
  CraftTypeEnum,
  EnrollmentStatus,
  FileType,
  LedgerEntryStatus,
  LedgerEntryType,
  LessonType,
  MessageType,
  NotificationType,
  OrderStatus,
  PaymentMethodStatus,
  PaymentMethodType,
  PaymentStatus,
  PayoutStatus,
  ProductStatus,
  UserRole,
  WorkshopMode,
  WorkshopRegistrationStatus,
  WorkshopStatus
} from "@prisma/client";

export const uuidSchema = z.string().uuid();
export const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const currencySchema = z.string().length(3).default("PEN");
export const positiveMoneySchema = z.coerce.number().positive();

export const userRoleSchema = z.nativeEnum(UserRole);
export const courseLevelSchema = z.nativeEnum(CourseLevel);
export const courseStatusSchema = z.nativeEnum(CourseStatus);
export const lessonTypeSchema = z.nativeEnum(LessonType);
export const enrollmentStatusSchema = z.nativeEnum(EnrollmentStatus);
export const productStatusSchema = z.nativeEnum(ProductStatus);
export const orderStatusSchema = z.nativeEnum(OrderStatus);
export const paymentStatusSchema = z.nativeEnum(PaymentStatus);
export const workshopStatusSchema = z.nativeEnum(WorkshopStatus);
export const workshopModeSchema = z.nativeEnum(WorkshopMode);
export const workshopRegistrationStatusSchema = z.nativeEnum(WorkshopRegistrationStatus);
export const notificationTypeSchema = z.nativeEnum(NotificationType);
export const fileTypeSchema = z.nativeEnum(FileType);
export const messageTypeSchema = z.nativeEnum(MessageType);
export const badgeTypeSchema = z.nativeEnum(BadgeType);
export const craftTypeEnumSchema = z.nativeEnum(CraftTypeEnum);
export const paymentMethodTypeSchema = z.nativeEnum(PaymentMethodType);
export const paymentMethodStatusSchema = z.nativeEnum(PaymentMethodStatus);
export const ledgerEntryTypeSchema = z.nativeEnum(LedgerEntryType);
export const ledgerEntryStatusSchema = z.nativeEnum(LedgerEntryStatus);
export const payoutStatusSchema = z.nativeEnum(PayoutStatus);

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional(),
  locale: z.string().min(2).max(8).default("es")
});

export const profileSchema = z.object({
  userId: uuidSchema,
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  displayName: z.string().min(1).max(140),
  phone: z.string().max(40).optional(),
  bio: z.string().max(2000).optional(),
  communityId: uuidSchema.optional()
});

export const communitySchema = z.object({
  name: z.string().min(2).max(140),
  slug: slugSchema,
  description: z.string().max(2000).optional(),
  location: z.string().max(180).optional()
});

export const craftTypeSchema = z.object({
  key: craftTypeEnumSchema,
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional()
});

export const courseSchema = z.object({
  title: z.string().min(3).max(180),
  slug: slugSchema,
  description: z.string().max(3000).optional(),
  level: courseLevelSchema.default(CourseLevel.BEGINNER),
  status: courseStatusSchema.default(CourseStatus.DRAFT)
});

export const moduleSchema = z.object({
  courseId: uuidSchema,
  title: z.string().min(3).max(180),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0).default(0),
  durationMin: z.number().int().positive().optional()
});

export const lessonSchema = z.object({
  moduleId: uuidSchema,
  title: z.string().min(3).max(180),
  slug: slugSchema,
  type: lessonTypeSchema.default(LessonType.TEXT),
  content: z.string().optional(),
  durationMin: z.number().int().positive().optional(),
  order: z.number().int().min(0).default(0)
});

export const enrollmentSchema = z.object({
  userId: uuidSchema,
  courseId: uuidSchema,
  status: enrollmentStatusSchema.default(EnrollmentStatus.ACTIVE)
});

export const badgeSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  type: badgeTypeSchema.default(BadgeType.LEARNING),
  iconUrl: z.string().url().optional()
});

export const storySchema = z.object({
  userId: uuidSchema,
  communityId: uuidSchema.optional(),
  craftTypeId: uuidSchema.optional(),
  title: z.string().min(3).max(180),
  summary: z.string().max(500).optional(),
  content: z.string().min(1)
});

export const categorySchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional()
});

export const productSchema = z.object({
  artisanId: uuidSchema,
  categoryId: uuidSchema,
  communityId: uuidSchema,
  craftTypeId: uuidSchema,
  name: z.string().min(3).max(180),
  slug: slugSchema,
  description: z.string().max(3000).optional(),
  culturalPhrase: z.string().max(280).optional(),
  story: z.string().max(5000).optional(),
  makingTime: z.string().max(120).optional(),
  materials: z.string().max(500).optional(),
  technique: z.string().max(180).optional(),
  price: positiveMoneySchema,
  currency: currencySchema,
  status: productStatusSchema.default(ProductStatus.DRAFT)
});

export const orderSchema = z.object({
  buyerId: uuidSchema,
  status: orderStatusSchema.default(OrderStatus.PENDING),
  totalAmount: positiveMoneySchema,
  currency: currencySchema,
  shippingNotes: z.string().max(1000).optional()
});

export const paymentSchema = z.object({
  orderId: uuidSchema,
  walletId: uuidSchema.optional(),
  amount: positiveMoneySchema,
  currency: currencySchema,
  status: paymentStatusSchema.default(PaymentStatus.PENDING),
  provider: z.string().min(2).max(80),
  reference: z.string().max(180).optional()
});

export const paymentMethodSchema = z.object({
  userId: uuidSchema,
  walletId: uuidSchema.optional(),
  type: paymentMethodTypeSchema,
  status: paymentMethodStatusSchema.default(PaymentMethodStatus.PENDING),
  label: z.string().min(2).max(120),
  holderName: z.string().max(140).optional(),
  phone: z.string().max(40).optional(),
  bankName: z.string().max(120).optional(),
  accountLast4: z.string().length(4).optional()
});

export const workshopSchema = z.object({
  title: z.string().min(3).max(180),
  description: z.string().max(3000).optional(),
  courseId: uuidSchema.optional(),
  moduleId: uuidSchema.optional(),
  facilitatorId: uuidSchema,
  mode: workshopModeSchema.default(WorkshopMode.VIRTUAL),
  status: workshopStatusSchema.default(WorkshopStatus.DRAFT),
  location: z.string().max(180).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional()
});

export const conversationSchema = z.object({
  title: z.string().max(180).optional(),
  createdById: uuidSchema
});

export const messageSchema = z.object({
  conversationId: uuidSchema,
  senderId: uuidSchema,
  type: messageTypeSchema.default(MessageType.TEXT),
  content: z.string().max(5000).optional()
});

export const notificationSchema = z.object({
  userId: uuidSchema,
  type: notificationTypeSchema,
  title: z.string().min(2).max(180),
  body: z.string().min(1).max(1000),
  metadata: z.record(z.unknown()).optional()
});

export const fileSchema = z.object({
  url: z.string().url(),
  provider: z.string().min(2).max(80),
  type: fileTypeSchema,
  mimeType: z.string().min(2).max(120),
  size: z.number().int().positive(),
  ownerId: uuidSchema.optional()
});

export const ledgerEntrySchema = z.object({
  userId: uuidSchema,
  walletId: uuidSchema,
  paymentId: uuidSchema.optional(),
  payoutId: uuidSchema.optional(),
  type: ledgerEntryTypeSchema,
  status: ledgerEntryStatusSchema.default(LedgerEntryStatus.PENDING),
  amount: z.coerce.number(),
  currency: currencySchema,
  description: z.string().max(500).optional(),
  reference: z.string().max(180).optional()
});

export const payoutSchema = z.object({
  userId: uuidSchema,
  walletId: uuidSchema,
  paymentMethodId: uuidSchema.optional(),
  amount: positiveMoneySchema,
  currency: currencySchema,
  status: payoutStatusSchema.default(PayoutStatus.REQUESTED)
});
