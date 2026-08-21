import { FileType } from "@prisma/client";
import { z } from "zod";

import {
  allowedUploadFolders,
  getUploadRule,
  isAllowedUploadFolder,
  validateUploadFile
} from "@/shared/uploads/upload-limits";
import type {
  CloudinaryResourceType,
  WarmiUploadType
} from "@/shared/uploads/upload-types";

export const imageMimeTypes = getUploadRule("IMAGE").accept;
export const audioMimeTypes = getUploadRule("AUDIO").accept;
export const documentMimeTypes = getUploadRule("DOCUMENT").accept;
export const videoMimeTypes = [] as const;

export const uploadFileSchema = z.object({
  type: z.nativeEnum(FileType),
  altText: z.string().trim().max(180).optional(),
  folder: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9/_-]+$/)
    .refine(isAllowedUploadFolder, {
      message: `La carpeta debe ser una de: ${allowedUploadFolders.join(", ")}.`
    })
    .default("warmi/private")
});

export const uploadSignatureSchema = uploadFileSchema.pick({
  folder: true,
  type: true
});

const cloudinaryResourceTypeSchema = z.enum(["image", "video", "raw", "auto"]);

export const uploadedCloudinaryMetadataSchema = z.object({
  bytes: z.number().int().positive(),
  folder: uploadFileSchema.shape.folder,
  format: z.string().trim().max(40).nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  mimeType: z.string().trim().min(3).max(180),
  originalFilename: z.string().trim().min(1).max(240),
  publicId: z.string().trim().min(3).max(300),
  resourceType: cloudinaryResourceTypeSchema,
  secureUrl: z.string().url(),
  type: z.nativeEnum(FileType),
  url: z.string().url().nullable().optional(),
  version: z.number().int().positive().nullable().optional(),
  width: z.number().int().positive().nullable().optional()
});

export const createUploadedFileRecordSchema = z.object({
  altText: z.string().trim().max(180).optional(),
  file: uploadedCloudinaryMetadataSchema
});

export const cleanupCloudinaryUploadSchema = z.object({
  folder: uploadFileSchema.shape.folder,
  publicId: z.string().trim().min(3).max(300),
  resourceType: cloudinaryResourceTypeSchema
});

export type UploadedCloudinaryMetadataInput = z.infer<
  typeof uploadedCloudinaryMetadataSchema
> & {
  resourceType: CloudinaryResourceType;
};

export function validateFileForType(file: File, type: FileType) {
  return validateUploadFile(file, type as WarmiUploadType);
}
