/*
  Warnings:

  - Made the column `secret` on table `app` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "app" ALTER COLUMN "secret" SET NOT NULL;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';
