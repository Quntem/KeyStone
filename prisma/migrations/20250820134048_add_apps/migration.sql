-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';

-- CreateTable
CREATE TABLE "app" (
    "id" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "allowedURLs" TEXT[],

    CONSTRAINT "app_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userAppAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userAppAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_name_key" ON "app"("name");

-- AddForeignKey
ALTER TABLE "app" ADD CONSTRAINT "app_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userAppAccess" ADD CONSTRAINT "userAppAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userAppAccess" ADD CONSTRAINT "userAppAccess_appId_fkey" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
