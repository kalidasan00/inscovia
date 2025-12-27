/*
  Warnings:

  - You are about to drop the column `type` on the `Center` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `InstituteUser` table. All the data in the column will be lost.
  - Added the required column `primaryCategory` to the `Center` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teachingMode` to the `Center` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryCategory` to the `InstituteUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teachingMode` to the `InstituteUser` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeachingMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- DropIndex
DROP INDEX "Center_type_idx";

-- DropIndex
DROP INDEX "InstituteUser_type_idx";

-- AlterTable
ALTER TABLE "Center" DROP COLUMN "type",
ADD COLUMN     "primaryCategory" "CenterCategory" NOT NULL,
ADD COLUMN     "secondaryCategories" "CenterCategory"[] DEFAULT ARRAY[]::"CenterCategory"[],
ADD COLUMN     "teachingMode" "TeachingMode" NOT NULL;

-- AlterTable
ALTER TABLE "InstituteUser" DROP COLUMN "type",
ADD COLUMN     "primaryCategory" "InstituteCategory" NOT NULL,
ADD COLUMN     "secondaryCategories" "InstituteCategory"[] DEFAULT ARRAY[]::"InstituteCategory"[],
ADD COLUMN     "teachingMode" "TeachingMode" NOT NULL;

-- CreateIndex
CREATE INDEX "Center_primaryCategory_idx" ON "Center"("primaryCategory");

-- CreateIndex
CREATE INDEX "Center_teachingMode_idx" ON "Center"("teachingMode");

-- CreateIndex
CREATE INDEX "InstituteUser_primaryCategory_idx" ON "InstituteUser"("primaryCategory");

-- CreateIndex
CREATE INDEX "InstituteUser_teachingMode_idx" ON "InstituteUser"("teachingMode");
