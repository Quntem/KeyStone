-- CreateEnum
CREATE TYPE "MagicGroupConditionTargetType" AS ENUM ('User', 'Device');

-- CreateEnum
CREATE TYPE "MagicGroupConditionAttributeType" AS ENUM ('Email', 'Departments', 'Tags', 'OrgRole', 'Status', 'Location');

-- CreateEnum
CREATE TYPE "MagicGroupConditionOperatorType" AS ENUM ('Equals', 'NotEquals', 'Contains', 'NotContains', 'StartsWith', 'EndsWith', 'Includes');

-- AlterEnum
ALTER TYPE "GroupType" ADD VALUE 'Magic';

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "extraInfo" JSONB,
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "includeAll" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '48 hours';

-- AlterTable
ALTER TABLE "userAppSession" ADD COLUMN     "groupAppAccessId" TEXT,
ALTER COLUMN "userAppAccessId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OrgRoleUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgRoleId" TEXT NOT NULL,

    CONSTRAINT "OrgRoleUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "OrgRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicGroupCondition" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "targetType" "MagicGroupConditionTargetType" NOT NULL,
    "attribute" "MagicGroupConditionAttributeType" NOT NULL,
    "operator" "MagicGroupConditionOperatorType" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "MagicGroupCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "DepartmentUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupAppAccess" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupAppAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupAppAccess_groupId_appId_key" ON "GroupAppAccess"("groupId", "appId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRoleUser" ADD CONSTRAINT "OrgRoleUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRoleUser" ADD CONSTRAINT "OrgRoleUser_orgRoleId_fkey" FOREIGN KEY ("orgRoleId") REFERENCES "OrgRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicGroupCondition" ADD CONSTRAINT "MagicGroupCondition_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentUser" ADD CONSTRAINT "DepartmentUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentUser" ADD CONSTRAINT "DepartmentUser_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupAppAccess" ADD CONSTRAINT "GroupAppAccess_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupAppAccess" ADD CONSTRAINT "GroupAppAccess_appId_fkey" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userAppSession" ADD CONSTRAINT "userAppSession_groupAppAccessId_fkey" FOREIGN KEY ("groupAppAccessId") REFERENCES "GroupAppAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
