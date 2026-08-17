import { FileType } from "@prisma/client";
import { z } from "zod";

export const imageMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
] as const;
export const audioMimeTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg"
] as const;
export const documentMimeTypes = ["application/pdf"] as const;
export const videoMimeTypes = ["video/mp4", "video/webm", "video/quicktime"] as const;

export const uploadFileSchema = z.object({
  type: z.nativeEnum(FileType),
  altText: z.string().trim().max(180).optional(),
  folder: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9/_-]+$/)
    .default("warmi/private")
});

export function validateFileForType(file: File, type: FileType) {
  const maxImageSize = 5 * 1024 * 1024;
  const maxDocumentSize = 20 * 1024 * 1024;
  const maxAudioSize = 30 * 1024 * 1024;
  const maxVideoSize = 100 * 1024 * 1024;

  if (type === FileType.IMAGE) {
    if (!imageMimeTypes.includes(file.type as (typeof imageMimeTypes)[number])) {
      return "Solo se permiten imagenes JPG, JPEG, PNG o WEBP.";
    }

    if (file.size > maxImageSize) {
      return "La imagen no debe superar 5 MB.";
    }
  }

  if (type === FileType.AUDIO) {
    if (!audioMimeTypes.includes(file.type as (typeof audioMimeTypes)[number])) {
      return "Solo se permiten audios MP3, WAV u OGG.";
    }

    if (file.size > maxAudioSize) {
      return "El audio no debe superar 30 MB.";
    }
  }

  if (type === FileType.DOCUMENT) {
    if (!documentMimeTypes.includes(file.type as (typeof documentMimeTypes)[number])) {
      return "Solo se permiten documentos PDF.";
    }

    if (file.size > maxDocumentSize) {
      return "El documento no debe superar 20 MB.";
    }
  }

  if (type === FileType.VIDEO) {
    if (!videoMimeTypes.includes(file.type as (typeof videoMimeTypes)[number])) {
      return "Solo se permiten videos MP4, WebM o MOV.";
    }

    if (file.size > maxVideoSize) {
      return "El video no debe superar 100 MB.";
    }
  }

  return null;
}
