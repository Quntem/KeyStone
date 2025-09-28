-- DropForeignKey
ALTER TABLE "domain" DROP CONSTRAINT "domain_creatorId_fkey";

-- AlterTable
ALTER TABLE "domain" ALTER COLUMN "creatorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';

-- AddForeignKey
ALTER TABLE "domain" ADD CONSTRAINT "domain_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
