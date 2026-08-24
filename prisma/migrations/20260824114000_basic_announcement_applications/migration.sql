-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AnnouncementApplicationStatus" AS ENUM ('IN_REVIEW', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Announcement"
ADD COLUMN "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "location" TEXT,
ADD COLUMN "spots" INTEGER;

-- Preserve the previous publishedAt-based state for existing announcements.
UPDATE "Announcement"
SET "status" = CASE
  WHEN "publishedAt" IS NULL THEN 'DRAFT'::"AnnouncementStatus"
  ELSE 'PUBLISHED'::"AnnouncementStatus"
END;

UPDATE "Announcement"
SET "status" = 'CLOSED'::"AnnouncementStatus"
WHERE "endsAt" IS NOT NULL AND "endsAt" < CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "AnnouncementApplication" (
  "id" TEXT NOT NULL,
  "announcementId" TEXT NOT NULL,
  "artisanId" TEXT NOT NULL,
  "status" "AnnouncementApplicationStatus" NOT NULL DEFAULT 'IN_REVIEW',
  "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  "reviewNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AnnouncementApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementApplication_announcementId_artisanId_key" ON "AnnouncementApplication"("announcementId", "artisanId");

-- CreateIndex
CREATE INDEX "AnnouncementApplication_artisanId_status_idx" ON "AnnouncementApplication"("artisanId", "status");

-- CreateIndex
CREATE INDEX "AnnouncementApplication_announcementId_status_idx" ON "AnnouncementApplication"("announcementId", "status");

-- CreateIndex
CREATE INDEX "AnnouncementApplication_reviewedById_idx" ON "AnnouncementApplication"("reviewedById");

-- CreateIndex
CREATE INDEX "Announcement_status_idx" ON "Announcement"("status");

-- CreateIndex
CREATE INDEX "Announcement_endsAt_idx" ON "Announcement"("endsAt");

-- AddForeignKey
ALTER TABLE "AnnouncementApplication" ADD CONSTRAINT "AnnouncementApplication_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementApplication" ADD CONSTRAINT "AnnouncementApplication_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementApplication" ADD CONSTRAINT "AnnouncementApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
