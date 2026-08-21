"use client";

import {
  cleanupCloudinaryUploadAction,
  createUploadedFileRecordAction,
  getCloudinaryUploadSignatureAction
} from "@/shared/actions/files/upload-file";
import { validateUploadFile } from "@/shared/uploads/upload-limits";
import type {
  CloudinaryUploadResponse,
  RegisteredUploadedFile,
  UploadedCloudinaryMetadata,
  WarmiUploadType
} from "@/shared/uploads/upload-types";

type UploadFileToCloudinaryInput = {
  altText?: string;
  file: File;
  folder?: string;
  onProgress?: (progress: number) => void;
  type: WarmiUploadType;
};

export async function uploadFileToCloudinary({
  altText,
  file,
  folder,
  onProgress,
  type
}: UploadFileToCloudinaryInput): Promise<RegisteredUploadedFile> {
  const validationError = validateUploadFile(file, type);
  if (validationError) throw new Error(validationError);

  onProgress?.(1);

  const signature = await getCloudinaryUploadSignatureAction({ folder, type });
  if (!signature.ok || !signature.signature) {
    throw new Error(signature.message);
  }

  const cloudinaryResult = await uploadWithProgress(
    signature.signature.uploadUrl,
    file,
    signature.signature,
    onProgress
  );

  const metadata: UploadedCloudinaryMetadata = {
    bytes: cloudinaryResult.bytes || file.size,
    folder: signature.signature.folder,
    format: cloudinaryResult.format ?? null,
    height: cloudinaryResult.height ?? null,
    mimeType: file.type,
    originalFilename: cloudinaryResult.original_filename ?? file.name,
    publicId: cloudinaryResult.public_id,
    resourceType: cloudinaryResult.resource_type ?? signature.signature.resourceType,
    secureUrl: cloudinaryResult.secure_url,
    type,
    url: cloudinaryResult.url ?? null,
    version: cloudinaryResult.version ?? null,
    width: cloudinaryResult.width ?? null
  };

  const saved = await createUploadedFileRecordAction({ altText, file: metadata });

  if (!saved.ok || !saved.file) {
    await cleanupCloudinaryUploadAction({
      folder: metadata.folder,
      publicId: metadata.publicId,
      resourceType: metadata.resourceType
    });
    throw new Error(saved.message);
  }

  onProgress?.(100);
  return saved.file;
}

function uploadWithProgress(
  uploadUrl: string,
  file: File,
  signature: Awaited<
    ReturnType<typeof getCloudinaryUploadSignatureAction>
  >["signature"],
  onProgress?: (progress: number) => void
) {
  return new Promise<CloudinaryUploadResponse>((resolve, reject) => {
    if (!signature) {
      reject(new Error("No pudimos preparar la subida. Intenta nuevamente."));
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("api_key", signature.apiKey);
    formData.set("folder", signature.uploadParams.folder);
    formData.set("overwrite", signature.uploadParams.overwrite);
    formData.set("timestamp", signature.uploadParams.timestamp);
    formData.set("unique_filename", signature.uploadParams.unique_filename);
    formData.set("use_filename", signature.uploadParams.use_filename);
    formData.set("signature", signature.signature);

    const request = new XMLHttpRequest();
    request.open("POST", uploadUrl);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const progress = Math.min(98, Math.round((event.loaded / event.total) * 100));
      onProgress?.(progress);
    };

    request.onerror = () => {
      reject(
        new Error("No pudimos subir tu archivo. Revisa tu conexion e intenta nuevamente.")
      );
    };

    request.onload = () => {
      try {
        const response = JSON.parse(request.responseText || "{}") as
          | CloudinaryUploadResponse
          | { error?: { message?: string } };

        if (request.status < 200 || request.status >= 300 || "error" in response) {
          reject(new Error("No pudimos subir tu archivo. Intenta nuevamente."));
          return;
        }

        resolve(response as CloudinaryUploadResponse);
      } catch {
        reject(new Error("No pudimos confirmar la subida del archivo."));
      }
    };

    request.send(formData);
  });
}

