-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';

-- AlterTable
ALTER TABLE "tenant" ADD COLUMN     "color" TEXT,
ADD COLUMN     "colorContrast" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "logo" TEXT;
