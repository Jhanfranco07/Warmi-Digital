"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { completeLessonAction } from "@/shared/actions/artisan/complete-lesson";
import { Button } from "@/shared/components/ui/button";

export function Module1Completion({
  courseId,
  lessonId,
  completed,
  nextHref,
  last
}: {
  courseId: string;
  lessonId: string;
  completed: boolean;
  nextHref: Route;
  last: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      disabled={pending}
      className="h-auto min-h-12 w-full whitespace-normal rounded-md bg-[#b5245b] px-5 py-3 text-base font-bold text-white hover:bg-[#941747] sm:w-auto"
      onClick={() =>
        startTransition(async () => {
          if (!completed) {
            try {
              const result = await completeLessonAction(courseId, lessonId);
              if (!result.ok) {
                toast.error(result.message);
                return;
              }
            } catch {
              toast.error(
                "No se pudo guardar tu avance. Revisa tu conexión e inténtalo otra vez."
              );
              return;
            }
          }
          router.push(nextHref);
          router.refresh();
        })
      }
    >
      {pending ? (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
      ) : last ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <ArrowRight className="h-5 w-5 shrink-0" />
      )}
      {pending
        ? "Guardando tu avance…"
        : last
          ? "Finalizar Módulo 1"
          : completed
            ? "Continuar a la siguiente sesión"
            : "Completar sesión y continuar"}
    </Button>
  );
}
