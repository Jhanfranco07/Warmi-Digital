import { FileUpload, type FileUploadProps } from "@/shared/components/upload/file-upload";

export function ImageUpload(props: FileUploadProps) {
  return (
    <FileUpload
      accept="image/jpeg,image/jpg,image/png,image/webp"
      uploadType="IMAGE"
      label={props.label ?? "Subir imagen"}
      description={props.description ?? "JPG, PNG o WebP hasta 5 MB"}
      {...props}
    />
  );
}
