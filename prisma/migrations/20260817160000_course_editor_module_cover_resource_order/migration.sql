-- Add optional module covers for the facilitator course editor.
ALTER TABLE "Module" ADD COLUMN "coverFileId" TEXT;

-- Keep lesson resources sortable inside each lesson.
ALTER TABLE "LessonFile" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "Module_coverFileId_idx" ON "Module"("coverFileId");
CREATE INDEX "LessonFile_lessonId_order_idx" ON "LessonFile"("lessonId", "order");

ALTER TABLE "Module"
  ADD CONSTRAINT "Module_coverFileId_fkey"
  FOREIGN KEY ("coverFileId") REFERENCES "File"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
