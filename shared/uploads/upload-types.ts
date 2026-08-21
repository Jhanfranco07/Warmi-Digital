export type WarmiUploadType =
  | "IMAGE"
  | "DOCUMENT"
  | "AUDIO"
  | "VIDEO"
  | "CERTIFICATE"
  | "OTHER";

export type CloudinaryResourceType = "image" | "video" | "raw" | "auto";

export type UploadState = "idle" | "validating" | "uploading" | "completed" | "error";

export type CloudinaryUploadSignature = {
  apiKey: string;
  cloudName: string;
  folder: string;
  resourceType: CloudinaryResourceType;
  signature: string;
  timestamp: number;
  uploadUrl: string;
  uploadParams: {
    folder: string;
    overwrite: "false";
    timestamp: string;
    unique_filename: "true";
    use_filename: "true";
  };
};

export type CloudinaryUploadResponse = {
  secure_url: string;
  url?: string;
  public_id: string;
  original_filename?: string;
  format?: string;
  resource_type?: CloudinaryResourceType;
  bytes: number;
  width?: number;
  height?: number;
  version?: number;
};

export type UploadedCloudinaryMetadata = {
  bytes: number;
  folder: string;
  format?: string | null;
  height?: number | null;
  mimeType: string;
  originalFilename: string;
  publicId: string;
  resourceType: CloudinaryResourceType;
  secureUrl: string;
  type: WarmiUploadType;
  url?: string | null;
  version?: number | null;
  width?: number | null;
};

export type RegisteredUploadedFile = {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

