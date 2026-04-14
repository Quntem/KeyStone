/*
  Warnings:

  - You are about to drop the column `type` on the `Device` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DeviceHardwareType" AS ENUM ('LAPTOP', 'PHONE', 'TABLET', 'SERVER', 'OTHER');

-- CreateEnum
CREATE TYPE "DeviceSoftwareType" AS ENUM ('THETAOS', 'ANDROID', 'OTHER');

-- AlterTable
ALTER TABLE "Device" DROP COLUMN "type",
ADD COLUMN     "hardwareType" "DeviceHardwareType" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "softwareType" "DeviceSoftwareType" NOT NULL DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '48 hours';
