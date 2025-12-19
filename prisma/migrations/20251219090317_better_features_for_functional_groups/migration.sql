/*
  Warnings:

  - You are about to drop the `AppPersonalUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AppPersonalUser" DROP CONSTRAINT "AppPersonalUser_appId_fkey";

-- DropForeignKey
ALTER TABLE "AppPersonalUser" DROP CONSTRAINT "AppPersonalUser_userId_fkey";

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "domainId" TEXT,
ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';

-- AlterTable
ALTER TABLE "tenant" ADD COLUMN     "allowGroupCreation" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "AppPersonalUser";

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;
