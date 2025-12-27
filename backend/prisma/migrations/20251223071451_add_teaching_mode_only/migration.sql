-- Create TeachingMode enum
CREATE TYPE "TeachingMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- Add teachingMode to InstituteUser
ALTER TABLE "InstituteUser"
ADD COLUMN "teachingMode" "TeachingMode" NOT NULL DEFAULT 'OFFLINE';

-- Add teachingMode to Center
ALTER TABLE "Center"
ADD COLUMN "teachingMode" "TeachingMode" NOT NULL DEFAULT 'OFFLINE';

-- Add secondaryCategories to InstituteUser
ALTER TABLE "InstituteUser"
ADD COLUMN "secondaryCategories" "InstituteCategory"[] DEFAULT ARRAY[]::"InstituteCategory"[];

-- Add secondaryCategories to Center
ALTER TABLE "Center"
ADD COLUMN "secondaryCategories" "CenterCategory"[] DEFAULT ARRAY[]::"CenterCategory"[];

-- Create indexes
CREATE INDEX "InstituteUser_teachingMode_idx" ON "InstituteUser"("teachingMode");
CREATE INDEX "Center_teachingMode_idx" ON "Center"("teachingMode");