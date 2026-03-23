/*
  Warnings:

  - Added the required column `enrollmentToken` to the `MdmServer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unenrollmentUrl` to the `MdmServer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MdmServer" ADD COLUMN     "enrollmentToken" TEXT NOT NULL,
ADD COLUMN     "unenrollmentUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '48 hours';
