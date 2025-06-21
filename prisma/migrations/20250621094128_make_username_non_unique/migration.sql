-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';
