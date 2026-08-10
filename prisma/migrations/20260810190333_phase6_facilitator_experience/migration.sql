-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'EXCUSED');

-- CreateEnum
CREATE TYPE "FollowUpType" AS ENUM ('ACADEMIC', 'DIGITAL', 'COMMERCIAL', 'PERSONAL', 'WORKSHOP', 'OTHER');

-- CreateEnum
CREATE TYPE "FollowUpPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "FacilitatorAssignmentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('FAIR', 'CONTEST', 'TRAINING', 'PROGRAM', 'OTHER');

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "institution" TEXT,
ADD COLUMN     "officialUrl" TEXT,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "type" "AnnouncementType" NOT NULL DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "recordedById" TEXT,
ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'ABSENT';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "durationMin" INTEGER,
ADD COLUMN     "facilitatorId" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "communityId" TEXT,
ADD COLUMN     "materials" TEXT;

-- CreateTable
CREATE TABLE "FacilitatorAssignment" (
    "id" TEXT NOT NULL,
    "facilitatorId" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "communityId" TEXT,
    "status" "FacilitatorAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilitatorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtisanFollowUp" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "facilitatorId" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "FollowUpType" NOT NULL,
    "observation" TEXT NOT NULL,
    "difficulty" TEXT,
    "recommendation" TEXT,
    "commitment" TEXT,
    "nextFollowUpAt" TIMESTAMP(3),
    "priority" "FollowUpPriority" NOT NULL DEFAULT 'MEDIUM',
    "outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtisanFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FacilitatorAssignment_facilitatorId_status_idx" ON "FacilitatorAssignment"("facilitatorId", "status");

-- CreateIndex
CREATE INDEX "FacilitatorAssignment_artisanId_status_idx" ON "FacilitatorAssignment"("artisanId", "status");

-- CreateIndex
CREATE INDEX "FacilitatorAssignment_communityId_idx" ON "FacilitatorAssignment"("communityId");

-- CreateIndex
CREATE UNIQUE INDEX "FacilitatorAssignment_facilitatorId_artisanId_key" ON "FacilitatorAssignment"("facilitatorId", "artisanId");

-- CreateIndex
CREATE INDEX "ArtisanFollowUp_assignmentId_occurredAt_idx" ON "ArtisanFollowUp"("assignmentId", "occurredAt");

-- CreateIndex
CREATE INDEX "ArtisanFollowUp_facilitatorId_occurredAt_idx" ON "ArtisanFollowUp"("facilitatorId", "occurredAt");

-- CreateIndex
CREATE INDEX "ArtisanFollowUp_artisanId_occurredAt_idx" ON "ArtisanFollowUp"("artisanId", "occurredAt");

-- CreateIndex
CREATE INDEX "ArtisanFollowUp_priority_idx" ON "ArtisanFollowUp"("priority");

-- CreateIndex
CREATE INDEX "Announcement_type_idx" ON "Announcement"("type");

-- CreateIndex
CREATE INDEX "Attendance_recordedById_idx" ON "Attendance"("recordedById");

-- CreateIndex
CREATE INDEX "Course_facilitatorId_idx" ON "Course"("facilitatorId");

-- CreateIndex
CREATE INDEX "Workshop_communityId_idx" ON "Workshop"("communityId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workshop" ADD CONSTRAINT "Workshop_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilitatorAssignment" ADD CONSTRAINT "FacilitatorAssignment_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilitatorAssignment" ADD CONSTRAINT "FacilitatorAssignment_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilitatorAssignment" ADD CONSTRAINT "FacilitatorAssignment_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtisanFollowUp" ADD CONSTRAINT "ArtisanFollowUp_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "FacilitatorAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtisanFollowUp" ADD CONSTRAINT "ArtisanFollowUp_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtisanFollowUp" ADD CONSTRAINT "ArtisanFollowUp_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
