-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SERVICE';

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';
