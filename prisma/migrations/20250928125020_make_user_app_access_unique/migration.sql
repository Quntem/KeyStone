/*
  Warnings:

  - A unique constraint covering the columns `[userId,appId]` on the table `userAppAccess` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';

-- CreateIndex
CREATE UNIQUE INDEX "userAppAccess_userId_appId_key" ON "userAppAccess"("userId", "appId");
