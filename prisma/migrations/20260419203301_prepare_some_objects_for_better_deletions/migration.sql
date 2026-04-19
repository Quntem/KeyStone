-- DropForeignKey
ALTER TABLE "DeviceGroup" DROP CONSTRAINT "DeviceGroup_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceGroup" DROP CONSTRAINT "DeviceGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "groupUser" DROP CONSTRAINT "groupUser_groupId_fkey";

-- DropForeignKey
ALTER TABLE "groupUser" DROP CONSTRAINT "groupUser_userId_fkey";

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '48 hours';

-- AddForeignKey
ALTER TABLE "groupUser" ADD CONSTRAINT "groupUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupUser" ADD CONSTRAINT "groupUser_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceGroup" ADD CONSTRAINT "DeviceGroup_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceGroup" ADD CONSTRAINT "DeviceGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
