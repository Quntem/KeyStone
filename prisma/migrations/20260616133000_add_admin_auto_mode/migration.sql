-- CreateEnum
CREATE TYPE "AdminAutoMode" AS ENUM ('none', 'auto', 'autohidden');

-- AlterTable
ALTER TABLE "app" ADD COLUMN     "adminAutoMode" "AdminAutoMode" NOT NULL DEFAULT 'none';

-- AlterTable
ALTER TABLE "ExternalAppAccess" ADD COLUMN     "autoCreated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "userAppAccess" ADD COLUMN     "autoCreated" BOOLEAN NOT NULL DEFAULT false;
