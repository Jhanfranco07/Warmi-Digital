import type { CloudinaryResourceType, WarmiUploadType } from "@/shared/uploads/upload-types";

type UploadRule = {
  accept: readonly string[];
  extensions: readonly string[];
  maxBytes: number;
  maxLabel: string;
};

export const allowedUploadFolders = [
  "warmi/private",
  "warmi/avatars",
  "warmi/gallery",
  "warmi/products",
  "warmi/stories",
  "warmi/learning",
  "warmi/courses",
  "warmi/modules",
  "warmi/lesson-resources"
] as const;

export type AllowedUploadFolder = (typeof allowedUploadFolders)[number];

export const uploadRules: Record<WarmiUploadType, UploadRule> = {
  IMAGE: {
    accept: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxBytes: 5 * 1024 * 1024,
    maxLabel: "5 MB"
  },
  DOCUMENT: {
    accept: ["application/pdf"],
    extensions: [".pdf"],
    maxBytes: 20 * 1024 * 1024,
    maxLabel: "20 MB"
  },
  AUDIO: {
    accept: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"],
    extensions: [".mp3", ".wav", ".ogg"],
    maxBytes: 30 * 1024 * 1024,
    maxLabel: "30 MB"
  },
  CERTIFICATE: {
    accept: ["application/pdf"],
    extensions: [".pdf"],
    maxBytes: 20 * 1024 * 1024,
    maxLabel: "20 MB"
  },
  OTHER: {
    accept: ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"],
    extensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
    maxBytes: 10 * 1024 * 1024,
    maxLabel: "10 MB"
  },
  VIDEO: {
    accept: [],
    extensions: [],
    maxBytes: 0,
    maxLabel: "0 MB"
  }
};

export function isAllowedUploadFolder(folder: string): folder is AllowedUploadFolder {
  return allowedUploadFolders.includes(folder as AllowedUploadFolder);
}

export function resolveUploadFolder(folder?: string | null): AllowedUploadFolder {
  if (!folder) return "warmi/private";
  if (isAllowedUploadFolder(folder)) return folder;
  throw new Error("La carpeta de subida no esta permitida.");
}

export function getUploadRule(type: WarmiUploadType) {
  return uploadRules[type] ?? uploadRules.OTHER;
}

export function getAcceptForUploadType(type: WarmiUploadType) {
  return getUploadRule(type).accept.join(",");
}

export function getCloudinaryResourceType(type: WarmiUploadType): CloudinaryResourceType {
  if (type === "IMAGE") return "image";
  if (type === "AUDIO") return "video";
  return "raw";
}

export function validateUploadFile(file: File, type: WarmiUploadType) {
  if (type === "VIDEO") {
    return "La subida de videos propios esta deshabilitada. Usa un enlace de YouTube.";
  }

  const rule = getUploadRule(type);
  const extension = file.name.includes(".")
    ? `.${file.name.split(".").pop()?.toLowerCase()}`
    : "";

  if (!rule.accept.includes(file.type) || !rule.extensions.includes(extension)) {
    if (type === "IMAGE") return "Este tipo de imagen no esta permitido.";
    if (type === "DOCUMENT" || type === "CERTIFICATE") {
      return "Solo se permiten documentos PDF.";
    }
    if (type === "AUDIO") return "Solo se permiten audios MP3, WAV u OGG.";
    return "Este tipo de archivo no esta permitido.";
  }

  if (file.size > rule.maxBytes) {
    if (type === "IMAGE") {
      return `Esta imagen es demasiado grande. Selecciona una de hasta ${rule.maxLabel}.`;
    }

    return `El archivo es demasiado grande. Selecciona uno de hasta ${rule.maxLabel}.`;
  }

  return null;
}

export function assertPublicIdBelongsToFolder(publicId: string, folder: string) {
  if (!isAllowedUploadFolder(folder) || !publicId.startsWith(`${folder}/`)) {
    throw new Error("El archivo no pertenece a una carpeta permitida.");
  }
}

