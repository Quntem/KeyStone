-- AlterTable
ALTER TABLE "User" ADD COLUMN     "domainId" TEXT;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;
