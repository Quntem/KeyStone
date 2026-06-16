/*
  Warnings:

  - The `includeAll` column on the `group` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
ALTER TYPE "MagicGroupConditionTargetType" ADD VALUE 'Both';

-- AlterTable
ALTER TABLE "group" DROP COLUMN "includeAll",
ADD COLUMN     "includeAll" "MagicGroupConditionTargetType";

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '48 hours';
