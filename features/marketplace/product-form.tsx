"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ImagePlus,
  Loader2,
  Palette,
  Sparkles,
  Tag
} from "lucide-react";
import { toast } from "sonner";

import {
  createProductAction,
  updateProductAction
} from "@/shared/actions/marketplace/actions";
import { ImageUpload } from "@/shared/components/upload/image-upload";
import type { UploadedFileValue } from "@/shared/components/upload/file-upload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

type ProductOption = { id: string; name: string };

type ProductFormInitialValue = {
  id: string;
  name: string;
  categoryId: string;
  craftTypeId: string;
  culturalPhrase: string;
  story: string;
  culturalMeaning: string;
  description: string;
  technique: string;
  materials: string;
  makingTime: string;
  price: number;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "UNAVAILABLE" | "ARCHIVED";
  imageUrl: string | null;
};

type ProductFormProps = {
  categories: ProductOption[];
  craftTypes: ProductOption[];
  mode?: "create" | "edit";
  initialValue?: ProductFormInitialValue;
};

export function ProductForm({
  categories,
  craftTypes,
  mode = "create",
  initialValue
}: ProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mainImage, setMainImage] = useState<UploadedFileValue | null>(null);
  const [removeMainImage, setRemoveMainImage] = useState(false);
  const [name, setName] = useState(initialValue?.name ?? "");
  const [story, setStory] = useState(initialValue?.story ?? "");
  const [price, setPrice] = useState(
    initialValue?.price ? String(initialValue.price) : ""
  );
  const isEditing = mode === "edit" && Boolean(initialValue);
  const hasVisibleImage = Boolean(mainImage || (initialValue?.imageUrl && !removeMainImage));

  const checklist = useMemo(
    () => [
      {
        label: "Foto principal",
        done: hasVisibleImage,
        helper: "Ayuda a reconocer tu pieza en la vitrina."
      },
      {
        label: "Nombre de la pieza",
        done: name.trim().length > 2,
        helper: "Usa un nombre claro y cultural."
      },
      {
        label: "Historia",
        done: story.trim().length > 12,
        helper: "Cuenta de dónde viene y qué significa."
      },
      {
        label: "Precio",
        done: Number(price) > 0,
        helper: "Déjalo listo para cuando publiques."
      }
    ],
    [hasVisibleImage, name, price, story]
  );

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const result = isEditing
            ? await updateProductAction(null, formData)
            : await createProductAction(null, formData);

          if (result.ok) {
            toast.success(result.message);
            router.push("/artesana/mi-vitrina");
            router.refresh();
            return;
          }

          toast.error(result.message);
        })
      }
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]"
    >
      {isEditing ? (
        <input type="hidden" name="productId" value={initialValue?.id} />
      ) : null}
      {removeMainImage ? <input type="hidden" name="removeMainImage" value="true" /> : null}

      <div className="space-y-5">
        <section className="overflow-hidden rounded-[28px] border border-[#f0c3cf] bg-white shadow-[0_18px_48px_rgba(122,16,66,0.08)]">
          <div className="border-b border-[#f5d2dc] bg-[linear-gradient(135deg,#fff4f8_0%,#fffaf6_58%,#fff1e5_100%)] px-5 py-5 sm:px-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#b5245b] text-white shadow-[0_12px_26px_rgba(181,36,91,0.25)]">
                <ImagePlus className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="font-ui text-xs font-extrabold uppercase tracking-[0.14em] text-[#b5245b]">
                  {isEditing ? "Imagen de la vitrina" : "Primer paso"}
                </p>
                <h2 className="font-serif text-3xl font-bold text-[#1b1c1a]">
                  Foto que abre tu historia
                </h2>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5b4a42]">
              Elige una imagen luminosa de la pieza. Esta será la primera señal que
              verán en tu vitrina cultural.
            </p>
          </div>
          <div className="p-5 sm:p-7">
            <ImageUpload
              folder="warmi/products"
              label={isEditing ? "Cambiar foto principal" : "Subir foto principal"}
              description="JPG, PNG o WebP. Si puedes, toma la foto cerca de luz natural."
              altText="Foto principal de la pieza artesanal"
              previewUrl={removeMainImage ? null : initialValue?.imageUrl}
              onUploaded={(file) => {
                setRemoveMainImage(false);
                setMainImage(file);
              }}
              onRemove={() => {
                setMainImage(null);
                setRemoveMainImage(true);
              }}
              className="[&>label]:min-h-[260px] [&>label]:rounded-[24px] [&>label]:border-[#f0c3cf] [&>label]:bg-[#fffaf6] [&>label]:transition-all [&>label]:duration-300 hover:[&>label]:border-[#b5245b] hover:[&>label]:shadow-[0_18px_42px_rgba(181,36,91,0.12)]"
            />
            {mainImage ? (
              <input type="hidden" name="mainImageFileId" value={mainImage.id} />
            ) : null}
          </div>
        </section>

        <SectionCard
          eyebrow="Identidad cultural"
          title="Cómo se presenta la pieza"
          icon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre de la pieza" className="md:col-span-2">
              <Input
                name="name"
                placeholder="Ej. Camino de los Apus"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="min-h-12 rounded-2xl border-[#e8c4b1] bg-[#fffdf9] px-4 text-base focus-visible:ring-[#b5245b]"
              />
            </Field>

            <SelectField
              label="Familia de la pieza"
              name="categoryId"
              options={categories}
              placeholder="Ej. Textiles, cerámica o accesorios"
              defaultValue={initialValue?.categoryId}
              required
            />

            <SelectField
              label="Técnica artesanal principal"
              name="craftTypeId"
              options={craftTypes}
              placeholder="Ej. Tejido, bordado o cerámica"
              defaultValue={initialValue?.craftTypeId}
              required
            />

            <Field label="Frase cultural" className="md:col-span-2">
              <Input
                name="culturalPhrase"
                placeholder="Ej. Tejida para cuidar lo que es sagrado."
                defaultValue={initialValue?.culturalPhrase}
                className="min-h-12 rounded-2xl border-[#e8c4b1] bg-[#fffdf9] px-4 text-base focus-visible:ring-[#b5245b]"
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Historia"
          title="Lo que hace única a tu pieza"
          icon={<FileText className="h-5 w-5" aria-hidden="true" />}
        >
          <div className="grid gap-4">
            <Field label="Historia de la pieza">
              <Textarea
                name="story"
                placeholder="Cuenta quién te enseñó, qué representa o de qué momento nació esta pieza."
                value={story}
                onChange={(event) => setStory(event.target.value)}
                className="min-h-36 rounded-2xl border-[#e8c4b1] bg-[#fffdf9] px-4 py-3 text-base leading-7 focus-visible:ring-[#b5245b]"
              />
            </Field>

            <Field label="Significado cultural">
              <Textarea
                name="culturalMeaning"
                placeholder="Explica los colores, símbolos, materiales o memoria que guarda esta creación."
                defaultValue={initialValue?.culturalMeaning}
                className="min-h-32 rounded-2xl border-[#e8c4b1] bg-[#fffdf9] px-4 py-3 text-base leading-7 focus-visible:ring-[#b5245b]"
              />
            </Field>

            <Field label="Descripción corta para compradores">
              <Textarea
                name="description"
                placeholder="Resume la pieza en pocas palabras para quienes la vean en la vitrina."
                defaultValue={initialValue?.description}
                className="min-h-28 rounded-2xl border-[#e8c4b1] bg-[#fffdf9] px-4 py-3 text-base leading-7 focus-visible:ring-[#b5245b]"
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Detalles"
          title="Materiales, técnica y precio"
          icon={<Palette className="h-5 w-5" aria-hidden="true" />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Detalle técnico opcional">
              <Input
                name="technique"
                placeholder="Ej. Tejido en telar de cintura"
                defaultValue={initialValue?.technique}
                className="min-h-12 rounded-2xl border-[#e8c4b1] bg-[#fffdf9] px-4 text-base focus-visible:ring-[#b5245b]"
              />
            </Field>

            <Field label="Materiales">
              <Input
                name="materials"
                placeholder="Ej. Lana de oveja y tintes naturales"
                defaultValue={initialValue?.materials}
                className="min-h-12 rounded-2xl border-[#e8c4b1] bg-[#fffdf9] px-4 text-base focus-visible:ring-[#b5245b]"
              />
            </Field>

            <Field label="Tiempo de elaboración">
              <Input
                name="makingTime"
                placeholder="Ej. 5 días"
                defaultValue={initialValue?.makingTime}
                className="min-h-12 rounded-2xl border-[#e8c4b1] bg-[#fffdf9] px-4 text-base focus-visible:ring-[#b5245b]"
              />
            </Field>

            <Field label="Precio referencial">
              <Input
                name="price"
                type="number"
                min="1"
                placeholder="S/ 120"
                required
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="min-h-12 rounded-2xl border-[#e8c4b1] bg-[#fffdf9] px-4 text-base focus-visible:ring-[#b5245b]"
              />
            </Field>
          </div>
        </SectionCard>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="overflow-hidden rounded-[28px] border border-[#f0c3cf] bg-white shadow-[0_24px_70px_rgba(122,16,66,0.12)]">
          <div className="bg-[linear-gradient(135deg,#b5245b_0%,#7a1042_100%)] px-6 py-6 text-white">
            <p className="font-ui text-xs font-extrabold uppercase tracking-[0.16em] text-white/80">
              Guía Warmi
            </p>
            <h3 className="mt-2 font-serif text-3xl font-bold">
              {isEditing ? "Revisa los cambios" : "Revisa antes de guardar"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/85">
              {isEditing
                ? "Puedes corregir datos, cambiar la foto o volver la pieza a borrador."
                : "Puedes guardar en borrador y completar la información con calma."}
            </p>
          </div>

          <div className="space-y-4 p-6">
            {checklist.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex gap-3 rounded-2xl border p-4 transition-colors",
                  item.done
                    ? "border-[#d5ecd1] bg-[#f4fbf2]"
                    : "border-[#f5d2dc] bg-[#fffaf6]"
                )}
              >
                <CheckCircle2
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    item.done ? "text-[#2f8f46]" : "text-[#d8b899]"
                  )}
                  aria-hidden="true"
                />
                <div>
                  <p className="font-ui text-sm font-extrabold text-[#1b1c1a]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#5b4a42]">
                    {item.helper}
                  </p>
                </div>
              </div>
            ))}

            <Field label="Estado de publicación">
              <select
                name="status"
                defaultValue={initialValue?.status ?? "DRAFT"}
                className="min-h-12 w-full rounded-2xl border border-[#e8c4b1] bg-[#fffdf9] px-4 text-base text-[#1b1c1a] outline-none transition focus:border-[#b5245b] focus:ring-2 focus:ring-[#b5245b]/20"
              >
                <option value="DRAFT">Guardar como borrador</option>
                <option value="PUBLISHED">Publicar en mi vitrina</option>
                <option value="UNAVAILABLE">Pausar publicación</option>
                <option value="ARCHIVED">Archivar pieza</option>
              </select>
            </Field>

            <Button
              type="submit"
              disabled={pending}
              className="min-h-[52px] w-full rounded-full bg-[#b5245b] px-6 text-base text-white shadow-[0_18px_34px_rgba(181,36,91,0.24)] hover:bg-[#941747]"
            >
              {pending ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <Tag className="h-5 w-5" aria-hidden="true" />
              )}
              {pending
                ? isEditing
                  ? "Actualizando pieza..."
                  : "Guardando pieza..."
                : isEditing
                  ? "Guardar cambios"
                  : "Guardar pieza"}
              {!pending ? <ArrowRight className="h-5 w-5" aria-hidden="true" /> : null}
            </Button>
          </div>
        </div>
      </aside>
    </form>
  );
}

