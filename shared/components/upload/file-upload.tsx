"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/shared/lib/utils";
import { uploadFileToCloudinary } from "@/shared/uploads/cloudinary-client-upload";
import { getAcceptForUploadType, validateUploadFile } from "@/shared/uploads/upload-limits";
import type { UploadState, WarmiUploadType } from "@/shared/uploads/upload-types";

export type UploadedFileValue = {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type FileUploadProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange" | "value"
> & {
  label?: string;
  description?: string;
  uploadType?: WarmiUploadType;
  folder?: string;
  altText?: string;
  previewUrl?: string | null;
  uploadOnSelect?: boolean;
  onFileSelected?: (file: File) => void;
  onUploaded?: (file: UploadedFileValue) => void;
  onRemove?: () => void;
};

export function FileUpload({
  label = "Subir archivo",
  description,
  className,
  accept,
  uploadType = "DOCUMENT",
  folder = "warmi/private",
  altText,
  previewUrl,
  uploadOnSelect = true,
  onFileSelected,
  onUploaded,
  onRemove,
  disabled,
  ...props
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activePreview = localPreview ?? previewUrl ?? null;
  const isUploading = status === "validating" || status === "uploading";

  const helperText = useMemo(() => {
    if (status === "validating") return "Validando archivo...";
    if (status === "uploading") return `Subiendo archivo... ${progress}%`;
    if (status === "completed") return "Archivo listo.";
    if (status === "error") return errorMessage ?? "No pudimos subir el archivo.";
    return fileName ?? description;
  }, [description, errorMessage, fileName, progress, status]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  async function handleFile(file: File) {
    if (isUploading) return;

    setStatus("validating");
    setProgress(0);
    setErrorMessage(null);

    const validationError = validateUploadFile(file, uploadType);
    if (validationError) {
      setFileName(file.name);
      setStatus("error");
      setErrorMessage(validationError);
      toast.error(validationError);
      return;
    }

    setFileName(file.name);
    onFileSelected?.(file);

    if (file.type.startsWith("image/")) {
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(URL.createObjectURL(file));
    }

    if (!uploadOnSelect) {
      setStatus("completed");
      return;
    }

    try {
      setStatus("uploading");
      const result = await uploadFileToCloudinary({
        altText,
        file,
        folder,
        onProgress: setProgress,
        type: uploadType
      });
      setProgress(100);
      setStatus("completed");
      toast.success("Archivo listo.");
      onUploaded?.(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos subir tu archivo. Intenta nuevamente.";
      setStatus("error");
      setErrorMessage(message);
      toast.error(message);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <label
        className={cn(
          "group relative flex min-h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-surface-low px-4 py-6 text-center transition-colors hover:bg-surface-container",
          (disabled || isUploading) && "pointer-events-none opacity-60"
        )}
      >
        {activePreview ? (
          <span
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${activePreview})` }}
            aria-hidden="true"
          />
        ) : null}
        {activePreview ? <span className="absolute inset-0 bg-black/30" /> : null}

        <span className="relative z-10 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-primary shadow-sm">
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : activePreview ? (
            <Upload className="h-5 w-5" aria-hidden="true" />
          ) : (
            <FileText className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
        <span className="relative z-10 mt-3 text-label-ui font-semibold text-foreground">
          {label}
        </span>
        {helperText ? (
          <span className="relative z-10 mt-1 text-caption text-muted-foreground">
            {helperText}
          </span>
        ) : null}
        {isUploading ? (
          <span className="relative z-10 mt-3 h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-white/60">
            <span
              className="block h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </span>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept ?? getAcceptForUploadType(uploadType)}
          disabled={disabled || isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
          }}
          {...props}
        />
      </label>

      {(activePreview || fileName) && onRemove ? (
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-destructive"
          onClick={() => {
            setFileName(null);
            setLocalPreview(null);
            setProgress(0);
            setStatus("idle");
            setErrorMessage(null);
            if (inputRef.current) inputRef.current.value = "";
            onRemove();
          }}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Eliminar archivo
        </button>
      ) : null}
    </div>
  );
}
