"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { completeLessonAction } from "@/shared/actions/artisan/complete-lesson";
import { Button } from "@/shared/components/ui/button";

type LessonCompletionButtonProps = {
  courseId: string;
  lessonId: string;
  completed?: boolean;
  courseHref?: Route;
};

export function LessonCompletionButton({
  courseId,
  lessonId,
  completed = false,
  courseHref
}: LessonCompletionButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(completed);

  function handleComplete() {
    startTransition(async () => {
      const result = await completeLessonAction(courseId, lessonId);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setIsCompleted(true);
      toast.success(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button
        type="button"
        size="lg"
        onClick={handleComplete}
        disabled={isPending || isCompleted}
        className="min-h-touch-target"
      >
        <CheckCircle2 className="h-5 w-5" />
        {isCompleted ? "Lección completada" : "Marcar como completada"}
      </Button>
      {isCompleted ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-body-md font-medium text-success"
        >
          Buen avance. Tu ruta sigue creciendo.
        </motion.p>
      ) : null}
      {isCompleted && courseHref ? (
        <Button
          asChild
          variant="outline"
          size="lg"
          className="min-h-touch-target border-[#b5245b] text-[#b5245b]"
        >
          <Link href={courseHref}>
            <ArrowLeft className="h-5 w-5" />
            Volver al curso
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
