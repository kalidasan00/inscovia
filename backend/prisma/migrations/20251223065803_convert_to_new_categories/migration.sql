-- CreateEnum
CREATE TYPE "InstituteCategory" AS ENUM ('TECHNOLOGY', 'MANAGEMENT', 'SKILL_DEVELOPMENT', 'EXAM_COACHING');
CREATE TYPE "CenterCategory" AS ENUM ('TECHNOLOGY', 'MANAGEMENT', 'SKILL_DEVELOPMENT', 'EXAM_COACHING');
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INSTITUTE', 'USER');

-- Step 1: Add new temporary columns with enum types
ALTER TABLE "InstituteUser" ADD COLUMN "type_new" "InstituteCategory";
ALTER TABLE "InstituteUser" ADD COLUMN "role_new" "UserRole";
ALTER TABLE "Center" ADD COLUMN "type_new" "CenterCategory";

-- Step 2: Convert existing data to new enum values for InstituteUser
UPDATE "InstituteUser"
SET "type_new" = CASE
  WHEN "type" ILIKE '%technology%' OR "type" ILIKE '%tech%' OR "type" ILIKE '%IT%' OR "type" ILIKE '%software%' OR "type" ILIKE '%coding%' THEN 'TECHNOLOGY'::"InstituteCategory"
  WHEN "type" ILIKE '%management%' OR "type" ILIKE '%MBA%' OR "type" ILIKE '%business%' THEN 'MANAGEMENT'::"InstituteCategory"
  WHEN "type" ILIKE '%coaching%' OR "type" ILIKE '%exam%' OR "type" ILIKE '%competitive%' THEN 'EXAM_COACHING'::"InstituteCategory"
  ELSE 'SKILL_DEVELOPMENT'::"InstituteCategory"
END;

-- Step 3: Convert role data
UPDATE "InstituteUser"
SET "role_new" = CASE
  WHEN "role" = 'ADMIN' THEN 'ADMIN'::"UserRole"
  WHEN "role" = 'INSTITUTE' THEN 'INSTITUTE'::"UserRole"
  ELSE 'INSTITUTE'::"UserRole"
END;

-- Step 4: Convert existing data to new enum values for Center
UPDATE "Center"
SET "type_new" = CASE
  WHEN "type" ILIKE '%technology%' OR "type" ILIKE '%tech%' OR "type" ILIKE '%IT%' OR "type" ILIKE '%software%' OR "type" ILIKE '%coding%' THEN 'TECHNOLOGY'::"CenterCategory"
  WHEN "type" ILIKE '%management%' OR "type" ILIKE '%MBA%' OR "type" ILIKE '%business%' THEN 'MANAGEMENT'::"CenterCategory"
  WHEN "type" ILIKE '%coaching%' OR "type" ILIKE '%exam%' OR "type" ILIKE '%competitive%' THEN 'EXAM_COACHING'::"CenterCategory"
  ELSE 'SKILL_DEVELOPMENT'::"CenterCategory"
END;

-- Step 5: Drop old columns
ALTER TABLE "InstituteUser" DROP COLUMN "type";
ALTER TABLE "InstituteUser" DROP COLUMN "role";
ALTER TABLE "Center" DROP COLUMN "type";

-- Step 6: Rename new columns to original names
ALTER TABLE "InstituteUser" RENAME COLUMN "type_new" TO "type";
ALTER TABLE "InstituteUser" RENAME COLUMN "role_new" TO "role";
ALTER TABLE "Center" RENAME COLUMN "type_new" TO "type";

-- Step 7: Set NOT NULL constraints
ALTER TABLE "InstituteUser" ALTER COLUMN "type" SET NOT NULL;
ALTER TABLE "InstituteUser" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "Center" ALTER COLUMN "type" SET NOT NULL;

-- Step 8: Set default for role
ALTER TABLE "InstituteUser" ALTER COLUMN "role" SET DEFAULT 'INSTITUTE';

-- Step 9: Create indexes
CREATE INDEX "InstituteUser_type_idx" ON "InstituteUser"("type");
CREATE INDEX "InstituteUser_role_idx" ON "InstituteUser"("role");
CREATE INDEX "Center_type_idx" ON "Center"("type");