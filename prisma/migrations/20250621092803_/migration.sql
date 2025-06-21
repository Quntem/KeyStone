/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';

-- CreateIndex
CREATE UNIQUE INDEX "tenant_name_key" ON "tenant"("name");
