-- Add metadata needed by reusable uploads and remote storage cleanup.
ALTER TABLE "File" ADD COLUMN "publicId" TEXT;
ALTER TABLE "File" ADD COLUMN "width" INTEGER;
ALTER TABLE "File" ADD COLUMN "height" INTEGER;
ALTER TABLE "File" ADD COLUMN "altText" TEXT;
ALTER TABLE "File" ADD COLUMN "metadata" JSONB;

CREATE INDEX "File_provider_publicId_idx" ON "File"("provider", "publicId");
