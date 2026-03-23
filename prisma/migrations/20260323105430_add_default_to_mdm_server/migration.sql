/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,isDefault]` on the table `MdmServer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MdmServer" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '48 hours';

-- CreateIndex
CREATE UNIQUE INDEX "MdmServer_tenantId_isDefault_key" ON "MdmServer"("tenantId", "isDefault");
