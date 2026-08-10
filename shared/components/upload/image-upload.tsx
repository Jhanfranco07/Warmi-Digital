import { FileUpload, type FileUploadProps } from "@/shared/components/upload/file-upload";

export function ImageUpload(props: FileUploadProps) {
  return (
    <FileUpload
      accept="image/*"
      label={props.label ?? "Subir imagen"}
      description={props.description ?? "PNG, JPG o WebP"}
      {...props}
    />
  );
}
