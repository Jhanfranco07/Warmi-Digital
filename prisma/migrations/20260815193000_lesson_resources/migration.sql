-- CreateEnum
CREATE TYPE "LessonResourceType" AS ENUM ('VIDEO_YOUTUBE', 'VIDEO_UPLOAD', 'IMAGE', 'PDF', 'DOCUMENT', 'AUDIO', 'EXTERNAL_LINK');

-- AlterTable
ALTER TABLE "LessonFile"
ADD COLUMN "type" "LessonResourceType" NOT NULL DEFAULT 'DOCUMENT',
ADD COLUMN "title" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "provider" TEXT,
ADD COLUMN "externalId" TEXT,
ADD COLUMN "originalUrl" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "LessonFile"
SET
  "title" = COALESCE("File"."altText", 'Material de apoyo'),
  "type" = CASE
    WHEN "File"."type" = 'IMAGE' THEN 'IMAGE'::"LessonResourceType"
    WHEN "File"."type" = 'VIDEO' THEN 'VIDEO_UPLOAD'::"LessonResourceType"
    WHEN "File"."type" = 'AUDIO' THEN 'AUDIO'::"LessonResourceType"
    WHEN "File"."mimeType" = 'application/pdf' THEN 'PDF'::"LessonResourceType"
    ELSE 'DOCUMENT'::"LessonResourceType"
  END
FROM "File"
WHERE "LessonFile"."fileId" = "File"."id";

UPDATE "LessonFile"
SET "title" = 'Material de apoyo'
WHERE "title" IS NULL;

ALTER TABLE "LessonFile"
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "fileId" DROP NOT NULL;

-- DropIndex
DROP INDEX IF EXISTS "LessonFile_lessonId_fileId_key";

-- CreateIndex
CREATE INDEX "LessonFile_lessonId_position_idx" ON "LessonFile"("lessonId", "position");

-- CreateIndex
CREATE INDEX "LessonFile_type_idx" ON "LessonFile"("type");
