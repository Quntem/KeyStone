-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('Organization', 'Team');

-- AlterTable
ALTER TABLE "app" ADD COLUMN     "availableForExternal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicExternal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';

-- AlterTable
ALTER TABLE "tenant" ADD COLUMN     "type" "TenantType" NOT NULL DEFAULT 'Organization';

-- CreateTable
CREATE TABLE "ExternalAppAccess" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalAppAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalAppAccess_appId_tenantId_key" ON "ExternalAppAccess"("appId", "tenantId");

-- AddForeignKey
ALTER TABLE "ExternalAppAccess" ADD CONSTRAINT "ExternalAppAccess_appId_fkey" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAppAccess" ADD CONSTRAINT "ExternalAppAccess_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
