/*
  Warnings:

  - A unique constraint covering the columns `[groupname]` on the table `group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupname` to the `group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `group` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "group_name_key";

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "description" TEXT,
ADD COLUMN     "groupname" TEXT NOT NULL,
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';

-- CreateIndex
CREATE UNIQUE INDEX "group_groupname_key" ON "group"("groupname");

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
