/*
  Warnings:

  - Added the required column `mainUrl` to the `app` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "app" ADD COLUMN     "mainUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';
