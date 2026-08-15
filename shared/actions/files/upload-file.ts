"use server";

import { FileType } from "@prisma/client";

import { getCloudinary } from "@/shared/lib/cloudinary";
import { FileRepository } from "@/shared/repositories/file.repository";
import { requireRole } from "@/shared/server/auth/helpers";
import { uploadFileSchema, validateFileForType } from "@/shared/validations";

type UploadResult = {
  ok: boolean;
  message: string;
  file?: {
    id: string;
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  };
};

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  bytes: number;
  format?: string;
  resource_type?: string;
};

export async function uploadPrivateFileAction(formData: FormData): Promise<UploadResult> {
  try {
    const session = await requireRole(["ARTESANA", "FACILITADORA", "ADMIN"]);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, message: "Selecciona un archivo valido." };
    }

    const parsed = uploadFileSchema.safeParse({
      type: formData.get("type") ?? FileType.IMAGE,
      altText: formData.get("altText") ?? undefined,
      folder: formData.get("folder") ?? undefined
    });

    if (!parsed.success) {
      return { ok: false, message: "Los datos del archivo no son validos." };
    }

    const validationError = validateFileForType(file, parsed.data.type);
    if (validationError) {
      return { ok: false, message: validationError };
    }

    const uploaded = await uploadToCloudinary(file, parsed.data.folder, parsed.data.type);
    const savedFile = await new FileRepository().create({
      url: uploaded.secure_url,
      provider: "cloudinary",
      publicId: uploaded.public_id,
      type: parsed.data.type,
      mimeType: file.type,
      size: uploaded.bytes || file.size,
      width: uploaded.width ?? null,
      height: uploaded.height ?? null,
      altText: parsed.data.altText ?? null,
      metadata: {
        originalName: file.name,
        format: uploaded.format,
        resourceType: uploaded.resource_type
      },
      ownerId: session.user.id
    });

    return {
      ok: true,
      message: "Archivo subido correctamente.",
      file: {
        id: savedFile.id,
        url: savedFile.url,
        altText: savedFile.altText,
        width: savedFile.width,
        height: savedFile.height
      }
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No fue posible subir el archivo."
    };
  }
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
        resource_type: file.type === FileType.IMAGE ? "image" : "raw"
      });
    }

    await repository.deleteOwned(file.id, session.user.id);

    return { ok: true, message: "Archivo eliminado correctamente." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "No fue posible eliminar el archivo."
    };
  }
}

async function uploadToCloudinary(file: File, folder: string, type: FileType) {
  const cloudinary = getCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());

  const resourceType =
    type === FileType.IMAGE ? "image" : type === FileType.VIDEO ? "video" : "raw";

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary no devolvio resultado."));
          return;
        }

        resolve(result as CloudinaryUploadResult);
      }
    );

    stream.end(buffer);
  });
}
