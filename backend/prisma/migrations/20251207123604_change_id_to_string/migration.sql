/*
  Warnings:

  - The primary key for the `Center` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `city` to the `Center` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `Center` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Center` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Center" DROP CONSTRAINT "Center_pkey",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "rating" SET DEFAULT 0,
ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "logo" DROP NOT NULL,
ADD CONSTRAINT "Center_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Center_id_seq";

-- CreateIndex
CREATE INDEX "Center_state_district_city_idx" ON "Center"("state", "district", "city");

-- CreateIndex
CREATE INDEX "Center_userId_idx" ON "Center"("userId");
