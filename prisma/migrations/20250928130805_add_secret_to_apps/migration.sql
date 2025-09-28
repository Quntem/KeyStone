-- AlterTable
ALTER TABLE "app" ADD COLUMN     "secret" TEXT;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';
