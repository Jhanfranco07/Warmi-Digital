import { Upload } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export type FileUploadProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  description?: string;
};

export function FileUpload({
  label = "Subir archivo",
  description,
  className,
  ...props
}: FileUploadProps) {
  return (
    <label
      className={cn(
        "flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-low px-4 py-6 text-center transition-colors hover:bg-surface-container",
        className
      )}
    >
      <Upload className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
      <span className="text-label-ui font-semibold">{label}</span>
      {description ? (
        <span className="mt-1 text-caption text-muted-foreground">{description}</span>
      ) : null}
      <input type="file" className="sr-only" {...props} />
    </label>
  );
}
