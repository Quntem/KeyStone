-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';

-- CreateTable
CREATE TABLE "userAppSession" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAppAccessId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "userAppSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "userAppSession" ADD CONSTRAINT "userAppSession_userAppAccessId_fkey" FOREIGN KEY ("userAppAccessId") REFERENCES "userAppAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userAppSession" ADD CONSTRAINT "userAppSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
