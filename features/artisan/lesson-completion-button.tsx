"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { completeLessonAction } from "@/shared/actions/artisan/complete-lesson";
import { Button } from "@/shared/components/ui/button";

type LessonCompletionButtonProps = {
  courseId: string;
  lessonId: string;
  completed?: boolean;
};

export function LessonCompletionButton({
  courseId,
  lessonId,
  completed = false
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
        {isCompleted ? "Leccion completada" : "Marcar como completada"}
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
    </div>
  );
}
