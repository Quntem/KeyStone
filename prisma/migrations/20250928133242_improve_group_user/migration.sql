/*
  Warnings:

  - A unique constraint covering the columns `[userId,groupId]` on the table `groupUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';

-- CreateIndex
CREATE UNIQUE INDEX "groupUser_userId_groupId_key" ON "groupUser"("userId", "groupId");
