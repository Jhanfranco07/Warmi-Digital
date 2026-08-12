"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { createCourseAction } from "@/shared/actions/facilitator/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
export function CourseEditor() {
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={(data) =>
        startTransition(async () => {
          const response = await createCourseAction(null, data);
          response.ok ? toast.success(response.message) : toast.error(response.message);
        })
      }
      className="grid gap-4"
    >
      <label className="grid gap-2">
        Nombre
        <Input name="title" required />
      </label>
      <label className="grid gap-2">
        Descripción
        <Textarea name="description" />
      </label>
      <label className="grid gap-2">
        Nivel
        <select name="level" className="h-10 rounded-md border bg-background px-3">
          <option value="BEGINNER">Inicial</option>
          <option value="INTERMEDIATE">Intermedio</option>
          <option value="ADVANCED">Avanzado</option>
        </select>
      </label>
      <label className="grid gap-2">
        Estado
        <select name="status" className="h-10 rounded-md border bg-background px-3">
          <option value="DRAFT">Borrador</option>
          <option value="PUBLISHED">Publicado</option>
        </select>
      </label>
      <Button type="submit" disabled={pending}>
        Crear curso
      </Button>
    </form>
  );
}
