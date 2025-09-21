-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('Organizational', 'Functional');

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';

-- CreateTable
CREATE TABLE "group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GroupType" NOT NULL DEFAULT 'Organizational',

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groupUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "groupUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_name_key" ON "group"("name");

-- AddForeignKey
ALTER TABLE "groupUser" ADD CONSTRAINT "groupUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupUser" ADD CONSTRAINT "groupUser_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
