"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateStoryAction } from "@/shared/actions/artisan/update-story";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  storyFormSchema,
  type StoryFormInput
} from "@/shared/validations/artisan-schemas";

type StoryFormProps = {
  defaultValues: Partial<StoryFormInput>;
  communities: Array<{ id: string; name: string }>;
  craftTypes: Array<{ id: string; name: string }>;
};

export function StoryForm({ defaultValues, communities, craftTypes }: StoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<StoryFormInput>({
    resolver: zodResolver(storyFormSchema),
    defaultValues
  });

  function onSubmit(values: StoryFormInput) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.set(key, value ?? "");
    });

    startTransition(async () => {
      const result = await updateStoryAction({ ok: false, message: "" }, formData);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identidad cultural</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre público" error={errors.publicName?.message}>
            <Input {...register("publicName")} placeholder="Cómo quieres aparecer" />
          </Field>
          <Field label="Titulo de tu historia" error={errors.title?.message}>
            <Input {...register("title")} placeholder="Mi camino con el tejido" />
          </Field>
          <Field label="Comunidad" error={errors.communityId?.message}>
            <Select
              value={watch("communityId") || ""}
              onValueChange={(value) => setValue("communityId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu comunidad" />
              </SelectTrigger>
              <SelectContent>
                {communities.map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Especialidad" error={errors.craftTypeId?.message}>
            <Select
              value={watch("craftTypeId") || ""}
              onValueChange={(value) => setValue("craftTypeId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu técnica" />
              </SelectTrigger>
              <SelectContent>
                {craftTypes.map((craftType) => (
                  <SelectItem key={craftType.id} value={craftType.id}>
                    {craftType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Fotografia o imagen" error={errors.coverImageUrl?.message}>
            <Input
              {...register("coverImageUrl")}
              placeholder="https://..."
              inputMode="url"
            />
          </Field>
          <Field label="Resumen breve" error={errors.summary?.message}>
            <Input {...register("summary")} placeholder="Una frase sobre tu historia" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patrimonio vivo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="Tu historia personal" error={errors.personalStory?.message}>
            <Textarea {...register("personalStory")} rows={4} />
          </Field>
          <Field label="Tu trayectoria artesanal" error={errors.artisanJourney?.message}>
            <Textarea {...register("artisanJourney")} rows={4} />
          </Field>
          <Field
            label="Origen de tu conocimiento"
            error={errors.knowledgeOrigin?.message}
          >
            <Textarea {...register("knowledgeOrigin")} rows={3} />
          </Field>
          <Field label="De quien aprendiste" error={errors.learnedFrom?.message}>
            <Input {...register("learnedFrom")} />
          </Field>
          <Field label="Tecnicas utilizadas" error={errors.techniques?.message}>
            <Textarea {...register("techniques")} rows={3} />
          </Field>
          <Field
            label="Significado cultural de tu trabajo"
            error={errors.culturalMeaning?.message}
          >
            <Textarea {...register("culturalMeaning")} rows={4} />
          </Field>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={isPending} className="min-h-touch-target">
        <Save className="h-5 w-5" />
        Guardar mi historia
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-body-md font-medium">
      {label}
      {children}
      {error ? <span className="text-body-sm text-destructive">{error}</span> : null}
    </label>
  );
}
