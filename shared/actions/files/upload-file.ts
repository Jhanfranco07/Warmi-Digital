"use server";

import { FileType, type File } from "@prisma/client";

import { env } from "@/shared/config/env";
import { getCloudinary } from "@/shared/lib/cloudinary";
import { FileRepository } from "@/shared/repositories/file.repository";
import { requireRole } from "@/shared/server/auth/helpers";
import {
  assertPublicIdBelongsToFolder,
  getCloudinaryResourceType,
  resolveUploadFolder
} from "@/shared/uploads/upload-limits";
import type {
  CloudinaryResourceType,
  CloudinaryUploadSignature,
  RegisteredUploadedFile,
  WarmiUploadType
} from "@/shared/uploads/upload-types";
import {
  cleanupCloudinaryUploadSchema,
  createUploadedFileRecordSchema,
  uploadSignatureSchema
} from "@/shared/validations";

type UploadResult = {
  ok: boolean;
  message: string;
  file?: RegisteredUploadedFile;
};

type UploadSignatureResult = {
  ok: boolean;
  message: string;
  signature?: CloudinaryUploadSignature;
};

type CleanupInput = {
  folder: string;
  publicId: string;
  resourceType: CloudinaryResourceType;
};

export async function getCloudinaryUploadSignatureAction(input: {
  folder?: string;
  type: WarmiUploadType;
}): Promise<UploadSignatureResult> {
  try {
    await requireRole(["ARTESANA", "FACILITADORA", "ADMIN"]);

    const parsed = uploadSignatureSchema.safeParse({
      folder: input.folder,
      type: input.type
    });

    if (!parsed.success) {
      return { ok: false, message: "No pudimos preparar esta subida." };
    }

    if (parsed.data.type === FileType.VIDEO) {
      return {
        ok: false,
        message: "La subida de videos propios esta deshabilitada. Usa YouTube."
      };
    }

    const folder = resolveUploadFolder(parsed.data.folder);
    const resourceType = getCloudinaryResourceType(
      parsed.data.type as WarmiUploadType
    );
    const timestamp = Math.round(Date.now() / 1000);
    const uploadParams = {
      folder,
      overwrite: "false" as const,
      timestamp: String(timestamp),
      unique_filename: "true" as const,
      use_filename: "true" as const
    };

    const cloudinary = getCloudinary();
    const apiKey = env.CLOUDINARY_API_KEY;
    const cloudName = env.CLOUDINARY_CLOUD_NAME;

    if (!apiKey || !cloudName || !env.CLOUDINARY_API_SECRET) {
      return { ok: false, message: "Cloudinary no esta configurado." };
    }

    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      env.CLOUDINARY_API_SECRET
    );

    return {
      ok: true,
      message: "Firma generada.",
      signature: {
        apiKey,
        cloudName,
        folder,
        resourceType,
        signature,
        timestamp,
        uploadParams,
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
      }
    };
  } catch {
    return {
      ok: false,
      message: "No pudimos preparar la subida. Intenta nuevamente."
    };
  }
}

export async function createUploadedFileRecordAction(input: {
  altText?: string;
  file: unknown;
}): Promise<UploadResult> {
  try {
    const session = await requireRole(["ARTESANA", "FACILITADORA", "ADMIN"]);
    const parsed = createUploadedFileRecordSchema.safeParse(input);

    if (!parsed.success) {
      return { ok: false, message: "No pudimos guardar los datos del archivo." };
    }

    if (parsed.data.file.type === FileType.VIDEO) {
      return {
        ok: false,
        message: "La subida de videos propios esta deshabilitada. Usa YouTube."
      };
    }

    assertPublicIdBelongsToFolder(parsed.data.file.publicId, parsed.data.file.folder);

    const savedFile = await new FileRepository().create({
      url: parsed.data.file.secureUrl,
      provider: "cloudinary",
      publicId: parsed.data.file.publicId,
      type: parsed.data.file.type,
      mimeType: parsed.data.file.mimeType,
      size: parsed.data.file.bytes,
      width: parsed.data.file.width ?? null,
      height: parsed.data.file.height ?? null,
      altText: parsed.data.altText ?? null,
      metadata: {
        directUpload: true,
        folder: parsed.data.file.folder,
        format: parsed.data.file.format ?? null,
        originalName: parsed.data.file.originalFilename,
        resourceType: parsed.data.file.resourceType,
        version: parsed.data.file.version ?? null
      },
      ownerId: session.user.id
    });

    return {
      ok: true,
      message: "Archivo listo.",
      file: toUploadedFileValue(savedFile)
    };
  } catch {
    return {
      ok: false,
      message: "Tu archivo se subio, pero no pudimos guardar los cambios."
    };
  }
}

export async function cleanupCloudinaryUploadAction(input: CleanupInput) {
  try {
    await requireRole(["ARTESANA", "FACILITADORA", "ADMIN"]);
    const parsed = cleanupCloudinaryUploadSchema.safeParse(input);

    if (!parsed.success) {
      return { ok: false, message: "No se pudo limpiar el archivo temporal." };
    }

    assertPublicIdBelongsToFolder(parsed.data.publicId, parsed.data.folder);
    await getCloudinary().uploader.destroy(parsed.data.publicId, {
      resource_type: parsed.data.resourceType
    });

    return { ok: true, message: "Archivo temporal eliminado." };
  } catch {
    return { ok: false, message: "No se pudo limpiar el archivo temporal." };
  }
}

export async function uploadPrivateFileAction(): Promise<UploadResult> {
  return {
    ok: false,
    message:
      "La subida directa esta activa. Selecciona el archivo nuevamente para subirlo de forma segura."
  };
}

export async function deletePrivateFileAction(fileId: string): Promise<UploadResult> {
  try {
    const session = await requireRole(["ARTESANA", "FACILITADORA", "ADMIN"]);
    const repository = new FileRepository();
    const file = await repository.findOwned(fileId, session.user.id);

    if (!file) {
      return { ok: false, message: "No tienes permiso para eliminar este archivo." };
    }

    if (file.provider === "cloudinary" && file.publicId) {
      await getCloudinary().uploader.destroy(file.publicId, {
        resource_type: getStoredResourceType(file)
      });
    }

    await repository.deleteOwned(file.id, session.user.id);

    return { ok: true, message: "Archivo eliminado correctamente." };
  } catch {
    return {
      ok: false,
      message: "No fue posible eliminar el archivo."
    };
  }
}

function toUploadedFileValue(file: File): RegisteredUploadedFile {
  return {
    id: file.id,
    url: file.url,
    altText: file.altText,
    width: file.width,
    height: file.height
  };
}

function getStoredResourceType(file: File): Exclude<CloudinaryResourceType, "auto"> {
  const metadata = file.metadata;

  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const value = (metadata as Record<string, unknown>).resourceType;
    if (value === "image" || value === "video" || value === "raw") return value;
  }

  if (file.type === FileType.IMAGE) return "image";
  if (file.type === FileType.VIDEO || file.type === FileType.AUDIO) return "video";
  return "raw";
}
