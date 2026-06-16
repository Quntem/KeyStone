-- AlterTable
ALTER TABLE "OrgRole" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "department" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "location" ADD COLUMN     "description" TEXT,
ADD COLUMN     "address" TEXT;
