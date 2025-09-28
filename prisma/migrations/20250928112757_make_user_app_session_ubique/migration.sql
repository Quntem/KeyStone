/*
  Warnings:

  - A unique constraint covering the columns `[userAppAccessId,sessionId]` on the table `userAppSession` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';

-- CreateIndex
CREATE UNIQUE INDEX "userAppSession_userAppAccessId_sessionId_key" ON "userAppSession"("userAppAccessId", "sessionId");
