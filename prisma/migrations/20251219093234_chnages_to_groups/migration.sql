-- AlterTable
ALTER TABLE "group" ADD COLUMN     "adminCreated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';
