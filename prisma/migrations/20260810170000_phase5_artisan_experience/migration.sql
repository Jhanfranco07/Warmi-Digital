-- Phase 5: artisan learning progress timestamps and cultural story fields.
ALTER TABLE "LessonProgress"
ADD COLUMN "startedAt" TIMESTAMP(3),
ADD COLUMN "lastAccessedAt" TIMESTAMP(3);

ALTER TABLE "Story"
ADD COLUMN "publicName" TEXT,
ADD COLUMN "personalStory" TEXT,
ADD COLUMN "artisanJourney" TEXT,
ADD COLUMN "knowledgeOrigin" TEXT,
ADD COLUMN "learnedFrom" TEXT,
ADD COLUMN "techniques" TEXT,
ADD COLUMN "culturalMeaning" TEXT;
