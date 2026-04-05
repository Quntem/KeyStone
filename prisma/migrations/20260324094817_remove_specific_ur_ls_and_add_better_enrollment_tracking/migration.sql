/*
  Warnings:

  - You are about to drop the column `enrollmentUrl` on the `MdmServer` table. All the data in the column will be lost.
  - You are about to drop the column `unenrollmentUrl` on the `MdmServer` table. All the data in the column will be lost.
  - Added the required column `enrolledById` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "enrolledById" TEXT NOT NULL,
ADD COLUMN     "isSelfEnrolled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MdmServer" DROP COLUMN "enrollmentUrl",
DROP COLUMN "unenrollmentUrl";

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '48 hours';

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_enrolledById_fkey" FOREIGN KEY ("enrolledById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
