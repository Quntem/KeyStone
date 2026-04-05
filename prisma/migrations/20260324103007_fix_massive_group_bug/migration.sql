/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,serialNumber]` on the table `Device` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,groupname]` on the table `group` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "group_groupname_key";

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "serialNumber" TEXT;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '48 hours';

-- CreateIndex
CREATE UNIQUE INDEX "Device_tenantId_serialNumber_key" ON "Device"("tenantId", "serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_username_key" ON "User"("tenantId", "username");

-- CreateIndex
CREATE UNIQUE INDEX "group_tenantId_groupname_key" ON "group"("tenantId", "groupname");