function SectionCard({
  eyebrow,
  title,
  icon,
  children
}: {
  eyebrow: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#f0c3cf] bg-white shadow-[0_18px_48px_rgba(122,16,66,0.07)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#f5d2dc] bg-[#fffaf6] px-5 py-5 sm:px-7">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ffe6ee] text-[#b5245b]">
          {icon}
        </span>
        <div>
          <p className="font-ui text-xs font-extrabold uppercase tracking-[0.14em] text-[#b5245b]">
            {eyebrow}
          </p>
          <h2 className="font-serif text-2xl font-bold text-[#7a3100] md:text-3xl">
            {title}
          </h2>
        </div>
      </div>
      <div className="p-5 sm:p-7">{children}</div>
    </section>
  );
}

function Field({
  label,
  className,
  children
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="font-ui text-sm font-extrabold text-[#6b4031]">{label}</span>
      {children}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  placeholder,
  defaultValue,
  required
}: {
  label: string;
  name: string;
  options: ProductOption[];
  placeholder: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <Field label={label}>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="min-h-12 w-full rounded-2xl border border-[#e8c4b1] bg-[#fffdf9] px-4 text-base text-[#1b1c1a] outline-none transition focus:border-[#b5245b] focus:ring-2 focus:ring-[#b5245b]/20"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </Field>
  );
}
