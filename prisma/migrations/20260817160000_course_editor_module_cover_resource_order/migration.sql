-- Add optional module cover for the facilitator course editor.

-- AlterTable
ALTER TABLE "Module"
ADD COLUMN "coverFileId" TEXT;

-- AddForeignKey
ALTER TABLE "Module"
ADD CONSTRAINT "Module_coverFileId_fkey"
FOREIGN KEY ("coverFileId")
REFERENCES "File"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Module_coverFileId_idx"
ON "Module"("coverFileId");