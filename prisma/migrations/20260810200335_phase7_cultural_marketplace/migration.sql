-- AlterEnum
ALTER TYPE "ProductStatus" ADD VALUE 'UNAVAILABLE';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "culturalMeaning" TEXT,
ADD COLUMN     "inspiration" TEXT,
ADD COLUMN     "process" TEXT,
ADD COLUMN     "tradition" TEXT;
