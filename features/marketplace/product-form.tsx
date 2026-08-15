"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createProductAction } from "@/shared/actions/marketplace/actions";
import { ImageUpload } from "@/shared/components/upload/image-upload";
import type { UploadedFileValue } from "@/shared/components/upload/file-upload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

export function ProductForm({
  categories,
  craftTypes
}: {
  categories: Array<{ id: string; name: string }>;
  craftTypes: Array<{ id: string; name: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const [mainImage, setMainImage] = useState<UploadedFileValue | null>(null);

  return (
    <form
      action={(d) =>
        startTransition(async () => {
          const r = await createProductAction(null, d);
          if (r.ok) {
            toast.success(r.message);
          } else {
            toast.error(r.message);
          }
        })
      }
      className="grid gap-4"
    >
      <ImageUpload
        folder="warmi/products"
        label="Subir foto principal"
        description="Esta foto se mostrara en tu vitrina cuando publiques la pieza."
        altText="Foto principal de la pieza artesanal"
        onUploaded={setMainImage}
        onRemove={() => setMainImage(null)}
      />
      {mainImage ? (
        <input type="hidden" name="mainImageFileId" value={mainImage.id} />
      ) : null}
      <Input name="name" placeholder="Nombre de la pieza" required />
      <select name="categoryId" className="h-10 rounded-md border bg-background px-3">
        {categories.map((x) => (
          <option key={x.id} value={x.id}>
            {x.name}
          </option>
        ))}
      </select>
      <select name="craftTypeId" className="h-10 rounded-md border bg-background px-3">
        {craftTypes.map((x) => (
          <option key={x.id} value={x.id}>
            {x.name}
          </option>
        ))}
      </select>
      <Input name="culturalPhrase" placeholder="Frase cultural" />
      <Textarea name="story" placeholder="Historia de la pieza" />
      <Textarea name="culturalMeaning" placeholder="Significado cultural" />
      <Input name="technique" placeholder="Tecnica" />
      <Input name="materials" placeholder="Materiales" />
      <Input name="makingTime" placeholder="Tiempo de elaboracion" />
      <Input name="price" type="number" min="1" placeholder="Precio" required />
      <select name="status" className="h-10 rounded-md border bg-background px-3">
        <option value="DRAFT">Guardar borrador</option>
        <option value="PUBLISHED">Publicar</option>
      </select>
      <Button type="submit" disabled={pending}>
        Guardar pieza
      </Button>
    </form>
  );
}
